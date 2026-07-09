import React from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import { StatCard } from './StatCard';
import { 
  Zap, 
  Flame, 
  AlertTriangle, 
  TrendingUp, 
  Info,
  ShieldCheck
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { stats, reports, facilities } = useEcoCity();

  // Filter out completed reports for the live feed
  const activeReports = reports.filter((r) => r.status !== '처리 완료');

  // Eco Score status descriptors (Administrative vocabulary)
  const getEcoScoreStatus = (score: number) => {
    if (score >= 80) return { label: '우수 (EXCELLENT)', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (score >= 55) return { label: '보통 (NORMAL)', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' };
    return { label: '경고 (WARNING)', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  };

  const scoreStatus = getEcoScoreStatus(stats.ecoScore);

  // Calculate circular stroke offset
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.ecoScore / 100) * circumference;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
      
      {/* 1. 공공기관 공식 운영 안내 배너 (Operational Announcement Banner) */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3.5 shadow-sm text-xs font-semibold text-[#0a3054] leading-relaxed">
        <Info className="w-5 h-5 text-[#0284c7] flex-shrink-0 mt-0.5" />
        <div>
          <span className="block font-bold mb-0.5">📢 지자체 운영 안내:</span>
          <span>
            본 시스템은 『노 휴먼스랜드』 폐지 조치에 의거하여, 대한민국 전역 복원 구역의 실시간 환경오염 민원 수렴 및 도시 신재생 전력 가동 지표를 통합 조치하는 지자체 연동 공식 대국민 서비스 포털입니다. 시민 여러분의 안전하고 정밀한 환경 제보가 즉시 반영되어 행정 처리가 개시됩니다.
          </span>
        </div>
      </div>

      {/* 2. 대국민 주요 요약 통계 (KPI Stats Block) */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        <StatCard
          title="총 신재생 전력 생산량"
          value={`${stats.totalProduction} MW`}
          description="태양광 및 풍력 친환경 발전기 합산"
          icon={<Zap className="w-5 h-5 text-[#0284c7]" />}
          progress={Math.min(100, (stats.totalProduction / 1500) * 100)}
          color="bg-[#0284c7]"
        />

        <StatCard
          title="도시 총 전력 소비량"
          value={`${stats.totalConsumption} MW`}
          description="공장 및 스마트 아파트 단지 소비 합계"
          icon={<Flame className="w-5 h-5 text-amber-600" />}
          progress={Math.min(100, (stats.totalConsumption / 1500) * 100)}
          color="bg-amber-600"
        />

        <StatCard
          title="도시 종합 환경 오염도"
          value={`${stats.avgPollution.toFixed(1)}%`}
          description="탄소 배출 및 매연 가스 가중치 평균"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          progress={stats.avgPollution}
          color="bg-rose-500"
        />

        <StatCard
          title="미해결 환경 민원"
          value={`${activeReports.length} 건`}
          description="시민이 실시간 제보하여 조치 중인 상태"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
          progress={Math.min(100, (activeReports.length / 10) * 100)}
          color="bg-indigo-600"
        />

      </div>

      {/* 3. 메인 계측기 및 구역 현황 격자 (Dashboard Panels) */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: 종합 친환경 지수 Gauge (1 Col) */}
        <div className="portal-card p-6 flex flex-col justify-between items-center relative overflow-hidden h-[380px]">
          <div className="w-full text-left pb-3 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
              GENERAL PERFORMANCE INDICATOR
            </h3>
            <h4 className="text-base font-bold text-slate-800 mt-1">종합 친환경 지수 (Eco Score)</h4>
          </div>

          {/* Clean Public circular gauge */}
          <div className="relative flex items-center justify-center my-6">
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Slate background track */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-slate-100 fill-none"
                strokeWidth="12"
              />
              {/* Solid Blue/Emerald progress fill */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className="fill-none transition-all duration-700 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke={stats.ecoScore >= 80 ? '#10b981' : stats.ecoScore >= 55 ? '#0284c7' : '#f43f5e'}
              />
            </svg>
            
            {/* Center value label */}
            <div className="absolute text-center">
              <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">{stats.ecoScore}</span>
              <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">SCORE</span>
            </div>
          </div>

          {/* Descriptive Government rating banner */}
          <div className={`w-full py-2.5 px-4 rounded border text-center text-xs font-bold ${scoreStatus.bg} ${scoreStatus.color}`}>
            행정 평가 등급: {scoreStatus.label}
          </div>
        </div>

        {/* Right Columns: 구역별 전력 수급 및 민원 일람 (2 Cols) */}
        <div className="lg:col-span-2 portal-card p-6 flex flex-col justify-between h-[380px]">
          <div className="w-full pb-3 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
                DISTRICT OPERATION LEDGER
              </h3>
              <h4 className="text-base font-bold text-slate-800 mt-1">구역별 실시간 에너지 전력 대장</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-bold">5대 특별 지구 관제</span>
          </div>

          {/* Real table ledger representation */}
          <div className="flex-1 my-4 overflow-y-auto pr-1">
            <table className="portal-table w-full text-xs text-left">
              <thead>
                <tr>
                  <th className="p-3">관할 구획</th>
                  <th className="p-3">친환경 전력 생산</th>
                  <th className="p-3">소비 전력</th>
                  <th className="p-3">환경 오염 지수</th>
                  <th className="p-3">가동 설비</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-slate-600">
                {['A구역', 'B구역', 'C구역', 'D구역', 'E구역'].map((dist) => {
                  const distFacilities = facilities.filter(f => f.location === dist);
                  const prod = distFacilities.reduce((sum, f) => sum + f.energyProduction, 0);
                  const cons = distFacilities.reduce((sum, f) => sum + f.energyConsumption, 0);
                  const activePollution = distFacilities.reduce((sum, f) => sum + f.pollution, 0) / (distFacilities.length || 1);

                  return (
                    <tr key={dist} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{dist}</td>
                      <td className="p-3 text-emerald-600">{prod} MW</td>
                      <td className="p-3 text-amber-600">{cons} MW</td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          activePollution > 50 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {activePollution.toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{distFacilities.length}기 가동</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table summary note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold font-mono">
            <span>DATABASE: GOV-CLOUD-STORAGE</span>
            <span>TOTAL POWER ASSETS: {facilities.length} UNITS</span>
          </div>
        </div>

      </div>

      {/* 4. 실시간 시민 환경 민원 피드 (Unresolved Complaints live feed) */}
      <div className="portal-card p-6">
        <div className="pb-3 border-b border-slate-200 flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
              REAL-TIME CIVIL COMPLAINTS RESPONDER
            </h3>
            <h4 className="text-base font-bold text-slate-800 mt-1">지자체 처리 중인 실시간 시민 민원</h4>
          </div>
          <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 border border-rose-200 rounded-full animate-pulse">
            미결 민원 {activeReports.length}건 대기 중
          </span>
        </div>

        {activeReports.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mb-2.5" />
            <span className="text-xs font-bold text-slate-700">현재 미결 상태인 민원 사항이 없습니다.</span>
            <span className="text-[10px] text-slate-400 mt-1">모든 위해 요인 조치 수립 완료</span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeReports.slice(0, 3).map((rep) => (
              <div 
                key={rep.id} 
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-mono font-extrabold text-slate-400 tracking-wider">
                      {rep.location} / {rep.type}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.2 rounded-full animate-pulse">
                      {rep.status}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 leading-snug line-clamp-1">{rep.title}</h5>
                  <p className="text-[11px] text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                    {rep.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold font-mono">
                  <span>CIVIC ID: #{rep.id.slice(-4).toUpperCase()}</span>
                  <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
