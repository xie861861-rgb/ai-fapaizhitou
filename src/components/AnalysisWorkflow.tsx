import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Upload, Link as LinkIcon, CheckCircle2, Loader2, UserPlus, ArrowRight, X, FileText, ShieldAlert, Calculator, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { Property, MOCK_PROPERTIES } from '../types';
import { cn } from '../lib/utils';

type Step = 'welcome' | 'register' | 'upload' | 'link' | 'analyzing';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'parsing' | 'complete' | 'error';
  error?: string;
}

interface AnalysisWorkflowProps {
  onComplete: (property: Property) => void;
  onCancel: () => void;
}

export const AnalysisWorkflow: React.FC<AnalysisWorkflowProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [link, setLink] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (uploadedFiles.length + selectedFiles.length > 5) {
      alert('最多支持上传 5 个文件');
      return;
    }

    const newFiles: UploadedFile[] = selectedFiles.map((f: File) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      // Validation
      if (f.size > 20 * 1024 * 1024) {
        return { id, file: f, status: 'error', error: '文件大小超过 20MB' };
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(f.type)) {
        return { id, file: f, status: 'error', error: '仅支持 PDF、JPG、PNG 格式' };
      }

      return { id, file: f, status: 'uploading' };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and parsing for each valid file
    newFiles.forEach(f => {
      if (f.status === 'error') return;

      setTimeout(() => {
        setUploadedFiles(prev => prev.map(p => p.id === f.id ? { ...p, status: 'success' } : p));
        
        setTimeout(() => {
          setUploadedFiles(prev => prev.map(p => p.id === f.id ? { ...p, status: 'parsing' } : p));
          
          setTimeout(() => {
            // Randomly fail some files for demo purposes if they are not "court" like (simulated)
            const isInvalid = f.file.name.toLowerCase().includes('test');
            if (isInvalid) {
              setUploadedFiles(prev => prev.map(p => p.id === f.id ? { ...p, status: 'error', error: '抱歉，无法解析该文件，请上传清晰的法院PDF/图片（查封、权属相关）' } : p));
            } else {
              setUploadedFiles(prev => prev.map(p => p.id === f.id ? { ...p, status: 'complete' } : p));
            }
          }, 2000);
        }, 1000);
      }, 1000);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  useEffect(() => {
    if (currentStep === 'analyzing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => onComplete(MOCK_PROPERTIES[0]), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentStep, onComplete]);

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
                onClick={() => setCurrentStep('register')}
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

      case 'register':
        return (
          <motion.div 
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-bold">创建您的投资档案</h3>
              <p className="text-sm text-slate-500">为了提供精准的研判报告，请先完成注册</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">手机号码</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-primary" placeholder="请输入手机号" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">验证码</label>
                <div className="flex gap-2">
                  <input className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-primary" placeholder="请输入验证码" />
                  <button className="px-4 py-2 text-primary font-bold text-sm border border-primary/20 rounded-lg hover:bg-primary/5">获取</button>
                </div>
              </div>
              <button 
                onClick={() => setCurrentStep('upload')}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-all"
              >
                立即注册并继续
              </button>
            </div>
          </motion.div>
        );

      case 'upload':
        return (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">上传法院卷宗 (PDF/图片)</h3>
              <p className="text-slate-500">AI 将自动提取关键法律信息、查封记录及抵押情况</p>
            </div>

            <div 
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center space-y-4 transition-all cursor-pointer",
                uploadedFiles.length > 0 ? "border-primary/30 bg-primary/5" : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
              )}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                multiple
                accept=".pdf,image/jpeg,image/png"
                onChange={handleFileUpload}
              />
              <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Upload size={24} />
              </div>
              <div>
                <p className="font-bold">点击或拖拽文件至此</p>
                <p className="text-xs text-slate-500 mt-1">支持 PDF、JPG、PNG（单个 ≤ 20MB，最多 5 个）</p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                {uploadedFiles.map((f) => (
                  <div key={f.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "size-10 rounded-lg flex items-center justify-center shrink-0",
                        f.status === 'error' ? "bg-rose-100 text-rose-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}>
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{f.file.name}</p>
                        <div className="flex items-center gap-2">
                          {f.status === 'uploading' && <span className="text-[10px] text-primary animate-pulse font-bold">上传中...</span>}
                          {f.status === 'success' && <span className="text-[10px] text-green-500 font-bold">上传成功</span>}
                          {f.status === 'parsing' && (
                            <span className="text-[10px] text-primary flex items-center gap-1 font-bold">
                              <Loader2 size={10} className="animate-spin" /> 解析中...
                            </span>
                          )}
                          {f.status === 'complete' && <span className="text-[10px] text-green-500 flex items-center gap-1 font-bold"><CheckCircle2 size={10} /> 解析完成</span>}
                          {f.status === 'error' && <span className="text-[10px] text-rose-500 font-bold">{f.error}</span>}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                      className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl text-[10px] text-slate-500 flex items-start gap-3">
              <ShieldCheck className="shrink-0 text-primary" size={16} />
              <p>
                <strong>数据安全保障：</strong> 我们仅存储解析后的结构化文本信息（如地址、权属等），不存储您的原始 PDF 或图片文件。解析完成后，临时文件将自动从服务器物理删除。
              </p>
            </div>

            <div className="flex justify-center">
              <button 
                disabled={uploadedFiles.length === 0 || uploadedFiles.some(f => f.status !== 'complete' && f.status !== 'error') || !uploadedFiles.some(f => f.status === 'complete')}
                onClick={() => setCurrentStep('link')}
                className="bg-primary text-white px-12 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:bg-primary/90 transition-all"
              >
                下一步
              </button>
            </div>
          </motion.div>
        );

      case 'link':
        return (
          <motion.div 
            key="link"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">粘贴拍卖链接</h3>
              <p className="text-slate-500">支持阿里拍卖、京东拍卖、公拍网等主流平台</p>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2">
                <LinkIcon className="ml-4 text-slate-400" size={24} />
                <input 
                  className="w-full py-4 px-4 bg-transparent border-none focus:ring-0 text-lg" 
                  placeholder="https://sf.taobao.com/item/..." 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                disabled={!link}
                onClick={() => setCurrentStep('analyzing')}
                className="bg-primary text-white px-12 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:bg-primary/90 transition-all"
              >
                开始 AI 深度研判
              </button>
            </div>
          </motion.div>
        );

      case 'analyzing':
        const agents = [
          { id: 'pdf', label: 'PDF解析智能体', icon: <FileText size={14} />, stage: '提取核心结构化文本', threshold: 0 },
          { id: 'link', label: '链接解析智能体', icon: <LinkIcon size={14} />, stage: '抓取网页房源数据', threshold: 15 },
          { id: 'risk', label: '风险研判智能体', icon: <ShieldAlert size={14} />, stage: '评估过户/腾退可行性', threshold: 30 },
          { id: 'valuation', label: '估值测算智能体', icon: <Calculator size={14} />, stage: '预估成交价与贷款空间', threshold: 50 },
          { id: 'bidding', label: '竞拍辅助智能体', icon: <TrendingUp size={14} />, stage: '计算建议心理价位', threshold: 70 },
          { id: 'tax', label: '税费测算智能体', icon: <Wallet size={14} />, stage: '测算基础交易税费', threshold: 85 },
        ];

        return (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center space-y-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                <Brain size={14} /> MCP 多智能体协同引擎已启动
              </div>
              <h3 className="text-3xl font-black">AI 正在深度研判中...</h3>
              <p className="text-slate-500 max-w-lg mx-auto">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  MCP 调度引擎正在驱动 6 大子智能体并发执行任务...
                </motion.span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {agents.map((agent) => {
                const isCompleted = progress > agent.threshold + 20 || progress === 100;
                const isActive = progress >= agent.threshold && !isCompleted;
                
                return (
                  <motion.div 
                    key={agent.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-300 flex items-start gap-4",
                      isCompleted ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : 
                      isActive ? "bg-primary/5 dark:bg-primary/10 border-primary shadow-lg shadow-primary/5" : 
                      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60"
                    )}
                  >
                    <div className={cn(
                      "size-10 rounded-lg flex items-center justify-center shrink-0",
                      isCompleted ? "bg-green-500 text-white" : 
                      isActive ? "bg-primary text-white animate-pulse" : 
                      "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      {isCompleted ? <CheckCircle2 size={20} /> : agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-sm font-bold",
                          isCompleted ? "text-green-700 dark:text-green-400" : 
                          isActive ? "text-primary" : "text-slate-500"
                        )}>
                          {agent.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-black text-primary animate-pulse">RUNNING</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{agent.stage}</p>
                      {isActive && (
                        <div className="mt-2 h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="h-full bg-primary"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                <span>研判总进度</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
                <motion.div 
                  className="h-full bg-primary rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
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

      {/* Step indicators */}
      {currentStep !== 'welcome' && currentStep !== 'analyzing' && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {['register', 'upload', 'link'].map((s, i) => (
            <div 
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                currentStep === s ? "w-8 bg-primary" : "w-2 bg-slate-300 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
