import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { TabType } from '../types';

interface UserProfileProps {
  setActiveTab: (tab: TabType) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Compute eco rank level for gamification (D-4)
  const getEcoRank = (points: number) => {
    if (points >= 1000) return { title: '플래티넘 가디언 👑', desc: '대구 탄소 배출량 500kg 절감 기여자', color: 'from-blue-600 to-indigo-600 text-white' };
    if (points >= 500) return { title: '골드 세이버 🥇', desc: '지속 가능한 에코 타운 핵심 공헌자', color: 'from-amber-500 to-yellow-500 text-slate-900' };
    if (points >= 200) return { title: '실버 커뮤니터 🥈', desc: '지역 환경 저해 정화 협동 조합원', color: 'from-slate-400 to-slate-500 text-white' };
    return { title: '그린 스타터 🥉', desc: '행성 온난화 정화 운동 입문자', color: 'from-emerald-500 to-teal-500 text-white' };
  };

  const rank = getEcoRank(user.points);

  return (
    <div className="max-w-lg mx-auto px-4 py-5 pb-24 md:pb-8 space-y-5 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span>👤 마이페이지 & 회원 정보</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          현재 귀하의 디지털 시민 서명 및 활동 환경 지수를 검토하고 시스템 로그아웃을 제어합니다.
        </p>
      </div>

      {/* Profile Card Deck */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        
        {/* Core Member Area */}
        <div className="p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-center text-3xl select-none">
            {user.role === 'ADMIN' ? '👷' : '🌱'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-slate-800">{user.name}</h3>
              <span className={`text-[8px] font-black tracking-wider px-2 py-0.2 rounded border ${
                user.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {user.role === 'ADMIN' ? '지자체 공무원' : '정회원'}
              </span>
            </div>
            <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">{user.email}</span>
            <span className="block text-[10px] text-slate-400 mt-1">📍 {user.region}</span>
          </div>
        </div>

        {/* Eco Rank Milestones */}
        {user.role === 'USER' && (
          <div className="p-5 space-y-2.5">
            <span className="text-[9px] font-extrabold text-slate-400 block uppercase">CITIZEN CARBON CO2 LEVEL</span>
            <div className={`p-4 rounded-2xl bg-gradient-to-r shadow-sm ${rank.color}`}>
              <h4 className="text-sm font-black tracking-tight">{rank.title}</h4>
              <p className="text-[10px] opacity-90 mt-0.5 leading-normal leading-relaxed font-semibold">
                {rank.desc}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic points & counter stats */}
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center">
            <span className="text-[9px] font-extrabold text-slate-400 block">누적 마일리지</span>
            <span className="text-xl font-black text-slate-800 mt-1 block">{user.points} P</span>
          </div>
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center">
            <span className="text-[9px] font-extrabold text-slate-400 block">장난 허위 횟수</span>
            <span className={`text-xl font-black mt-1 block ${user.falseReportCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {user.falseReportCount}회 / 5회
            </span>
          </div>
        </div>

        {/* Administrative Actions Shortcut Panel */}
        {user.role === 'ADMIN' && (
          <div className="p-5 bg-blue-50/20 space-y-3">
            <div>
              <span className="text-[9px] font-extrabold text-blue-600 block">ADMIN ACCESS RIGHTS</span>
              <h4 className="text-xs font-bold text-slate-700 mt-0.5">지자체 행정 관리 권한 인증 완료</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                공직자 계정으로 접속하셨습니다. 시민들의 위치 기반 신고 내역 가치 심사 및 노후 시설 스마트 원격 원터치 차단을 주관할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('admin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow transition-colors cursor-pointer"
            >
              지자체 관제 패널 이동
            </button>
          </div>
        )}

        {/* Sign out controller */}
        <div className="p-5">
          <button
            onClick={() => logout()}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3.5 rounded-2xl transition-colors cursor-pointer"
          >
            시스템 로그아웃 (시민 서명 해제)
          </button>
        </div>

      </div>
    </div>
  );
};
