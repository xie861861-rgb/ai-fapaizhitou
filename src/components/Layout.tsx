import React from 'react';
import { Gavel, Search, Bell, LayoutDashboard, BarChart3, Heart, Globe, HelpCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export const Header = ({ 
  onStartAnalysis, 
  onGoToMember, 
  onGoToAdmin,
  onGoHome,
  onGoToWorkbench
}: { 
  onStartAnalysis?: () => void;
  onGoToMember?: () => void;
  onGoToAdmin?: () => void;
  onGoHome?: () => void;
  onGoToWorkbench?: () => void;
}) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 py-3 bg-background-light dark:bg-background-dark sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onGoHome}
        >
          <div className="size-8 bg-primary rounded flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Gavel size={18} />
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight">AI法拍智投</h2>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <button onClick={onGoToWorkbench} className="text-sm font-medium hover:text-primary transition-colors">工作台</button>
          <button onClick={onGoHome} className="text-sm font-medium hover:text-primary transition-colors">市场分析</button>
          <button onClick={onGoToMember} className="text-sm font-medium hover:text-primary transition-colors">会员中心</button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div 
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={onGoToMember}
        >
          <div className="size-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">P</div>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">可用积分: 2,450</span>
          <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 hover:underline ml-1">充值</span>
        </div>
        <label className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-primary">
          <Search className="text-slate-400" size={16} />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-500 ml-2" 
            placeholder="搜索案号、地址..." 
            type="text"
          />
        </label>
        <button 
          onClick={onStartAnalysis}
          className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
        >
          开始参拍
        </button>
        <div 
          className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 cursor-pointer hover:ring-2 ring-primary transition-all"
          onClick={onGoToMember}
        >
          <img alt="用户头像" src="https://picsum.photos/seed/user1/100/100" />
        </div>
      </div>
    </header>
  );
};

export const Footer = ({ onGoToAdmin }: { onGoToAdmin?: () => void }) => {
  return (
    <footer className="bg-white dark:bg-background-dark py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <BarChart3 className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AI<span className="text-primary font-medium">法拍智能助手</span></span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-500">
            <button className="hover:text-primary transition-colors">数据透明度</button>
            <button className="hover:text-primary transition-colors">隐私政策</button>
            <button className="hover:text-primary transition-colors">服务条款</button>
            <button onClick={onGoToAdmin} className="hover:text-primary transition-colors">管理后台</button>
          </div>
          <div className="flex gap-4">
            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary">
              <Globe size={18} />
            </button>
            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary">
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500">© 2024 AI法拍智能助手. 数据来源于官方司法拍卖网络。不构成任何投资建议。</p>
        </div>
      </div>
    </footer>
  );
};
