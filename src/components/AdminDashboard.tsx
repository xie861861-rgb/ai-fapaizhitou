import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Database, Activity, MessageSquare, Shield, Search, ChevronRight, Save, Play, RefreshCw, AlertCircle, CheckCircle2, Globe, Users, FileText, TrendingUp, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { api, Property, Analysis } from '../lib/api';

// 登录表单组件
const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 简单验证 - 实际应该调用后端API
    if (username === 'admin' && password === 'admin123') {
      onSuccess();
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-background-dark p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-black">管理后台登录</h2>
          <p className="text-slate-500 text-sm">请输入管理员凭据以访问系统中枢</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">用户名</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">密码</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-rose-500 font-bold text-center"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            立即登录
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-400">
          测试账号: admin / admin123
        </p>
      </motion.div>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({ title, value, icon: Icon, trend, color }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: string;
  color?: string;
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("size-12 rounded-2xl flex items-center justify-center", color || 'bg-primary/10')}>
        <Icon size={24} className={color?.replace('bg-', 'text-') || 'text-primary'} />
      </div>
      {trend && (
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-3xl font-black">{value}</p>
    <p className="text-sm text-slate-500 font-bold">{title}</p>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'users' | 'analyses'>('overview');
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalAnalyses: 0,
    activeUsers: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const [props, analysesData] = await Promise.all([
        api.getProperties({ limit: 100 }),
        api.getAnalysisHistory(),
      ]);
      setProperties(props);
      setAnalyses(analysesData);
      setStats({
        totalProperties: props.length,
        totalUsers: 1, // 简化处理
        totalAnalyses: analysesData.length,
        activeUsers: 1,
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <LoginForm onSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-background-dark">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black">管理后台</h2>
            <p className="text-slate-500">支撑业务运营、模型调优和积分商业化落地的"神经中枢"</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 刷新
            </button>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-all"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
          {[
            { id: 'overview', label: '数据概览', icon: TrendingUp },
            { id: 'properties', label: '房产管理', icon: Package },
            { id: 'users', label: '用户管理', icon: Users },
            { id: 'analyses', label: '分析记录', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <StatCard 
                title="房产总数" 
                value={stats.totalProperties} 
                icon={Package} 
                trend="+12%"
                color="bg-blue-500/10 text-blue-500"
              />
              <StatCard 
                title="注册用户" 
                value={stats.totalUsers} 
                icon={Users} 
                color="bg-purple-500/10 text-purple-500"
              />
              <StatCard 
                title="分析次数" 
                value={stats.totalAnalyses} 
                icon={Activity} 
                color="bg-emerald-500/10 text-emerald-500"
              />
              <StatCard 
                title="活跃用户" 
                value={stats.activeUsers} 
                icon={TrendingUp} 
                color="bg-amber-500/10 text-amber-500"
              />
            </div>

            {/* Recent Analyses */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold">最近分析记录</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {analyses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">暂无分析记录</div>
                ) : (
                  analyses.slice(0, 5).map((analysis, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div>
                        <p className="font-bold">房产 ID: {analysis.property_id}</p>
                        <p className="text-sm text-slate-500">AI预测价格: ¥{(analysis.ai_predicted_price / 10000).toFixed(0)}万</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          analysis.risk_level === 'low' ? "bg-emerald-500/10 text-emerald-500" :
                          analysis.risk_level === 'medium' ? "bg-amber-500/10 text-amber-500" :
                          "bg-rose-500/10 text-rose-500"
                        )}>
                          风险: {analysis.risk_level}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">{new Date(analysis.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">房产管理</h3>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
                添加房产
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">ID</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">标题</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">价格</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">状态</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">风险</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold">{property.id}</td>
                      <td className="p-4">
                        <p className="font-bold truncate max-w-xs">{property.title}</p>
                        <p className="text-xs text-slate-400">{property.location}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-primary">¥{(property.starting_price / 10000).toFixed(0)}万</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                          {property.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          property.risk_level === 'low' ? "bg-emerald-500/10 text-emerald-500" :
                          property.risk_level === 'medium' ? "bg-amber-500/10 text-amber-500" :
                          "bg-rose-500/10 text-rose-500"
                        )}>
                          {property.risk_level}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-primary text-sm font-bold hover:underline">
                          编辑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold mb-2">用户管理</h3>
            <p className="text-slate-500">用户管理功能开发中...</p>
          </div>
        )}

        {/* Analyses Tab */}
        {activeTab === 'analyses' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold">分析记录</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {analyses.length === 0 ? (
                <div className="p-8 text-center text-slate-400">暂无分析记录</div>
              ) : (
                analyses.map((analysis, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">房产 ID: {analysis.property_id}</span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        analysis.risk_level === 'low' ? "bg-emerald-500/10 text-emerald-500" :
                        analysis.risk_level === 'medium' ? "bg-amber-500/10 text-amber-500" :
                        "bg-rose-500/10 text-rose-500"
                      )}>
                        {analysis.risk_level}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">AI预测价格</p>
                        <p className="font-bold">¥{(analysis.ai_predicted_price / 10000).toFixed(0)}万</p>
                      </div>
                      <div>
                        <p className="text-slate-400">投资评分</p>
                        <p className="font-bold">{analysis.investment_rating}/5</p>
                      </div>
                      <div>
                        <p className="text-slate-400">风险因素</p>
                        <p className="font-bold">{analysis.risk_factors?.length || 0} 项</p>
                      </div>
                      <div>
                        <p className="text-slate-400">分析时间</p>
                        <p className="font-bold">{new Date(analysis.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
