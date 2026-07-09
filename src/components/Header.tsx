import React, { useState, useEffect } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import type { TabType } from '../types';
import { Clock, Database, ShieldAlert, BookOpen, Activity, Globe, Leaf, Compass } from 'lucide-react';

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

  // Government portal navigation items
  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'projectInfo', label: '서비스 개요', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'reportForm', label: '시민 민원 접수', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'dashboard', label: '통합 환경 현황판', icon: <Activity className="w-4 h-4" /> },
    { id: 'map', label: '실시간 민원 지도', icon: <Compass className="w-4 h-4" /> },
    { id: 'admin', label: '지자체 행정 조치실', icon: <Database className="w-4 h-4" /> },
    { id: 'simulator', label: '에너지 시뮬레이터', icon: <Leaf className="w-4 h-4" /> },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-300">
      
      {/* 1. 최상단 공식 정부 유틸리티 가이드 바 (Top Utility Bar) */}
      <div className="w-full bg-[#111827] text-[11px] font-semibold text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block px-1 bg-slate-800 text-[10px] text-emerald-400 font-bold rounded">GOV</span>
            <span>Republic of Korea · Municipal Environmental Response Service</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="hover:text-white cursor-pointer transition-colors">Language: KR</span>
            <span className="text-slate-600">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">Accessibility</span>
            <span className="text-slate-600">|</span>
            <span className="hover:text-white cursor-pointer transition-colors flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
              <span>Open Data Portal</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. 중앙 공식 기관 대국민 브랜드 타이틀 (Main Branding Area) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Emblem & Texts */}
        <div 
          onClick={() => setActiveTab('projectInfo')}
          className="flex items-center space-x-4 cursor-pointer select-none group"
        >
          {/* Circular Government Official Seal Emblem */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#003366] bg-[#f8fafc] shadow-sm relative group-hover:bg-slate-100 transition-colors">
            <div className="w-11 h-11 rounded-full border border-dashed border-[#0284c7] flex items-center justify-center">
              <Globe className="w-6 h-6 text-[#003366] stroke-[1.8]" />
            </div>
            <span className="absolute -bottom-1 right-0 bg-[#003366] text-[8px] font-bold text-white px-1 py-0.2 rounded-full border border-white">국가</span>
          </div>

          <div>
            <span className="block text-[10px] font-mono font-extrabold tracking-widest text-slate-400 uppercase leading-none mb-1">
              PUBLIC ENVIRONMENTAL DATA PLATFORM
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] font-sans group-hover:text-[#0284c7] transition-colors leading-none flex items-center gap-1.5">
              <span>시민 위치 기반 환경·에너지 신고 시스템</span>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">EcoCity v1.2</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-bold mt-1.5">
              GPS 사진 신고, 실시간 지도, 지자체 조치 관제를 통합한 대한민국 공공 서비스 포털
            </p>
          </div>
        </div>

        {/* Action Shortcuts + Digital Clock */}
        <div className="flex items-center gap-3">
          
          {/* Live system clock with clock icon */}
          <div className="flex items-center space-x-2 font-mono text-[#003366] bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold shadow-sm">
            <Clock className="w-4 h-4 text-[#0284c7] animate-pulse" />
            <span>KST {time}</span>
          </div>

          {/* Shortcut 1: 현황 조회 */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            현황 조회
          </button>

          {/* Shortcut 2: 신고 접수 */}
          <button
            onClick={() => setActiveTab('reportForm')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#0a3054] rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            민원 접수
          </button>
        </div>

      </div>

      {/* 3. 메인 네이비 내비게이션 바 (Solid Navy navigation menu bar) */}
      <div className="w-full bg-[#0a3054] border-t border-slate-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            
            <nav className="flex items-center space-x-1 h-full overflow-x-auto no-scrollbar">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`h-12 flex items-center space-x-2 px-5 text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#0284c7] text-white border-b-2 border-white'
                        : 'text-slate-200 hover:text-white hover:bg-[#0f446e]'
                    }`}
                  >
                    {item.icon}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sync Cloud Telemetry Banner */}
            <div className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded text-[10px] font-bold font-mono border ${
              isFirebase
                ? 'bg-[#1e3a8a] text-[#60a5fa] border-blue-800'
                : 'bg-amber-950 text-amber-300 border-amber-900'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebase ? 'bg-blue-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
              <span className="whitespace-nowrap">{isFirebase ? 'CLOUD DB CONNECTED' : 'LOCAL OFFLINE'}</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-400">ECO {stats.ecoScore}</span>
            </div>

          </div>
        </div>
      </div>

    </header>
  );
};
