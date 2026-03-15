import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, History, Star, ChevronRight, Gift, Zap, ShieldCheck, CreditCard, CheckCircle2, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { api, User as UserType, getStoredUser } from '../lib/api';

interface ResetPasswordForm {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface RechargePackage {
  id: string;
  name: string;
  price: number;
  points: number;
  reports: number;
  tag?: string;
  popular?: boolean;
}

const PACKAGES: RechargePackage[] = [
  { id: '1', name: '单次尝鲜包', price: 19, points: 200, reports: 3, tag: '适合新手' },
  { id: '2', name: '投资进阶包', price: 48, points: 500, reports: 8, popular: true, tag: '超值推荐' },
  { id: '3', name: '机构专业包', price: 96, points: 1200, reports: 20, tag: '大户首选' },
];

// 登录表单组件
const LoginForm = ({ onSuccess, onSwitchToRegister }: { onSuccess: (user: UserType, token: string) => void; onSwitchToRegister: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await api.login(email, password);
      onSuccess(result.user, result.token);
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-black">登录账号</h2>
        <p className="text-slate-500 text-sm">登录后享受更多会员权益</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">邮箱</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
            placeholder="your@email.com"
            required
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
            required
          />
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
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {loading ? '登录中...' : '立即登录'}
        </button>
      </form>

      <div className="flex justify-between text-sm">
        <button onClick={onSwitchToRegister} className="text-primary font-bold hover:underline">
          立即注册
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('openForgotPassword'))} className="text-slate-400 hover:text-primary">
          忘记密码？
        </button>
      </div>
    </motion.div>
  );
};

