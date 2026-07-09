import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { TabType } from './types';
import { Header } from './components/Header';
import { ReportForm } from './components/ReportForm';
import { ReportMap } from './components/ReportMap';
import { MyReports } from './components/MyReports';
import { Ranking } from './components/Ranking';
import { Points } from './components/Points';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import { BottomNavigation } from './components/BottomNavigation';

const MainAppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('map'); // Default page to Map for premium map dashboard focus

  // 1. Core Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400 font-bold font-mono uppercase tracking-widest animate-pulse">
          Connecting Carbon Gateway...
        </span>
      </div>
    );
  }

  // 2. Unauthenticated Shield Gate
  if (!user) {
    return <div className="animate-fadeIn"><AuthScreenBridge /></div>;
  }

  // 3. Page Switcher Routing Logic
  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return <ReportMap />;
      case 'reportForm':
        return <ReportForm onSuccessRedirect={() => setActiveTab('myReports')} />;
      case 'myReports':
        return <MyReports />;
      case 'ranking':
        return <Ranking />;
      case 'points':
        return <Points />;
      case 'profile':
        return <UserProfile setActiveTab={setActiveTab} />;
      case 'admin':
        // Strict Admin Role Guard
        if (user.role === 'ADMIN') {
          return <AdminPanel />;
        }
        // Force redirect to Map if hijacked
        return <ReportMap />;
      default:
        return <ReportMap />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-700">
      <div>
        {/* Navigation control header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic page contents */}
        <main className="flex-1">
          {renderTabContent()}
        </main>
      </div>

      {/* Floating Bottom Nav for Mobile layout screen sizes */}
      <BottomNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-white/70 py-6 text-center text-xs font-semibold text-slate-400 font-mono tracking-wider backdrop-blur-md hidden md:block">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>© 2026 CHALKAK CO2 CONTROL. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center gap-1.5">
            <span>DESIGNED FOR DGSW HACKATHON</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600">TEAM PJ FRONTEND</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

// Local component bridge to avoid circular import issues inside AuthScreen
import { AuthScreen } from './components/AuthScreen';
const AuthScreenBridge: React.FC = () => {
  return <AuthScreen />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
