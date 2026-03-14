import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Clock, Star, ChevronRight, Search, Filter, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Property } from '../types';
import { cn } from '../lib/utils';
import { api, Property as ApiProperty } from '../lib/api';

interface WorkbenchProps {
  onSelectProperty: (property: Property) => void;
}

// Convert API property to frontend property type
const convertProperty = (apiProp: ApiProperty): Property => ({
  id: apiProp.id,
  title: apiProp.title,
  location: apiProp.location,
  startingPrice: apiProp.starting_price,
  evaluationPrice: apiProp.evaluation_price,
  aiPredictedPrice: apiProp.ai_predicted_price || apiProp.evaluation_price,
  area: apiProp.area,
  floor: apiProp.floor || '',
  builtDate: apiProp.built_date || '',
  usage: apiProp.usage_type || '',
  status: apiProp.status,
  timeLeft: apiProp.time_left || '',
  riskLevel: apiProp.risk_level || 'medium',
  difficultyRating: apiProp.difficulty_rating || 3,
  loanEstimate: {
    maxLoan: apiProp.loan_max_loan || apiProp.starting_price * 0.7,
    downPayment: apiProp.loan_down_payment || apiProp.starting_price * 0.3,
    monthlyPayment: apiProp.loan_monthly_payment || 20000,
  },
  tags: apiProp.tags || [],
  images: apiProp.images || [],
  type: apiProp.property_type || 'residential',
  profitPotential: apiProp.profit_potential || ((apiProp.evaluation_price - apiProp.starting_price) / apiProp.starting_price) * 100,
});

export const Workbench: React.FC<WorkbenchProps> = ({ onSelectProperty }) => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [history, setHistory] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [favData, histData] = await Promise.all([
        api.getFavorites(),
        api.getHistory(),
      ]);
      setFavorites(favData.map(convertProperty));
      setHistory(histData.map(convertProperty));
    } catch (err) {
      console.error('Failed to load workbench data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-background-dark">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black">我的工作台</h2>
            <p className="text-slate-500">管理您的研判任务与意向房源</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all w-64" 
                placeholder="搜索房源地址、案号..."
              />
            </div>
            <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Clock size={24} />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">正在研判中</p>
            <p className="text-3xl font-black">2 <span className="text-sm font-normal text-slate-400">套房源</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="size-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-4">
              <Star size={24} />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">我的关注</p>
            <p className="text-3xl font-black">{loading ? '...' : favorites.length} <span className="text-sm font-normal text-slate-400">套房源</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="size-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <ShieldCheck size={24} />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">已完成研判</p>
            <p className="text-3xl font-black">{loading ? '...' : history.length} <span className="text-sm font-normal text-slate-400">套房源</span></p>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold">我的关注房源</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1">
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-slate-400">加载中...</div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Star size={48} className="mx-auto mb-4 opacity-20" />
                <p>暂无关注的房源</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.slice(0, 6).map((property) => (
                  <motion.div
                    key={property.id}
                    whileHover={{ y: -2 }}
                    onClick={() => onSelectProperty(property)}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  >
                    <div className="flex gap-4">
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{property.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{property.location}</p>
                        <p className="text-primary font-bold text-lg mt-1">¥{(property.startingPrice / 10000).toFixed(0)}万</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold">最近浏览</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1">
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-slate-400">加载中...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock size={48} className="mx-auto mb-4 opacity-20" />
                <p>暂无浏览记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((property) => (
                  <div
                    key={property.id}
                    onClick={() => onSelectProperty(property)}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div>
                        <h4 className="font-bold">{property.title}</h4>
                        <p className="text-xs text-slate-400">{property.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-bold">¥{(property.startingPrice / 10000).toFixed(0)}万</span>
                      <ArrowUpRight size={20} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
