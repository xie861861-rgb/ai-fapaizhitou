import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, History, Star, Users, ChevronRight, Gift, Zap, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

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

export const MemberCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'recharge' | 'fission'>('profile');

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-background-dark">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header / Profile Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="size-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-black">
                JD
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900">
                白金会员
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black">张三 (138****8888)</h2>
              <p className="text-slate-500 text-sm">您的法拍资产管家已就绪</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">首席合伙人</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">研判报告 8 折优惠</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-40 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">可用积分</p>
              <p className="text-2xl font-black text-amber-500">2,450</p>
            </div>
            <div className="flex-1 md:w-40 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">剩余额度</p>
              <p className="text-2xl font-black text-primary">12 次</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'profile', label: '账户概览', icon: <Wallet size={18} /> },
            { id: 'recharge', label: '充值中心', icon: <CreditCard size={18} /> },
            { id: 'fission', label: '积分裂变', icon: <Gift size={18} /> },
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
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <History className="text-primary" size={20} />
                  研判足迹
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                          <Star size={24} />
                        </div>
                        <div>
                          <p className="font-bold">汤臣一品 顶层复式豪华住宅</p>
                          <p className="text-xs text-slate-500">研判时间：2024.05.12 14:20 • 完整报告已解锁</p>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors" size={20} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="text-amber-500" size={20} />
                  积分变动流水
                </h3>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { label: '解锁报告：汤臣一品', value: -50, time: '10分钟前' },
                    { label: '邀请好友注册奖励', value: +10, time: '2小时前' },
                    { label: '充值：投资进阶包', value: +1200, time: '昨天' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-[10px] text-slate-400">{item.time}</p>
                      </div>
                      <span className={cn(
                        "text-sm font-black",
                        item.value > 0 ? "text-green-500" : "text-rose-500"
                      )}>
                        {item.value > 0 ? `+${item.value}` : item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recharge' && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black">选择您的投资套餐</h3>
                <p className="text-slate-500">新用户注册首单特惠，赠送 1 次免费解锁机会</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PACKAGES.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className={cn(
                      "relative bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 transition-all duration-300 flex flex-col justify-between",
                      pkg.popular ? "border-primary shadow-2xl shadow-primary/10 scale-105 z-10" : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
                    )}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                        Most Popular
                      </div>
                    )}
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{pkg.tag}</span>
                        <h4 className="text-xl font-black">{pkg.name}</h4>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">¥{pkg.price}</span>
                        <span className="text-slate-400 text-sm">/ 套餐</span>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle2 size={16} className="text-primary" />
                          {pkg.points} 研判积分
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle2 size={16} className="text-primary" />
                          {pkg.reports} 份深度报告额度
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle2 size={16} className="text-primary" />
                          全天候 AI 助手咨询
                        </li>
                      </ul>
                    </div>
                    <button className={cn(
                      "w-full mt-8 py-4 rounded-2xl font-black transition-all",
                      pkg.popular ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}>
                      立即购买
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fission' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-4xl font-black leading-tight">
                    成为法拍合伙人<br />
                    <span className="text-primary">赢取无限研判积分</span>
                  </h3>
                  <p className="text-slate-500 text-lg">
                    每成功邀请 1 名新用户注册，您得 <span className="text-primary font-bold">30 积分</span>，受邀人得 <span className="text-primary font-bold">50 积分</span> 新人礼。
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">您的专属邀请码</p>
                      <p className="text-xl font-black tracking-widest">AI888888</p>
                    </div>
                    <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm">复制链接</button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={14} className="text-green-500" />
                    累计邀请 2 人，升级为“首席合伙人”，享 8 折研判优惠
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black">12</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">成功邀请</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black">120</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">累计奖励</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black">8.5</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">当前折扣</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-[40px] blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-primary to-indigo-600 rounded-[40px] p-8 aspect-[3/4] flex flex-col justify-between text-white shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  <div className="space-y-6">
                    <div className="size-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <Brain className="text-white" size={24} />
                    </div>
                    <h4 className="text-3xl font-black leading-tight">
                      这套法拍房能不能买？<br />
                      AI 专家 10 秒告诉你。
                    </h4>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-white rounded-lg flex items-center justify-center text-primary font-black">QR</div>
                        <div>
                          <p className="text-xs font-bold">扫码领取 30 积分</p>
                          <p className="text-[10px] opacity-60">免费获取深度风险研判报告</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-center">法拍房 AI 智能体服务平台</p>
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

const Brain = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/>
  </svg>
);
