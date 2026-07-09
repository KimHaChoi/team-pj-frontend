import React, { useState } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import type { Facility } from '../types';
import { 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Moon, 
  Sun, 
  Info,
  AlertOctagon,
  Power,
  ShieldCheck,
  ZapOff
} from 'lucide-react';

export const EnergySimulator: React.FC = () => {
  const { 
    facilities, 
    addEcoPlant, 
    replaceAgingFacilities, 
    toggleStreetlightSaving, 
    isStreetlightSavingActive,
    resetData
  } = useEcoCity();

  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const districts: ('A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역')[] = ['A구역', 'B구역', 'C구역', 'D구역', 'E구역'];

  // Handle adding eco plant to selected district
  const handleAddPlant = async (district: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역') => {
    await addEcoPlant(district);
    setIsAddingPlant(false);
  };

  // Handle system DB reset
  const handleReset = async () => {
    setIsResetting(true);
    await resetData();
    setTimeout(() => setIsResetting(false), 800);
  };

  // Icon mapper for facilities
  const getFacilityIcon = (type: Facility['type']) => {
    switch (type) {
      case 'thermal': return <Power className="w-5 h-5 text-rose-500" />;
      case 'solar': return <Sun className="w-5 h-5 text-emerald-500 animate-spin-slow" />;
      case 'wind': return <RefreshCw className="w-5 h-5 text-teal-500" />;
      case 'factory': return <AlertOctagon className="w-5 h-5 text-amber-500" />;
      case 'streetlight': return <Moon className="w-5 h-5 text-cyan-500" />;
      default: return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  // Check if there are any active aging facilities in the city
  const agingCount = facilities.filter(f => f.isAging).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          도시 에너지 시뮬레이터 (Simulator)
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-xl font-medium">
          도시 전역 시설들의 에너지를 통제하고 정책을 가상 제어하는 센터입니다. 버튼 상호작용 시 전력 생산량과 오염도가 즉시 재계산되어 적용됩니다.
        </p>
      </div>

      {/* Simulator Control Panel Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-md shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-cyan-500/5 filter blur-3xl" />
        
        <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span>친환경 에너지 정책 콘트롤 타워</span>
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Action 1: Add solar plant */}
          <div className="relative">
            {!isAddingPlant ? (
              <button
                onClick={() => setIsAddingPlant(true)}
                className="w-full flex flex-col items-center justify-center gap-2 p-4 h-28 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-600 font-bold transition-all group hover:scale-[1.01]"
              >
                <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform" />
                <span className="text-xs">친환경 태양광 발전소 추가</span>
                <span className="text-[9px] font-semibold text-slate-500">생산량 +150MW / 오염도 0%</span>
              </button>
            ) : (
              <div className="flex flex-col justify-center gap-2 p-3 h-28 rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
                <span className="text-[10px] text-center font-bold text-slate-400 font-mono">구역을 선택하십시오</span>
                <div className="grid grid-cols-5 gap-1">
                  {districts.map((dist) => (
                    <button
                      key={dist}
                      onClick={() => handleAddPlant(dist)}
                      className="px-1 py-1 text-[10px] font-bold rounded bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-500"
                    >
                      {dist.replace('구역', '')}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsAddingPlant(false)}
                  className="mt-1 text-[9px] font-bold text-rose-500 hover:underline"
                >
                  취소
                </button>
              </div>
            )}
          </div>

          {/* Action 2: Replace aging facilities */}
          <button
            onClick={replaceAgingFacilities}
            disabled={agingCount === 0}
            className={`w-full flex flex-col items-center justify-center gap-2 p-4 h-28 rounded-xl border transition-all ${
              agingCount > 0
                ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-600 font-bold hover:scale-[1.01]'
                : 'border-slate-100 bg-slate-100/50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className={`w-6 h-6 ${agingCount > 0 ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-bold">노후 발전/공장 교체</span>
            <span className="text-[9px] font-semibold text-slate-500">
              {agingCount > 0 ? `노후 설비 ${agingCount}개 고효율 개량` : '노후 설비 없음'}
            </span>
          </button>

          {/* Action 3: Streetlight Saving mode */}
          <button
            onClick={toggleStreetlightSaving}
            className={`w-full flex flex-col items-center justify-center gap-2 p-4 h-28 rounded-xl border transition-all hover:scale-[1.01] ${
              isStreetlightSavingActive
                ? 'border-cyan-400 bg-cyan-100 text-cyan-600 font-bold'
                : 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100/70 text-cyan-600 font-bold'
            }`}
          >
            <Moon className={`w-6 h-6 ${isStreetlightSavingActive ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-bold">가로등 야간 절전 모드</span>
            <span className="text-[9px] font-semibold text-slate-500">
              {isStreetlightSavingActive ? '가로등 전력 60% 절감 중' : '가로등 전력 절감 가동'}
            </span>
          </button>

          {/* Action 4: Reset database */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full flex flex-col items-center justify-center gap-2 p-4 h-28 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all hover:scale-[1.01]"
          >
            <RefreshCw className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold">시뮬레이터 초기화</span>
            <span className="text-[9px] font-semibold text-slate-400">기본 도시 구성으로 원복</span>
          </button>

        </div>
      </div>

      {/* Facilities Grid List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-slate-600 flex items-center space-x-2">
          <span>도시 복원 시설 목록 ({facilities.length}개 가동 중)</span>
        </h3>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {facilities.map((fac) => {
            const hasWarning = fac.isAging && (fac.type === 'thermal' || fac.type === 'factory' || fac.type === 'public');

            return (
              <div 
                key={fac.id}
                className={`relative overflow-hidden rounded-xl border bg-white/70 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md ${
                  hasWarning 
                    ? 'border-rose-200 hover:border-rose-300' 
                    : fac.isAging
                    ? 'border-amber-200 hover:border-amber-300'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Obsolete/Aging Neon Warning Banner */}
                {fac.isAging && (
                  <div className="absolute right-0 top-0 bg-gradient-to-l from-amber-500 to-rose-500 text-white font-bold px-2.5 py-0.5 rounded-bl text-[8px] font-mono tracking-widest uppercase shadow-sm">
                    AGING
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold font-mono tracking-wide text-slate-500 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {fac.location}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">
                      {fac.name}
                    </h4>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                    {getFacilityIcon(fac.type)}
                  </div>
                </div>

                {/* Grid details */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-y-3 font-mono text-xs">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 tracking-wider">ENERGY GEN</span>
                    <span className="font-bold text-emerald-600">{fac.energyProduction} MW</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 tracking-wider">ENERGY CONS</span>
                    <span className="font-bold text-cyan-600">{fac.energyConsumption} MW</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 tracking-wider">POLLUTION RATE</span>
                    <span className={`font-bold ${fac.pollution > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {fac.pollution}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 tracking-wider">SYSTEM STATUS</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      fac.status === '절전 모드' ? 'text-cyan-600' : 'text-emerald-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        fac.status === '절전 모드' ? 'bg-cyan-500' : 'bg-emerald-500'
                      }`} />
                      <span>{fac.status}</span>
                    </span>
                  </div>
                </div>

                {/* Custom warning alert in card */}
                {hasWarning && (
                  <div className="mt-4 flex items-center space-x-1.5 p-2 rounded bg-rose-50 border border-rose-100 text-[10px] font-semibold text-rose-600 leading-none">
                    <ZapOff className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>비효율 시설: 탄소 저감 개량 필요</span>
                  </div>
                )}
                {!fac.isAging && (
                  <div className="mt-4 flex items-center space-x-1.5 p-2 rounded bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-600 leading-none">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>최적 설계: 친환경 ECO 가동</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
