import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Upload, Link as LinkIcon, CheckCircle2, Loader2, UserPlus, ArrowRight, X, FileText, ShieldAlert, Calculator, TrendingUp, Wallet, ShieldCheck, AlertCircle } from 'lucide-react';
import { Property } from '../types';
import { cn } from '../lib/utils';
import { api, Analysis } from '../lib/api';

type Step = 'welcome' | 'property' | 'analyzing' | 'result';

interface AnalysisWorkflowProps {
  onComplete: (property: Property) => void;
  onCancel: () => void;
}

// 房产选择步骤
const PropertySelectStep = ({ onSelect, onCancel }: { 
  onSelect: (property: Property) => void; 
  onCancel: () => void;
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await api.getProperties({ limit: 20 });
      setProperties(data);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = properties.filter(p => 
    p.title.includes(search) || p.location.includes(search)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">选择要分析的房源</h3>
        <p className="text-slate-500">从现有房源库中选择，或搜索特定房源</p>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索房源标题或地址..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 房源列表 */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto text-primary" size={32} />
          <p className="mt-4 text-slate-500">加载中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <AlertCircle className="mx-auto mb-2" size={32} />
          <p>没有找到匹配的房源</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filtered.map(property => (
            <motion.div
              key={property.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelect(property)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:border-primary transition-all"
            >
              <div className="flex gap-4">
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{property.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{property.location}</p>
                  <p className="text-primary font-bold mt-1">¥{(property.startingPrice / 10000).toFixed(0)}万</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <button 
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 font-medium"
        >
          取消
        </button>
      </div>
    </motion.div>
  );
};

// 分析中步骤
const AnalyzingStep = ({ property, onComplete, onCancel }: { 
  property: Property;
  onComplete: (property: Property, analysis: Analysis) => void;
  onCancel: () => void;
}) => {
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startAnalysis();
  }, []);

  const startAnalysis = async () => {
    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      // 调用 AI 分析 API
      const result = await api.createAnalysis(property.id);
      setAnalysis(result);
      
      clearInterval(progressInterval);
      setProgress(100);

      // 延迟一下让用户看到100%
      setTimeout(() => {
        onComplete(property, result);
      }, 1000);
    } catch (err: any) {
      setError(err.message || '分析失败，请重试');
    }
  };

  const agents = [
    { icon: ShieldAlert, label: '法律风险检测', stage: '正在分析产权查封、租赁、纠纷等风险...', duration: 3000 },
    { icon: Calculator, label: '财务模型计算', stage: '评估贷款、税费、过户等成本...', duration: 2000 },
    { icon: TrendingUp, label: '市场趋势分析', stage: '对比区域历史成交价...', duration: 2500 },
    { icon: Wallet, label: '投资回报预测', stage: '计算预期收益与风险比...', duration: 2000 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <Brain className="text-primary" size={32} />
        </div>
        <h3 className="text-2xl font-bold">AI 深度分析中</h3>
        <p className="text-slate-500">正在对「{property.title}」进行全方位风险评估</p>
      </div>

      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-2" size={32} />
          <p className="text-rose-500 font-bold">{error}</p>
          <button 
            onClick={onCancel}
            className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-lg font-bold"
          >
            返回
          </button>
        </div>
      ) : (
        <>
          {/* Agent 进度 */}
          <div className="space-y-3">
            {agents.map((agent, idx) => {
              const isCompleted = progress > (idx + 1) * 20;
              const isActive = progress > idx * 20 && progress <= (idx + 1) * 20;
              
              return (
                <motion.div 
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <div className={cn(
                    "size-10 rounded-lg flex items-center justify-center shrink-0",
                    isCompleted ? "bg-green-500 text-white" : 
                    isActive ? "bg-primary text-white animate-pulse" : 
                    "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <agent.icon size={20} />}
                  </div>
                  <div className="flex-1">
                    <span className={cn(
                      "text-sm font-bold",
                      isCompleted ? "text-green-600" : 
                      isActive ? "text-primary" : "text-slate-500"
                    )}>
                      {agent.label}
                    </span>
                    {isActive && (
                      <p className="text-xs text-slate-400 animate-pulse">{agent.stage}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>分析进度</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export const AnalysisWorkflow: React.FC<AnalysisWorkflowProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentStep('analyzing');
  };

  const handleAnalysisComplete = (property: Property, analysis: Analysis) => {
    // 将分析结果附加到 property 上
    const propertyWithAnalysis = {
      ...property,
      aiPredictedPrice: analysis.ai_predicted_price,
    };
    onComplete(propertyWithAnalysis);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Brain className="text-primary" size={40} />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">欢迎使用 AI 法拍智能助手</h2>
              <p className="text-slate-500 text-lg">
                我是您的专属投资顾问。只需几步，我将为您深度解析法拍房源的法律风险与获利空间。
              </p>
            </div>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button 
                onClick={() => setCurrentStep('property')}
                className="bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
              >
                开始新研判 <ArrowRight size={20} />
              </button>
              <button 
                onClick={onCancel}
                className="text-slate-500 hover:text-slate-700 font-medium"
              >
                稍后再说
              </button>
            </div>
          </motion.div>
        );

      case 'property':
        return (
          <PropertySelectStep 
            onSelect={handleSelectProperty} 
            onCancel={() => setCurrentStep('welcome')} 
          />
        );

      case 'analyzing':
        return selectedProperty ? (
          <AnalyzingStep 
            property={selectedProperty}
            onComplete={handleAnalysisComplete}
            onCancel={() => setCurrentStep('property')}
          />
        ) : null;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-primary rounded-full blur-[150px]"></div>
      </div>

      <button 
        onClick={onCancel}
        className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-4xl relative z-10">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};
