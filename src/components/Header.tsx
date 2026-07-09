import React, { useState, useEffect } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import type { TabType } from '../types';
import { Activity, Clock, Database, Leaf, ShieldAlert, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { isFirebase, stats } = useEcoCity();
  const [time, setTime] = useState<string>('');

  // Digital clock update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: '대시보드', icon: <Activity className="w-4 h-4" /> },
    { id: 'simulator', label: '에너지 시뮬레이터', icon: <Leaf className="w-4 h-4" /> },
    { id: 'reportForm', label: '시민 환경 신고', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'map', label: '신고 지도', icon: <Database className="w-4 h-4" /> },
    { id: 'admin', label: '관리자 개선', icon: <Database className="w-4 h-4" /> },
    { id: 'projectInfo', label: '프로젝트 소개', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Eco Score indicator */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md shadow-emerald-500/10 group-hover:scale-102 transition-transform">
            <Leaf className="w-5 h-5 text-white stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
              EcoCity
            </h1>
            <p className="text-[10px] text-slate-500 font-bold font-mono leading-none tracking-widest uppercase">
              Control Console v1.2
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-100 border border-slate-200/80 text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System telemetry (Firebase status + Time) */}
        <div className="flex items-center space-x-4">
          
          {/* Connection Status Pill */}
          <div className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wide border whitespace-nowrap ${
            isFirebase
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isFirebase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            <span className="whitespace-nowrap">{isFirebase ? 'FIREBASE CLOUD' : 'LOCAL OFFLINE'}</span>
          </div>

          {/* Eco Score small Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg whitespace-nowrap">
            <span className="text-[10px] text-slate-400 font-bold font-mono whitespace-nowrap">ECO SCORE</span>
            <span className={`text-xs font-mono font-bold whitespace-nowrap ${
              stats.ecoScore >= 80 ? 'text-emerald-600' : stats.ecoScore >= 55 ? 'text-cyan-600' : 'text-rose-600'
            }`}>
              {stats.ecoScore}
            </span>
          </div>

          {/* Time Display */}
          <div className="flex items-center space-x-2 font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="whitespace-nowrap">{time}</span>
          </div>

        </div>
      </div>

      {/* Mobile navigation menu bar */}
      <div className="lg:hidden flex items-center justify-around h-12 bg-white border-t border-slate-200 overflow-x-auto px-2 space-x-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-shrink-0 px-2.5 py-1 text-[9px] font-bold rounded transition-all whitespace-nowrap ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span className="mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
