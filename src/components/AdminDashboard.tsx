import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Database, Activity, MessageSquare, Shield, Search, ChevronRight, Save, Play, RefreshCw, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'agents' | 'rag' | 'stats' | 'llm'>('agents');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('用户名或密码错误');
    }
  };

  if (!isLoggedIn) {
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-background-dark">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black">管理后台 (Admin Dashboard)</h2>
            <p className="text-slate-500">支撑业务运营、模型调优和积分商业化落地的“神经中枢”</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold">
              <RefreshCw size={16} /> 刷新缓存
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20">
              <Save size={16} /> 保存全局配置
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: '今日解析量', value: '1,284', change: '+12%', icon: <Activity className="text-blue-500" /> },
            { label: '研判准确率', value: '98.4%', change: '+0.5%', icon: <Shield className="text-green-500" /> },
            { label: '积分发放量', value: '45,200', change: '+8%', icon: <Database className="text-amber-500" /> },
            { label: '成交预测偏离度', value: '≤ 8.2%', change: '-1.2%', icon: <Activity className="text-rose-500" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  {stat.icon}
                </div>
                <span className={cn(
                  "text-xs font-bold",
                  stat.change.startsWith('+') ? "text-green-500" : "text-rose-500"
                )}>
                  {stat.change}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'agents', label: '智能体编排 (MCP)', icon: <Settings size={18} /> },
            { id: 'llm', label: '大模型与 API 设置', icon: <Globe size={18} /> },
            { id: 'rag', label: '法拍知识库 (RAG)', icon: <Database size={18} /> },
            { id: 'stats', label: '运营与监控', icon: <Activity size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "pb-4 flex items-center gap-2 text-sm font-bold transition-all relative",
                activeTab === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'llm' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                  <h4 className="font-bold flex items-center gap-2">
                    <Globe className="text-primary" size={18} />
                    大模型厂商配置 (主/备切换)
                  </h4>
                  <div className="space-y-4">
                    {[
                      { name: 'GPT-4o (主研判)', provider: 'OpenAI', status: 'Active', latency: '1.2s' },
                      { name: 'DeepSeek-V3 (备选/低成本)', provider: 'DeepSeek', status: 'Active', latency: '0.8s' },
                      { name: 'Qwen-Max (国内增强)', provider: 'Alibaba', status: 'Standby', latency: '0.9s' },
                      { name: 'Baichuan-4 (备选)', provider: 'Baichuan', status: 'Standby', latency: '1.1s' },
                    ].map((model, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-700">
                            {model.provider[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{model.name}</p>
                            <p className="text-[10px] text-slate-400">{model.provider} • 延迟: {model.latency}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded",
                            model.status === 'Active' ? "bg-green-500/10 text-green-500" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                          )}>
                            {model.status}
                          </span>
                          <button className="text-[10px] font-bold text-primary">配置 Key</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                  <h4 className="font-bold flex items-center gap-2">
                    <Settings className="text-primary" size={18} />
                    API 工具与 Skill 管理
                  </h4>
                  <div className="space-y-4">
                    {[
                      { name: 'OCR 文字识别', type: 'Vision', usage: '84%' },
                      { name: '网页爬虫 (阿里/京东)', type: 'Crawler', usage: '92%' },
                      { name: '银行估值计算器', type: 'Tool', usage: '45%' },
                      { name: '高德地图 API', type: 'LBS', usage: '67%' },
                    ].map((tool, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold">{tool.name}</span>
                          <span className="text-slate-400">{tool.usage} 额度已用</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: tool.usage }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs font-bold hover:border-primary/50 hover:text-primary transition-all">
                    + 添加新 API 插件
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'agents' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">子智能体列表</h3>
                {[
                  'PDF 解析专家',
                  '链接抓取专家',
                  '风险研判专家',
                  '估值测算专家',
                  '竞拍辅助专家',
                  '税费测算专家'
                ].map((agent, i) => (
                  <div key={i} className={cn(
                    "p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                    i === 2 ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn("size-2 rounded-full", i === 2 ? "bg-primary" : "bg-slate-300")} />
                      <span className="text-sm font-bold">{agent}</span>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">风险研判专家 - System Prompt (v2.4.1)</h4>
                    <div className="flex gap-2">
                      <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded">已发布</span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">灰度 20%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">提示词编辑器</label>
                    <textarea 
                      className="w-full h-64 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-sm focus:ring-primary"
                      defaultValue={`# Role: 风险研判专家
# Task: 评估法拍房过户与腾退可行性

## Input Variables:
- {pdf_data}: PDF 结构化解析结果
- {link_data}: 网页抓取实时数据

## Logic:
1. 分析是否存在“轮候查封”或“多重抵押”
2. 评估“带租拍卖”对腾退的影响
3. 输出 1-5 星难度评级...`}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Temperature:</span>
                        <input type="range" className="w-24 accent-primary" defaultValue="30" />
                        <span className="text-xs font-bold">0.3</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">测试运行</button>
                      <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold">发布新版本</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rag' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">业务知识库 (RAG) 管理</h3>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                  <Play size={14} /> 重新索引全库
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <span className="text-sm font-bold">政策法规库</span>
                    <button className="text-xs text-primary font-bold">+ 上传文档</button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { name: '2024上海法拍限购政策汇总.pdf', size: '1.2MB', status: '已向量化' },
                      { name: '最高法院关于法拍腾退的执行惯例.docx', size: '450KB', status: '已向量化' },
                      { name: '各省市契税税率对照表_v2.xlsx', size: '89KB', status: '待更新' },
                    ].map((doc, i) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Database size={16} className="text-slate-400" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-[10px] text-slate-400">{doc.size}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded",
                          doc.status === '已向量化' ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                  <h4 className="font-bold flex items-center gap-2">
                    <AlertCircle className="text-rose-500" size={18} />
                    Bad Case 标注队列
                  </h4>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">用户反馈：估值偏高</span>
                          <span className="text-[10px] text-slate-400">2024.05.12 10:20</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">“AI 预测成交价 1200万，但该小区上周刚成交一套同户型仅 1050万。”</p>
                        <div className="flex justify-end gap-2">
                          <button className="text-[10px] font-bold text-primary hover:underline">进入标注界面</button>
                          <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600">忽略</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
