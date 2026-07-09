import React, { useState } from 'react';
import { EcoCityProvider } from './context/EcoCityContext';
import type { TabType } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { EnergySimulator } from './components/EnergySimulator';
import { ReportForm } from './components/ReportForm';
import { ReportMap } from './components/ReportMap';
import { AdminPanel } from './components/AdminPanel';
import { ProjectInfo } from './components/ProjectInfo';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Page switcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'simulator':
        return <EnergySimulator />;
      case 'reportForm':
        return <ReportForm />;
      case 'map':
        return <ReportMap />;
      case 'admin':
        return <AdminPanel />;
      case 'projectInfo':
        return <ProjectInfo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <EcoCityProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-700">
        
        {/* Navigation control header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic page contents */}
        <main className="flex-1 pb-16">
          {renderTabContent()}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200 bg-white/70 py-5 text-center text-xs font-semibold text-slate-400 font-mono tracking-wider backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span>© 2026 ECOCITY CONTROL CONSOLE. ALL RIGHTS RESERVED.</span>
            <span className="flex items-center gap-1.5">
              <span>DESIGNED FOR DGSW HACKATHON</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600">TEAM PJ FRONTEND</span>
            </span>
          </div>
        </footer>

      </div>
    </EcoCityProvider>
  );
};

export default App;
