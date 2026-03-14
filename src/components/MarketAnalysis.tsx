import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, ShieldCheck, MapPin, Heart, Sparkles, Star, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Property } from '../types';
import { cn } from '../lib/utils';
import { api, Property as ApiProperty } from '../lib/api';

interface MarketAnalysisProps {
  onSelectProperty: (property: Property) => void;
  onStartAnalysis: () => void;
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

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ onSelectProperty, onStartAnalysis }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await api.getProperties({ limit: 20 });
      setProperties(data.map(convertProperty));
      setError(null);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('加载失败，使用演示数据');
      // Fallback to mock data
      const { MOCK_PROPERTIES } = await import('../types');
      setProperties(MOCK_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 bg-background-dark text-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/40 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6"
          >
            借助 <span className="text-primary">精准AI</span> 发现您的下一次投资机会
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed"
          >
            秒级分析上万件法拍房源。我们的AI深度评估法律风险、获利空间及市场趋势，助您自信出价。
          </motion.p>
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-primary/20 rounded-xl blur opacity-75 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
              <Sparkles className="ml-4 text-slate-400" size={20} />
              <input 
                className="w-full py-5 px-4 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 text-lg" 
                placeholder="输入需求，如：上海市中心低风险三居室" 
                type="text"
              />
              <button 
                onClick={onStartAnalysis}
                className="bg-primary text-white px-8 py-3 mr-2 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                搜索
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4 text-xs font-medium text-slate-500">
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">商业地产</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">住宅刚需</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">低风险房源</span>
          </div>
        </div>
      </header>

      {/* Market Insights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-primary" size={24} />
            <h2 className="text-2xl font-bold">AI 市场洞察</h2>
          </div>
          <span className="text-sm text-slate-500">更新时间：实时对接司法拍卖网</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InsightCard title="平均折扣率" value="22.4%" trend="+3.1%" isPositive={true} progress={66} />
          <InsightCard title="成交率趋势" value="68.2%" trend="-0.5%" isPositive={false} progress={68} />
          <InsightCard title="活跃房源数" value={loading ? "..." : properties.length.toString()} trend="+12%" isPositive={true} type="bar" />
          <InsightCard title="整体风险指数" value="低" status="稳定" type="dots" />
        </div>
      </section>

      {/* Regional Sentiment & Trends */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 my-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">行业舆情与地区趋势</h2>
            <p className="text-slate-500">基于全网大数据，实时监测各地区法拍房市场的热度与舆论导向。</p>
          </div>
          <div className="flex gap-2">
            {['上海', '北京', '深圳', '杭州'].map(city => (
              <button key={city} className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all",
                city === '上海' ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
              )}>
                {city}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-primary" size={18} />
                地区热度走势 (近30日)
              </h4>
              <div className="h-48 flex items-end justify-between gap-2 px-4">
                {[45, 52, 48, 65, 72, 68, 85, 92, 88, 95, 100, 98].map((val, i) => (
                  <div key={i} className="flex-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}%
                    </div>
                    <div className="bg-primary/20 rounded-t-sm w-full transition-all group-hover:bg-primary" style={{ height: `${val}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>1月20日</span>
                <span>2月19日 (今日)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="text-primary" size={18} />
              实时舆情动态
            </h4>
            <div className="space-y-4">
              {[
                { text: '上海浦东新区法拍房成交率创近半年新高', sentiment: 'positive', time: '12分钟前' },
                { text: '某头部法拍机构发布春季投资白皮书，看好核心区老洋房', sentiment: 'positive', time: '1小时前' },
                { text: '部分郊区房源出现流拍，市场观望情绪加重', sentiment: 'negative', time: '3小时前' },
              ].map((news, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      news.sentiment === 'positive' ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {news.sentiment === 'positive' ? '利好' : '利空'}
                    </span>
                    <span className="text-[10px] text-slate-400">{news.time}</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{news.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">AI 智能推荐</h2>
            <p className="text-slate-500">基于您的投资偏好深度筛选的优质机会。</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button className="px-4 py-2 bg-white dark:bg-slate-700 text-primary rounded shadow-sm text-sm font-semibold">列表视图</button>
              <button className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-semibold">地图视图</button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-pulse">
                <div className="h-56 bg-slate-200 dark:bg-slate-800"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onClick={() => onSelectProperty(property)} 
              />
            ))}
          </div>
        )}
        
        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">暂无房源数据</p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            加载更多机会
          </button>
        </div>
      </main>

      {/* Heatmap Section */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-20 mt-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-block p-2 bg-primary/20 rounded-lg text-primary text-xs font-bold uppercase tracking-widest mb-4">时空智能分析</div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">分析市场热力图</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
                我们的AI结合GIS地理信息系统，为您呈现高增长潜力区域。实时监测全城法拍活动密度，识别价值洼地。
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="text-primary" size={20} />
                  实时对比法拍评估价与二级市场价
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="text-primary" size={20} />
                  基于历史成交率的风险分区预警
                </li>
              </ul>
              <button 
                onClick={onStartAnalysis}
                className="mt-10 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                进入市场地图
              </button>
            </div>
            <div className="lg:w-1/2 w-full relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-2xl blur-3xl"></div>
              <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
                <img alt="Map Visualization" className="w-full h-full object-cover grayscale opacity-50 dark:opacity-30" src="https://picsum.photos/seed/map-viz/800/600" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent"></div>
                <div className="absolute top-10 left-10 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">热门投资区</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">+14% 增长趋势</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const InsightCard = ({ title, value, trend, isPositive, progress, type, status }: any) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <span className={cn("text-3xl font-bold", title === "整体风险指数" && "text-emerald-500")}>{value}</span>
        {trend && (
          <span className={cn("text-xs font-bold flex items-center mb-1", isPositive ? "text-emerald-500" : "text-rose-500")}>
            {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {trend}
          </span>
        )}
        {status && <span className="text-slate-400 text-xs font-bold flex items-center mb-1">{status}</span>}
      </div>
      <div className="mt-4">
        {type === 'bar' ? (
          <div className="flex gap-1 h-8 items-end">
            <div className="w-2 bg-primary/20 h-4 rounded-t-sm"></div>
            <div className="w-2 bg-primary/40 h-6 rounded-t-sm"></div>
            <div className="w-2 bg-primary/60 h-5 rounded-t-sm"></div>
            <div className="w-2 bg-primary/80 h-7 rounded-t-sm"></div>
            <div className="w-2 bg-primary h-8 rounded-t-sm"></div>
          </div>
        ) : type === 'dots' ? (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="h-2 w-2 rounded-full bg-slate-700"></span>
            <span className="h-2 w-2 rounded-full bg-slate-700"></span>
          </div>
        ) : (
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

const PropertyCard = ({ property, onClick }: { property: Property; onClick: () => void; key?: string }) => {
  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.addFavorite(property.id);
    } catch (err) {
      console.log('收藏功能需要登录');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-56 overflow-hidden">
        <img alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={property.images[0]} />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <span className={cn(
              "text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider",
              property.riskLevel === 'low' ? "bg-emerald-500" : property.riskLevel === 'medium' ? "bg-amber-500" : "bg-rose-500"
            )}>
              AI风险：{property.riskLevel === 'low' ? '低' : property.riskLevel === 'medium' ? '中' : '高'}
            </span>
            <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              {property.type === 'commercial' ? '商业地产' : '住宅房产'}
            </span>
          </div>
          <div className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 w-fit">
            <Star size={10} fill="currentColor" /> 难度：{property.difficultyRating}星
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="bg-white/95 dark:bg-slate-900/95 p-2 rounded shadow-lg backdrop-blur-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase">预估获利空间</p>
            <p className="text-emerald-500 font-bold text-lg leading-none">+{property.profitPotential.toFixed(1)}%</p>
          </div>
          <button 
            onClick={handleFavorite}
            className="bg-white dark:bg-slate-800 p-2 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Heart size={18} />
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{property.title}</h3>
          <span className="text-primary font-bold text-lg">¥{(property.startingPrice / 10000).toFixed(0)}万</span>
        </div>
        <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-4">
          <MapPin size={14} className="mr-1" /> {property.location}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {property.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded">{tag}</span>
          ))}
        </div>
        <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-900 dark:text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
          深度AI分析
          <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-full">10 积分</span>
        </button>
      </div>
    </motion.div>
  );
};
