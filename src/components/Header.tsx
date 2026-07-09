import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import type { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { user, isFirebase } = useAuth();
  const [time, setTime] = useState<string>('');
  const [unresolvedCount, setUnresolvedCount] = useState<number>(0);

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

  // Monitor unresolved reports for the badge notification
  useEffect(() => {
    const unsub = dbService.listenReports((data) => {
      const pending = data.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED' && r.isMeaningful).length;
      setUnresolvedCount(pending);
    });
    return () => unsub();
  }, []);

  // Custom menu items depending on current user login roles
  const getMenuItems = () => {
    if (!user) return [];

    const items = [
      { id: 'map' as TabType, label: '실시간 제보지도 🗺️' },
      { id: 'reportForm' as TabType, label: '찰칵 간편신고 📸' },
      { id: 'myReports' as TabType, label: '나의 보관함 📂' },
      { id: 'ranking' as TabType, label: '기여 랭킹 🏆' },
      { id: 'points' as TabType, label: '포인트숍 💚' },
      { id: 'profile' as TabType, label: '마이페이지 👤' },
    ];

    // Only expose Admin panel to administrators
    if (user.role === 'ADMIN') {
      items.push({ id: 'admin' as TabType, label: '지자체 관제실 👷' });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <header className="w-full bg-white border-b border-slate-200">
      
      {/* 1. Top Government Utility Ribbon */}
      <div className="w-full bg-[#111827] text-[10px] font-semibold text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800 flex justify-between items-center font-mono">
        <div className="flex items-center space-x-2">
          <span className="inline-block px-1 bg-[#0284c7] text-[9px] text-white font-extrabold rounded">GOV</span>
          <span>공공 통합 기후 에너지 시민 자율 관제 포털</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          <span>KOREA STANDARD TIME (KST) : {time}</span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isFirebase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            <span>{isFirebase ? 'ACTIVE REAL-TIME SERVER' : 'LOCAL CACHE MODE'}</span>
          </span>
        </div>
      </div>

      {/* 2. Main Portal Title & Live Points HUD */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo and Subtitle */}
        <div 
          onClick={() => setActiveTab('map')}
          className="flex items-center space-x-3.5 cursor-pointer select-none group"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl border-2 border-slate-900 bg-slate-50 relative group-hover:bg-slate-100 transition-all">
            <span className="text-2xl">📸</span>
          </div>

          <div>
            <span className="block text-[9px] font-mono font-extrabold tracking-widest text-[#0284c7] uppercase leading-none">
              MUNICIPAL CARBON REDUCTION PORTAL
            </span>
            <h1 className="text-lg font-black tracking-tight text-[#0f172a] mt-1 group-hover:text-emerald-600 transition-colors leading-none flex items-center gap-1.5">
              <span>찰칵 (Chalkak)</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">CO2 CONTROL</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1 leading-none">
              대구광역시 달성군 시민 환경 신고 및 에코 마일리지 관제 센터
            </p>
          </div>
        </div>

        {/* User Auth Info HUD */}
        {user && (
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between bg-slate-50 p-2.5 px-4 rounded-2xl border border-slate-100/70">
            <div className="text-left">
              <span className="block text-[8px] text-slate-400 font-extrabold">AUTHENTICATED CITIZEN</span>
              <span className="text-xs font-black text-slate-800 leading-tight">
                {user.name} {user.role === 'ADMIN' ? '관리관' : '시민님'}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-right">
              <span className="block text-[8px] text-slate-400 font-extrabold">REDEEMABLE ENERGY</span>
              <span className="text-xs font-black text-emerald-600 leading-tight">
                {user.points} P
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Horizontal Menu bar (visible on Desktop / Tablet) */}
      {user && menuItems.length > 0 && (
        <div className="w-full bg-slate-900 border-t border-slate-800 hidden md:block">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-11">
              <nav className="flex items-center h-full">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`h-11 flex items-center px-5 text-[11px] font-extrabold transition-all relative ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                      
                      {/* Notification dot on Admin tab for pending reviews */}
                      {item.id === 'admin' && unresolvedCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white border border-slate-900">
                          {unresolvedCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="text-[10px] text-emerald-400 font-bold font-mono uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>CO2 TELEMETRY ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
