import React, { useState } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import type { Facility } from '../types';
import { 
  Plus, 
  RefreshCw, 
  Moon, 
  Sun, 
  Info,
  AlertTriangle,
  Power,
  ShieldCheck,
  ZapOff,
  Sliders,
  Settings2,
  Trash2
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
      case 'thermal': return <Power className="w-5 h-5 text-rose-600" />;
      case 'solar': return <Sun className="w-5 h-5 text-emerald-600 animate-spin-slow" />;
      case 'wind': return <RefreshCw className="w-5 h-5 text-teal-600" />;
      case 'factory': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'streetlight': return <Moon className="w-5 h-5 text-sky-600" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  // Check if there are any active aging facilities in the city
  const agingCount = facilities.filter(f => f.isAging).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
      
      {/* 1. 서비스 안내 헤더 */}
      <div className="border-b-2 border-[#003366] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#0284c7] uppercase leading-none">
            VIRTUAL POWER POLICY SIMULATOR
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-1 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#003366]" />
            <span>도시 에너지 가상 설비 통제 및 정책제어</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-semibold">
            도시 전역의 화력 발전소, 가로등, 태양광 집열기 등 전력 시설들의 상태를 제어하고 행정 정책을 실시간 가상 제어하는 통합 시뮬레이터 본부입니다.
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#003366] bg-slate-50 border border-slate-300 px-3 py-1 rounded">
          자산 현황: {facilities.length}개 유닛 등록됨
        </span>
      </div>

      {/* 2. 정책 콘트롤 타워 메인 제어판 */}
      <div className="portal-card p-6 bg-white">
        <div className="pb-3 border-b border-slate-200 mb-5 flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-[#003366]" />
          <h3 className="text-xs font-bold text-slate-500 font-sans tracking-wide uppercase">
            지자체 통합 친환경 에너지 권한 제어판
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Action 1: 신재생 설비 추가 */}
          <div className="relative">
            {!isAddingPlant ? (
              <button
                onClick={() => setIsAddingPlant(true)}
                className="w-full flex flex-col items-center justify-center gap-2 p-4 h-28 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#0284c7] text-[#003366] font-bold transition-all cursor-pointer group"
              >
                <Plus className="w-6 h-6 stroke-[2.5] text-[#0284c7] group-hover:scale-105 transition-transform" />
                <span className="text-xs">친환경 태양광 설비 신설</span>
                <span className="text-[9px] font-bold text-slate-500 font-mono">생산량 +150MW / 오염도 0%</span>
              </button>
            ) : (
              <div className="flex flex-col justify-center gap-2 p-3 h-28 rounded border border-slate-300 bg-slate-100 shadow-inner">
                <span className="text-[10px] text-center font-bold text-slate-500 font-sans leading-none">신설 구역을 지정하십시오</span>
                <div className="grid grid-cols-5 gap-1 my-1">
                  {districts.map((dist) => (
                    <button
                      key={dist}
                      onClick={() => handleAddPlant(dist)}
                      className="py-1 text-[10px] font-bold rounded bg-white border border-slate-300 text-slate-700 hover:text-white hover:bg-[#003366] hover:border-[#003366] transition-colors cursor-pointer"
                    >
                      {dist.replace('구역', '')}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsAddingPlant(false)}
                  className="text-center text-[9px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  지정 취소
                </button>
              </div>
            )}
          </div>

          {/* Action 2: 노후 설비 일괄 개량 */}
          <button
            onClick={replaceAgingFacilities}
            disabled={agingCount === 0}
            className={`w-full flex flex-col items-center justify-center gap-2 p-4 h-28 rounded border transition-all cursor-pointer ${
              agingCount > 0
                ? 'border-[#003366] bg-white text-[#003366] hover:bg-[#f0f4f8] font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-5 h-5 text-[#003366] ${agingCount > 0 ? 'animate-spin-slow' : ''}`} />
            <span className="text-xs font-bold">노후 비효율 설비 개량</span>
            <span className="text-[9px] font-bold text-slate-500 font-mono">
              {agingCount > 0 ? `노후 설비 ${agingCount}기 고효율 개축` : '정비 대상 설비 없음'}
            </span>
          </button>

          {/* Action 3: 야간 절전 모드 개시 */}
          <button
            onClick={toggleStreetlightSaving}
            className={`w-full flex flex-col items-center justify-center gap-2 p-4 h-28 rounded border transition-all cursor-pointer ${
              isStreetlightSavingActive
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                : 'border-[#0284c7] bg-white text-[#0284c7] hover:bg-[#f0f9ff] font-bold'
            }`}
          >
            <Moon className={`w-5 h-5 ${isStreetlightSavingActive ? 'text-emerald-500 animate-pulse' : 'text-[#0284c7]'}`} />
            <span className="text-xs font-bold">공공 가로등 절전제 개시</span>
            <span className="text-[9px] font-bold text-slate-500 font-mono">
              {isStreetlightSavingActive ? '공공 야간 가로등 60% 절약 중' : '시내 가로등 절전 기능 미가동'}
            </span>
          </button>

          {/* Action 4: 데이터 원복 초기화 */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full flex flex-col items-center justify-center gap-2 p-4 h-28 rounded border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer"
          >
            <Trash2 className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold">시뮬레이션 전체 리셋</span>
            <span className="text-[9px] font-bold text-rose-500 font-mono">지자체 표준 기본 세팅 원복</span>
          </button>

        </div>
      </div>

      {/* 3. 복원 구역별 관제 시설 대장 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-slate-700 flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 bg-[#003366] rounded-sm" />
          <span>관할 복원 지구별 구동 시설 대장 목록</span>
        </h3>
        
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {facilities.map((fac) => {
            const hasWarning = fac.isAging && (fac.type === 'thermal' || fac.type === 'factory' || fac.type === 'public');

            return (
              <div 
                key={fac.id}
                className={`relative overflow-hidden portal-card p-5 bg-white ${
                  hasWarning 
                    ? 'border-rose-300 ring-1 ring-rose-200' 
                    : fac.isAging
                    ? 'border-amber-300'
                    : 'border-slate-300'
                }`}
              >
                {/* Obsolete/Aging Government Stamp */}
                {fac.isAging && (
                  <div className="absolute right-0 top-0 bg-amber-600 text-white font-extrabold px-2.5 py-0.5 rounded-bl text-[8px] font-sans tracking-wider shadow-sm uppercase leading-none">
                    노후 장비
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold font-mono tracking-wide text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded inline-block leading-none">
                      {fac.location}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">
                      {fac.name}
                    </h4>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-slate-50">
                    {getFacilityIcon(fac.type)}
                  </div>
                </div>

                {/* Grid details */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-y-3 font-mono text-xs">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 tracking-wider">전력 생산</span>
                    <span className="font-bold text-emerald-600">{fac.energyProduction} MW</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 tracking-wider">전력 소비</span>
                    <span className="font-bold text-cyan-600">{fac.energyConsumption} MW</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 tracking-wider">오염 가스 비율</span>
                    <span className={`font-bold ${fac.pollution > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {fac.pollution}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 tracking-wider">구동 상태</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      fac.status === '절전 모드' ? 'text-cyan-600' : 'text-emerald-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        fac.status === '절전 모드' ? 'bg-cyan-500' : 'bg-emerald-500'
                      }`} />
                      <span>{fac.status}</span>
                    </span>
                  </div>
                </div>

                {/* Custom warning alert in card */}
                {hasWarning && (
                  <div className="mt-4 flex items-center space-x-1.5 p-2 rounded bg-rose-50 border border-rose-100 text-[10px] font-semibold text-rose-700 leading-none">
                    <ZapOff className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>개축 경고: 고탄소 비효율 설비</span>
                  </div>
                )}
                {!fac.isAging && (
                  <div className="mt-4 flex items-center space-x-1.5 p-2 rounded bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700 leading-none">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>인증 설비: 무공해 친환경 가동</span>
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