// 注册表单组件
const RegisterForm = ({ onSuccess, onSwitchToLogin }: { onSuccess: (user: UserType, token: string) => void; onSwitchToLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.register(username, email, password);
      // 注册成功后自动登录
      const loginResult = await api.login(email, password);
      onSuccess(loginResult.user, loginResult.token);
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-black">注册账号</h2>
        <p className="text-slate-500 text-sm">注册送100积分，新人专属</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">用户名</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
            placeholder="设置用户名"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">邮箱</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
            placeholder="your@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">密码</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
            placeholder="设置密码（至少6位）"
            minLength={6}
            required
          />
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
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {loading ? '注册中...' : '立即注册'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        已有账号？ 
        <button onClick={onSwitchToLogin} className="text-primary font-bold hover:underline">
          立即登录
        </button>
      </p>
    </motion.div>
  );
};

// 忘记密码表单组件
const ForgotPasswordForm = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.sendResetCode(email);
      setSuccess('验证码已发送到您的邮箱');
      setStep('code');
    } catch (err: any) {
      setError(err.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    if (newPassword.length < 6) {
      setError('密码至少6位');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(email, code, newPassword);
      setSuccess('密码重置成功！');
      setTimeout(onBack, 2000);
    } catch (err: any) {
      setError(err.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
          <Zap size={32} />
        </div>
        <h2 className="text-2xl font-black">
          {step === 'email' && '找回密码'}
          {step === 'code' && '输入验证码'}
          {step === 'reset' && '重置密码'}
        </h2>
        <p className="text-slate-500 text-sm">
          {step === 'email' && '请输入注册邮箱'}
          {step === 'code' && '请输入邮箱收到的验证码'}
          {step === 'reset' && '设置您的新密码'}
        </p>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-500 font-bold text-center">
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-500 font-bold text-center">
          {success}
        </motion.p>
      )}

      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">邮箱</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
              placeholder="your@email.com"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50">
            {loading ? '发送中...' : '发送验证码'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={(e) => { e.preventDefault(); setStep('reset'); }} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">验证码</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
              placeholder="6位验证码"
              maxLength={6}
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            下一步
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">新密码</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
              placeholder="至少6位"
              minLength={6}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">确认密码</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
              placeholder="再次输入新密码"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50">
            {loading ? '处理中...' : '确认重置'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-slate-500">
        <button onClick={onBack} className="text-primary font-bold hover:underline">
          返回登录
        </button>
      </p>
    </motion.div>
  );
};

export const MemberCenter: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [showAuth, setShowAuth] = useState<'login' | 'register' | 'forgot' | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'recharge' | 'fission'>('profile');
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);

  const checkAuth = async () => {
    try {
      // 先检查本地存储的用户
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
      // 再从服务器获取最新信息
      const userInfo = await api.getUserInfo();
      setUser(userInfo);
      // 获取积分和订单
      const pointsData = await api.getPoints();
      setPoints(pointsData.points);
      setOrders(pointsData.orders || []);
    } catch {
      // 未登录
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 购买充值包
  const handlePurchase = async (pkg: RechargePackage) => {
    setRecharging(true);
    try {
      // 创建订单
      const order = await api.createRechargeOrder(pkg.price, pkg.points);
      // 模拟支付成功（实际应该跳转支付页面）
      await fetch('http://localhost:3001/api/users/recharge/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo: order.order_no }),
      });
      // 刷新积分
      await checkAuth();
      alert(`充值成功！${pkg.points}积分已到账`);
    } catch (err: any) {
      alert(err.message || '充值失败');
    } finally {
      setRecharging(false);
    }
  };

  // 检查是否已登录
  useEffect(() => {
    checkAuth();
    
    // 监听忘记密码事件
    const handleOpenForgotPassword = () => setShowAuth('forgot');
    window.addEventListener('openForgotPassword', handleOpenForgotPassword);
    return () => window.removeEventListener('openForgotPassword', handleOpenForgotPassword);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setPoints(0);
    setShowAuth('login');
  };

  // 未登录显示登录/注册表单
  if (!user && !showAuth) {
    setShowAuth('login');
    return null;
  }

  if (!user && showAuth) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-background-dark p-6">
        {showAuth === 'login' ? (
          <LoginForm 
            onSuccess={(u) => {
              setUser(u);
              checkAuth(); // 刷新用户信息
            }} 
            onSwitchToRegister={() => setShowAuth('register')} 
          />
        ) : showAuth === 'forgot' ? (
          <ForgotPasswordForm onBack={() => setShowAuth('login')} />
        ) : (
          <RegisterForm 
            onSuccess={(u) => {
              setUser(u);
              checkAuth(); // 刷新用户信息
            }} 
            onSwitchToLogin={() => setShowAuth('login')} 
          />
        )}
      </div>
    );
  }

  // 会员中心内容
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-background-dark">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header / Profile Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="size-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-black">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900">
                白金会员
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black">{user?.username || '用户'}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">普通会员</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">研判报告 8折优惠</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-40 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">积分余额</p>
              <p className="text-2xl font-black text-primary">{loading ? '...' : points.toLocaleString()}</p>
            </div>
            <div className="flex-1 md:w-40 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">研判次数</p>
              <p className="text-2xl font-black text-emerald-500">{Math.floor(points / 100)}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
          {[
            { id: 'profile', label: '个人资料', icon: User },
            { id: 'recharge', label: '充值中心', icon: Wallet },
            { id: 'fission', label: '邀请好友', icon: Gift },
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

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold mb-6">个人资料</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">用户名</label>
                <input 
                  type="text" 
                  defaultValue={user?.username}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">邮箱</label>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">手机号</label>
                <input 
                  type="tel" 
                  placeholder="未绑定"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3"
                />
              </div>
              <div className="flex items-end">
                <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                  保存修改
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-rose-500 font-bold hover:text-rose-600 transition-colors"
              >
                <LogOut size={18} />
                退出登录
              </button>
            </div>
          </div>
        )}

        {activeTab === 'recharge' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-black mb-2">充值积分</h3>
              <p className="text-white/80">充值积分用于查看深度AI分析报告</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-4xl font-black">1:10</span>
                <span className="text-white/80">（1元 = 10积分）</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PACKAGES.map(pkg => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 transition-all",
                    pkg.popular 
                      ? "border-primary shadow-xl shadow-primary/10" 
                      : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
                  )}
                >
                  {pkg.tag && (
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {pkg.tag}
                    </span>
                  )}
                  <h4 className="text-xl font-black mt-3">{pkg.name}</h4>
                  <p className="text-3xl font-black text-primary mt-2">
                    ¥{pkg.price}
                    <span className="text-sm font-normal text-slate-400">/{pkg.reports}次</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-500">
                      <Zap size={14} className="text-amber-400" /> {pkg.points} 积分
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 size={14} className="text-emerald-500" /> 可查看 {pkg.reports} 份报告
                    </li>
                  </ul>
                  <button 
                    onClick={() => handlePurchase(pkg)}
                    disabled={recharging}
                    className={cn(
                      "w-full mt-6 py-3 rounded-xl font-bold transition-all",
                      pkg.popular 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" 
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white",
                      recharging && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {recharging ? '处理中...' : '立即购买'}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* 充值记录 */}
            {orders.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="text-lg font-bold mb-4">充值记录</h4>
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="font-bold">¥{order.amount} → {order.points} 积分</p>
                        <p className="text-xs text-slate-400">{order.created_at}</p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        order.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {order.status === 'paid' ? '已支付' : '待支付'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fission' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold mb-6">邀请好友</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
              <p className="text-slate-500 mb-4">复制下方链接邀请好友，双方各得100积分</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly
                  value={`https://ai-fapaizhitou.com/invite?ref=${user?.id || ''}`}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm"
                />
                <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                  复制
                </button>
              </div>
            </div>
            
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              {[
                { label: '累计邀请', value: '12' },
                { label: '获得积分', value: '1200' },
                { label: '佣金收益', value: '¥96' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-primary">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
