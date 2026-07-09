import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import type { Report } from '../types';

export const MyReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsub = dbService.listenUserReports(user.uid, (data) => {
      setReports(data);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  const getCategoryEmoji = (cat: Report['category']) => {
    const mapping = { ENERGY_WASTE: '💡', POLLUTION: '🏭', ILLEGAL_DUMPING: '🗑️', NOISE: '🔊', ETC: '⚙️' };
    return mapping[cat] || '❓';
  };

  const getCategoryLabel = (cat: Report['category']) => {
    const mapping = { ENERGY_WASTE: '에너지 낭비', POLLUTION: '환경 오염', ILLEGAL_DUMPING: '무단 투기', NOISE: '심각한 소음', ETC: '기타 민원' };
    return mapping[cat] || '일반 제보';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400 font-bold">나의 신고 보관함 조회 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5 pb-24 md:pb-8 space-y-5 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span>📂 나의 신고 보관함</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          귀하께서 제출하신 환경·에너지 제보 내역 및 실시간 AI 행정 처리 진행 정황을 확인합니다.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center space-y-3.5">
          <span className="text-4xl block">🍃</span>
          <div>
            <h4 className="text-xs font-bold text-slate-700">접수된 신고 내역이 존재하지 않습니다.</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              주변에서 목격한 에너지 낭비 사각지대나 환경 오염 요소를 찰칵 제보하고 환경 포인트를 획득해 보세요!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            return (
              <div 
                key={report.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4.5 space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Top Badge HUD */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{getCategoryEmoji(report.category)}</span>
                    <span>{getCategoryLabel(report.category)}</span>
                  </span>
                  <span className="text-[9px] font-bold font-mono text-slate-400">
                    ID: {report.id}
                  </span>
                </div>

                {/* Progress Steps Timeline */}
                <div className="grid grid-cols-3 gap-1 relative py-1">
                  {/* Background Bar */}
                  <div className="absolute top-1/2 left-[16.6%] right-[16.6%] h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                  
                  {/* Status Fill Line */}
                  <div 
                    className="absolute top-1/2 left-[16.6%] h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" 
                    style={{ 
                      width: report.status === 'RECEIVED' ? '0%' : report.status === 'IN_PROGRESS' ? '50%' : '100%',
                      backgroundColor: report.status === 'REJECTED' ? '#ef4444' : '#10b981'
                    }}
                  />

                  {/* Step 1: RECEIVED */}
                  <div className="flex flex-col items-center text-center z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                      report.status === 'RECEIVED' || report.status === 'IN_PROGRESS' || report.status === 'RESOLVED'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-slate-300 border-slate-200'
                    }`}>
                      1
                    </div>
                    <span className={`text-[9px] mt-1 font-extrabold ${
                      report.status === 'RECEIVED' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>접수 대기</span>
                  </div>

                  {/* Step 2: IN_PROGRESS */}
                  <div className="flex flex-col items-center text-center z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                      report.status === 'IN_PROGRESS' || report.status === 'RESOLVED'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-slate-300 border-slate-200'
                    }`}>
                      2
                    </div>
                    <span className={`text-[9px] mt-1 font-extrabold ${
                      report.status === 'IN_PROGRESS' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>현장 조치 중</span>
                  </div>

                  {/* Step 3: RESOLVED / REJECTED */}
                  <div className="flex flex-col items-center text-center z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                      report.status === 'RESOLVED'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : report.status === 'REJECTED'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-white text-slate-300 border-slate-200'
                    }`}>
                      {report.status === 'REJECTED' ? '✕' : '3'}
                    </div>
                    <span className={`text-[9px] mt-1 font-extrabold ${
                      report.status === 'RESOLVED' 
                        ? 'text-emerald-600' 
                        : report.status === 'REJECTED'
                        ? 'text-rose-500'
                        : 'text-slate-400'
                    }`}>
                      {report.status === 'REJECTED' ? '반려 처리' : '해결 완료'}
                    </span>
                  </div>
                </div>

                {/* Report Info card */}
                <div className="flex gap-3 bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                  <img 
                    src={report.imageUrl} 
                    alt="신고" 
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200/60"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{report.title}</h4>
                    {report.description && (
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{report.description}</p>
                    )}
                    <span className="inline-block text-[9px] font-semibold text-slate-400 mt-2">
                      📍 {report.address || '위치 자동 매핑'}
                    </span>
                  </div>
                </div>

                {/* AI Score Feedback HUD */}
                <div className="flex justify-between items-center text-[10px] font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold">🤖 AI 중요도 판정 지수</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-extrabold font-mono">{report.aiScore}점</span>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                      report.aiScore >= 75 ? 'bg-rose-50 text-rose-600' : report.aiScore >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {report.aiScore >= 75 ? '긴급' : report.aiScore >= 40 ? '보통' : '일반'}
                    </span>
                  </div>
                </div>

                {/* Point Earned HUD (only displayed if RESOLVED) */}
                {report.status === 'RESOLVED' && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[10px] font-bold text-emerald-800 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-1.5">
                      <span>🎉</span>
                      <span>종합 조치 완료 및 환경 마일리지 지급!</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600">+{report.aiScore} P</span>
                  </div>
                )}

                {/* Admin Assigned Action Result memo showcase */}
                {report.assignedTo && (
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-[10px] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">👷</span>
                      <span className="font-bold text-slate-700">행정 현장 조치 경과 보고</span>
                    </div>
                    <div className="text-slate-500 font-semibold space-y-1 pl-1">
                      <div>담당 배정: <strong className="text-slate-700">{report.assignedTo}</strong></div>
                      {report.resultMemo && (
                        <div className="mt-1 leading-normal leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100 text-slate-600">
                          {report.resultMemo}
                        </div>
                      )}
                    </div>
                    {report.resultImageUrl && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="block text-[8px] text-slate-400 font-extrabold mb-1">조치 전 (시민 제보)</span>
                          <img src={report.imageUrl} alt="전" className="w-full h-16 object-cover rounded-lg border border-slate-200" />
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-extrabold mb-1">조치 후 (완료 증빙)</span>
                          <img src={report.resultImageUrl} alt="후" className="w-full h-16 object-cover rounded-lg border border-emerald-200" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-[9px] text-slate-300 font-extrabold font-mono text-right">
                  제보 일자: {new Date(report.createdAt).toLocaleString('ko-KR')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
