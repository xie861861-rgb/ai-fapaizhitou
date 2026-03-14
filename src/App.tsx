import React, { useState } from 'react';
import { Header, Footer } from './components/Layout';
import { MarketAnalysis } from './components/MarketAnalysis';
import { PropertyDetail } from './components/PropertyDetail';
import { AnalysisWorkflow } from './components/AnalysisWorkflow';
import { Property } from './types';

import { MemberCenter } from './components/MemberCenter';
import { AdminDashboard } from './components/AdminDashboard';
import { Workbench } from './components/Workbench';

type AppState = 'market' | 'detail' | 'workflow' | 'member' | 'admin' | 'workbench';

export default function App() {
  const [state, setState] = useState<AppState>('market');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setState('detail');
  };

  const startNewAnalysis = () => {
    setState('workflow');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Header 
        onStartAnalysis={startNewAnalysis} 
        onGoToMember={() => setState('member')}
        onGoToAdmin={() => setState('admin')}
        onGoHome={() => setState('market')}
        onGoToWorkbench={() => setState('workbench')}
      />
      
      {state === 'detail' && selectedProperty ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white dark:bg-slate-900 px-6 py-2 border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setState('market')}
              className="text-sm text-slate-500 hover:text-primary flex items-center gap-1 transition-colors"
            >
              ← 返回市场分析
            </button>
          </div>
          <PropertyDetail property={selectedProperty} />
        </div>
      ) : state === 'workflow' ? (
        <AnalysisWorkflow onComplete={(prop) => {
          setSelectedProperty(prop);
          setState('detail');
        }} onCancel={() => setState('market')} />
      ) : state === 'member' ? (
        <MemberCenter />
      ) : state === 'admin' ? (
        <AdminDashboard />
      ) : state === 'workbench' ? (
        <Workbench onSelectProperty={handleSelectProperty} />
      ) : (
        <MarketAnalysis onSelectProperty={handleSelectProperty} onStartAnalysis={startNewAnalysis} />
      )}

      {(state === 'market' || state === 'member' || state === 'admin' || state === 'workbench') && (
        <Footer onGoToAdmin={() => setState('admin')} />
      )}
    </div>
  );
}
