import React, { useState } from 'react';
import { ChevronRight, MapPin, FileText, Download, Brain, TrendingUp, ShieldAlert, ShieldCheck, Gavel, MessageSquare, Send, Map, Star, Landmark, Wallet, Calculator, Users, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';
import { cn } from '../lib/utils';

interface PropertyDetailProps {
  property: Property;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property }) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '您好！我是您的法拍助手。我已经深度解析了本案的所有卷宗文件，并结合阿里拍卖的实时数据进行了核验。您有什么疑问可以随时问我。', time: '10:42 AM' },
    { role: 'user', text: '这套房子的法拍难度如何？贷款空间大吗？', time: '10:43 AM' },
    { role: 'assistant', text: `根据我的研判，该房源的法拍难度评级为 ${property.difficultyRating}星（较易）。主要风险点在于物业欠费，但权属非常清晰。贷款方面，预计最高可贷 ¥${(property.loanEstimate.maxLoan / 10000).toFixed(0)}万，首付约 ¥${(property.loanEstimate.downPayment / 10000).toFixed(0)}万。`, time: '10:43 AM' },
  ]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { role: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [userPoints, setUserPoints] = useState(2450);

  const handleUnlock = () => {
    if (userPoints >= 50) {
      setUserPoints(prev => prev - 50);
      setIsUnlocked(true);
    } else {
      setShowRecharge(true);
    }
  };

  return (
    <main className="flex-1 flex overflow-hidden">
      {/* Recharge Popup */}
      <AnimatePresence>
        {showRecharge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecharge(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="size-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
                  <Wallet size={32} />
                </div>
                <h3 className="text-2xl font-black">积分不足</h3>
                <p className="text-slate-500">解锁该深度研判报告需要 50 积分，请先充值</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { name: '单次尝鲜包', price: 19, points: 200, icon: '🌱' },
                  { name: '投资进阶包', price: 48, points: 500, icon: '🚀', popular: true },
                ].map((pkg, i) => (
                  <button key={i} className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                    pkg.popular ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-slate-100 dark:border-slate-800 hover:border-primary/30"
                  )}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{pkg.icon}</span>
                      <div className="text-left">
                        <p className="font-bold">{pkg.name}</p>
                        <p className="text-xs text-slate-400">获得 {pkg.points} 积分</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">¥{pkg.price}</p>
                      {pkg.popular && <span className="text-[8px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full uppercase">推荐</span>}
                    </div>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowRecharge(false)}
                className="w-full bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all"
              >
                稍后再说
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Left Column: Property Info */}
      <div className="w-2/5 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>司法拍卖</span>
            <ChevronRight size={10} />
            <span>上海市浦东新区法院</span>
            <ChevronRight size={10} />
            <span className="text-primary">案号：(2023)沪0115执104250号</span>
          </nav>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> 法拍难度：{property.difficultyRating}星
                </span>
                <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  双源核验已通过
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-2">{property.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm">
                <MapPin size={14} />
                坐落：{property.location}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-200 dark:bg-slate-800">
              <img alt="房产主图" className="w-full h-full object-cover" src={property.images[0]} />
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                <span className="size-1.5 bg-white rounded-full animate-pulse"></span>
                {property.status}：剩余 {property.timeLeft}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {property.images.slice(1).map((img, i) => (
                <img key={i} alt={`室内图${i+1}`} className="rounded-lg h-24 w-full object-cover" src={img} />
              ))}
              <div className="relative rounded-lg h-24 w-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
                <img alt="地图" className="absolute inset-0 rounded-lg opacity-40 object-cover w-full h-full" src="https://picsum.photos/seed/map/400/300" />
                <span className="relative text-xs font-bold text-white flex items-center gap-1">
                  <Map size={14} />
                  查看地图
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">起拍价</p>
              <p className="text-xl font-black text-primary">¥{property.startingPrice.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">拍卖时间</p>
              <p className="text-xl font-black">2024.05.24</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Calculator className="text-primary" size={16} />
              银行贷款空间测算
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 mb-1">最高可贷</p>
                <p className="text-sm font-bold text-primary">¥{(property.loanEstimate.maxLoan / 10000).toFixed(0)}万</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 mb-1">预估首付</p>
                <p className="text-sm font-bold">¥{(property.loanEstimate.downPayment / 10000).toFixed(0)}万</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 mb-1">月供参考</p>
                <p className="text-sm font-bold">¥{(property.loanEstimate.monthlyPayment / 10000).toFixed(1)}万</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileText className="text-primary" size={16} />
              房产基础信息
            </h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="建筑面积" value={`${property.area} m²`} />
              <InfoRow label="所在楼层/总楼层" value={property.floor} />
              <InfoRow label="建成日期" value={property.builtDate} />
              <InfoRow label="房屋用途" value={property.usage} />
              <InfoRow label="评估总价" value={`¥${property.evaluationPrice.toLocaleString()}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Center Column: AI Report */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark overflow-y-auto custom-scrollbar relative">
        {!isUnlocked && (
          <div className="absolute inset-0 z-20 bg-slate-50/80 dark:bg-background-dark/80 backdrop-blur-md flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-8"
            >
              <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="text-primary" size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">解锁深度研判报告</h3>
                <p className="text-slate-500 text-sm">包含 AI 估值预测、详细风险穿透及竞拍博弈策略</p>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={handleUnlock}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                >
                  立即解锁 <span className="text-xs bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">50 积分</span>
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">或者</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                </div>
                <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  <Users size={18} /> 发起众筹研判
                  <span className="text-[10px] text-primary ml-1">邀请 2 人助力免费看</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                解锁后该报告将永久存储在您的“研判足迹”中，支持随时回顾。
              </p>
            </motion.div>
          </div>
        )}

        <div className={cn("p-6 space-y-6", !isUnlocked && "filter blur-sm pointer-events-none select-none")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Brain className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI房产深度评估报告</h2>
                <p className="text-xs text-slate-500">由 MCP 多智能体引擎协同生成 • 综合置信度: 98.4%</p>
              </div>
            </div>
            <button className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-600 transition-colors">
              <Download size={14} />
              导出完整AI评估报告
              <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-full">50 积分</span>
            </button>
          </div>

          {/* Multi-Agent Engine Summary */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[FileText, LinkIcon, ShieldAlert, Calculator, TrendingUp, Wallet].map((Icon, i) => (
                  <div key={i} className="size-8 rounded-full bg-white dark:bg-slate-800 border-2 border-primary/20 flex items-center justify-center text-primary shadow-sm">
                    <Icon size={14} />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">MCP 协同研判引擎</p>
                <p className="text-[10px] text-slate-500">6大专业智能体已完成双源数据核验与风险穿透</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-500 font-bold text-[10px] bg-green-500/10 px-2 py-1 rounded-full">
              <CheckCircle2 size={10} /> 研判已就绪
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="ai-gradient-border p-6 shadow-xl flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2 text-white">
                  <TrendingUp className="text-primary" size={18} />
                  AI估值曲线（市场价对比起拍价）
                </h3>
                <div className="flex gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-400"></span> 市场公允价</div>
                  <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary"></span> 拍卖参考价</div>
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-4 px-2">
                <Bar label="市场估值" height="h-40" color="bg-slate-700" />
                <Bar label="当前起拍" height="h-24" color="bg-primary/40" highlight="起拍价" />
                <Bar label="AI预测价" height="h-32" color="bg-primary" highlight="建议成交" glow />
                <Bar label="快速变现价" height="h-16" color="bg-slate-700" />
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-white">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">AI 预测市场价值</p>
                  <p className="text-2xl font-black">¥{property.aiPredictedPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">预计溢价空间</p>
                  <p className="text-2xl font-black text-green-400">+{property.profitPotential}%</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Landmark className="text-primary" size={18} />
                    线下代办服务
                  </h3>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">专业团队</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  担心法拍流程复杂？我们提供全流程线下代办服务，包括：实地看样、尽职调查、协助参拍、协助过户及清场交付。
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">尽调代办</p>
                    <p className="text-xs font-bold">¥2,999/件</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">全流程代办</p>
                    <p className="text-xs font-bold">成交价 0.5%</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 bg-primary/10 text-primary font-bold py-3 rounded-xl hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                <Users size={16} /> 预约专家线下咨询
              </button>
            </section>
          </div>

          <section className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="text-primary" size={18} />
              AI风险报告 (深度穿透)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RiskCard 
                icon={<ShieldAlert className="text-orange-400" size={18} />}
                title="占用情况分析"
                desc="目前由被执行人及其家属居住，未发现租赁租约，预计交付周期3-6个月。"
                risk="中风险"
                riskColor="text-orange-400"
                riskBg="bg-orange-400/10"
                progress={65}
                progressColor="bg-orange-400"
                confidence="92%"
              />
              <RiskCard 
                icon={<FileText className="text-primary" size={18} />}
                title="税费及欠费预测"
                desc="预估税费¥245万。另需代缴物业欠费及滞纳金约¥14.2万（需买受人承担）。"
                risk="税费清晰"
                riskColor="text-primary"
                riskBg="bg-primary/10"
                progress={85}
                progressColor="bg-primary"
                confidence="98%"
              />
              <RiskCard 
                icon={<Gavel className="text-green-400" size={18} />}
                title="法律纠纷排查"
                desc="权属清晰。债权关系单一，无优先受偿权争议。成交后清算逻辑明确。"
                risk="低风险"
                riskColor="text-green-400"
                riskBg="bg-green-400/10"
                progress={95}
                progressColor="bg-green-400"
                confidence="99%"
              />
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Brain className="text-primary" size={18} />
                  AI 出价策略建议
                </h3>
                <div className="space-y-3">
                  <StrategyItem num={1} text={<>建议初始试探价：<span className="font-bold">¥85,000,000</span>，释放拿地信号。</>} />
                  <StrategyItem num={2} text={<>心理价位防线：<span className="font-bold">¥98,500,000</span>。此价格以上ROI将显著下降。</>} />
                  <StrategyItem num={3} text="竞价热度预测：预计将有3-5位活跃竞买人参与，竞争较为激烈。" />
                </div>
              </div>
              <div className="w-full md:w-64 bg-primary p-5 rounded-xl shadow-lg shadow-primary/20 text-white text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">AI 建议最高出价</p>
                <p className="text-2xl font-black mb-4">¥101,200,000</p>
                <button className="w-full bg-white text-primary font-bold py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  设置出价提醒
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Right Column: AI Assistant */}
      <div className="w-80 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-background-dark">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-primary" size={18} />
            <span className="font-bold text-sm">AI 法拍助手</span>
          </div>
          <span className="size-2 bg-green-500 rounded-full"></span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
              <div className={cn(
                "p-3 rounded-lg text-xs leading-relaxed max-w-[90%]",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-slate-100 dark:bg-slate-800 rounded-tl-none"
              )}>
                <p>{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-500">{msg.time}</span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors">法律文书摘要</button>
            <button className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors">装修投资回报比</button>
          </div>
          <div className="relative">
            <input 
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs py-2.5 pl-3 pr-10 focus:ring-1 focus:ring-primary" 
              placeholder="输入您想了解的问题..." 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary" onClick={handleSend}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const Bar = ({ label, height, color, highlight, glow }: any) => (
  <div className="flex-1 flex flex-col items-center gap-2 group">
    <div className={cn(
      "w-full rounded-t transition-all group-hover:brightness-110 relative",
      height, color,
      glow && "shadow-[0_0_15px_rgba(43,141,238,0.3)]"
    )}>
      {highlight && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary whitespace-nowrap">{highlight}</div>}
    </div>
    <span className="text-[10px] font-medium text-slate-500">{label}</span>
  </div>
);

const RiskCard = ({ icon, title, desc, risk, riskColor, riskBg, progress, progressColor, confidence }: any) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
    <div className="flex justify-between items-start mb-3">
      {icon}
      <div className="text-right">
        <span className="text-[10px] block text-slate-400">置信度 {confidence}</span>
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", riskColor, riskBg)}>{risk}</span>
      </div>
    </div>
    <h4 className="text-sm font-bold mb-1">{title}</h4>
    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{desc}</p>
    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
      <div className={cn("h-full", progressColor)} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

const StrategyItem = ({ num, text }: { num: number; text: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <span className="size-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold shrink-0">{num}</span>
    <p className="text-sm">{text}</p>
  </div>
);
