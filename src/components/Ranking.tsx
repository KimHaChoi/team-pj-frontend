import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

export const Ranking: React.FC = () => {
  const { getAllUsers, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [scope, setScope] = useState<'NATIONAL' | 'REGIONAL' | 'NEIGHBORHOOD'>('NATIONAL');

  useEffect(() => {
    const loadRankings = async () => {
      const allUsers = await getAllUsers();
      // Filter out admins and trollers, sort users by points desc
      const citizenUsers = allUsers
        .filter((u) => u.role === 'USER')
        .sort((a, b) => b.points - a.points);
      setUsers(citizenUsers);
    };

    loadRankings();
  }, [getAllUsers, user]);

  // Simulated scope filtering
  const getFilteredRankings = () => {
    if (!user) return users;
    
    if (scope === 'REGIONAL') {
      // Filter users who belong to approximately the same city/district
      return users.filter(u => u.region.includes('대구시') || u.region.includes('달성군'));
    }
    if (scope === 'NEIGHBORHOOD') {
      // Filter users who belong to exact matching neighborhood (e.g. 유가읍, 현풍읍 등)
      const userDong = user.region.split(' ').pop() || '';
      return users.filter(u => u.region.includes(userDong));
    }
    return users;
  };

  const rankedList = getFilteredRankings();

  // Helper to mask email for security compliance
  const maskEmail = (email: string) => {
    const parts = email.split('@');
    if (parts.length !== 2) return 'citizen***';
    const id = parts[0];
    const domain = parts[1];
    if (id.length <= 3) {
      return `${id}***@${domain}`;
    }
    return `${id.substring(0, 3)}***@${domain}`;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-5 pb-24 md:pb-8 space-y-5 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span>🏆 시민 기여 랭킹</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          환경을 구하고 에너지를 절약하는 지구 수호 시민 랭킹입니다. 해결 완료 시 AI 점수가 마일리지로 가산됩니다.
        </p>
      </div>

      {/* Scope Toggles */}
      <div className="bg-slate-50 border border-slate-100 p-1 rounded-2xl flex">
        <button
          onClick={() => setScope('NATIONAL')}
          className={`flex-1 py-2 text-[10px] font-extrabold rounded-xl text-center cursor-pointer transition-all ${
            scope === 'NATIONAL'
              ? 'bg-white border border-slate-100/50 shadow-sm text-emerald-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          🇰🇷 전국 랭킹
        </button>
        <button
          onClick={() => setScope('REGIONAL')}
          className={`flex-1 py-2 text-[10px] font-extrabold rounded-xl text-center cursor-pointer transition-all ${
            scope === 'REGIONAL'
              ? 'bg-white border border-slate-100/50 shadow-sm text-emerald-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          🏙️ 달성군 랭킹
        </button>
        <button
          onClick={() => setScope('NEIGHBORHOOD')}
          className={`flex-1 py-2 text-[10px] font-extrabold rounded-xl text-center cursor-pointer transition-all ${
            scope === 'NEIGHBORHOOD'
              ? 'bg-white border border-slate-100/50 shadow-sm text-emerald-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          🏠 우리 동네
        </button>
      </div>

      {/* Self Profile HUD Panel */}
      {user && user.role === 'USER' && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl p-5 shadow-md space-y-3.5 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10 font-bold text-[80px] pointer-events-none select-none">
            🌱
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <span className="text-[9px] font-extrabold text-emerald-200">MY ENVIRONMENTAL STATUS</span>
              <h4 className="text-sm font-black mt-0.5">{user.name} 시민님</h4>
              <span className="block text-[9px] text-emerald-100 mt-1">📍 {user.region}</span>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] text-emerald-200 block">보유 에너지 마일리지</span>
              <span className="text-2xl font-black">{user.points} P</span>
            </div>
          </div>

          <div className="h-px bg-white/10 relative z-10" />

          {/* Rank prediction */}
          <div className="flex justify-between items-center text-[10px] font-bold text-emerald-100 relative z-10">
            <span>나의 랭킹 등수 (추정)</span>
            <span>
              총 {rankedList.findIndex(u => u.uid === user.uid) + 1}위 / {rankedList.length}명 중
            </span>
          </div>
        </div>
      )}

      {/* Rankings Leaderboard List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-3 space-y-2">
        <div className="flex text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 pb-2 px-3">
          <span className="w-12 text-center">Rank</span>
          <span className="flex-1">Contributor</span>
          <span className="w-20 text-right">Points</span>
        </div>

        {rankedList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            아직 활성화된 기여 시민이 존재하지 않습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {rankedList.map((contributor, idx) => {
              const isSelf = contributor.uid === user?.uid;
              const rank = idx + 1;

              // Rank style presets
              let rankStyle = 'text-slate-400 font-bold';
              let badgeEmoji = '';
              if (rank === 1) {
                rankStyle = 'text-amber-500 font-black text-base';
                badgeEmoji = '🥇';
              } else if (rank === 2) {
                rankStyle = 'text-slate-400 font-black text-base';
                badgeEmoji = '🥈';
              } else if (rank === 3) {
                rankStyle = 'text-amber-700 font-black text-base';
                badgeEmoji = '🥉';
              }

              return (
                <div 
                  key={contributor.uid}
                  className={`flex items-center py-3.5 px-3 rounded-2xl transition-colors ${
                    isSelf ? 'bg-emerald-50/50 border border-emerald-50' : 'bg-transparent'
                  }`}
                >
                  {/* Rank column */}
                  <div className="w-12 flex justify-center items-center">
                    {badgeEmoji !== '' ? (
                      <span className="text-xl" title={`${rank}등`}>{badgeEmoji}</span>
                    ) : (
                      <span className={`font-mono text-xs ${rankStyle}`}>{rank}</span>
                    )}
                  </div>

                  {/* Nickname & Region column */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold leading-tight ${isSelf ? 'text-emerald-700 font-extrabold' : 'text-slate-700'}`}>
                        {contributor.name}
                      </span>
                      {isSelf && (
                        <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-md">
                          MY
                        </span>
                      )}
                    </div>
                    <span className="block text-[9px] text-slate-400 truncate mt-0.5 font-medium">
                      {maskEmail(contributor.email)} • {contributor.region}
                    </span>
                  </div>

                  {/* Cumulative Points column */}
                  <div className="w-20 text-right">
                    <span className="text-xs font-black text-slate-700 block">
                      {contributor.points} P
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      환경 지킴이
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
