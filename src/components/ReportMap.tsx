import React, { useState } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import type { Report } from '../types';
import { Map, CheckCircle, Clock, Eye, AlertOctagon, X } from 'lucide-react';

export const ReportMap: React.FC = () => {
  const { reports } = useEcoCity();
  const [selectedDistrict, setSelectedDistrict] = useState<'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역'>('A구역');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const districts: { id: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역'; name: string; coord: string; desc: string }[] = [
    { id: 'A구역', name: 'A구역 (북서부 공업지대)', coord: 'row-start-1 col-start-1', desc: '산업 중공업 공장 및 구식 화력 발전 시설 밀집 지역' },
    { id: 'B구역', name: 'B구역 (북동부 신재생 발전소)', coord: 'row-start-1 col-start-3', desc: '태양광 및 풍력 친환경 청정 에너지 복원 연구 단지' },
    { id: 'C구역', name: 'C구역 (중앙 삼림 및 관공서)', coord: 'row-start-2 col-start-2', desc: '자연 친환경 녹지 공원 및 공공 종합 행정청 위치' },
    { id: 'E구역', name: 'E구역 (남서부 외곽 전력망)', coord: 'row-start-3 col-start-1', desc: '도시 전체로 에너지를 배분하는 송배전 통합 전력 네트워크' },
    { id: 'D구역', name: 'D구역 (남동부 스마트 주거지)', coord: 'row-start-3 col-start-3', desc: '에너지 제로 하우스 기술이 시범 탑재된 주거 복합 스마트 단지' },
  ];

  // Helper to filter reports for a given district
  const getReportsForDistrict = (district: string) => {
    return reports.filter((r) => r.location === district);
  };

  // Helper to check what color glow the district should have (LIGHT MODE)
  const getDistrictGlowClass = (district: string) => {
    const districtReports = getReportsForDistrict(district).filter((r) => r.status !== '처리 완료');
    if (districtReports.length === 0) {
      return 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.04)]';
    }

    // Check if there is an environmental pollution report
    const hasPollution = districtReports.some((r) => r.type === '환경오염');
    const hasEnergyWaste = districtReports.some((r) => r.type === '에너지 낭비');

    if (hasPollution) {
      return 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-400 text-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.1)] animate-pulse-slow';
    }
    if (hasEnergyWaste) {
      return 'border-cyan-200 bg-cyan-50/50 hover:bg-cyan-50 hover:border-cyan-400 text-cyan-600 shadow-[0_0_12px_rgba(34,211,238,0.1)] animate-pulse-slow';
    }
    return 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400 text-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.08)]';
  };

  // Helper to render type-based color badges
  const getTypeBadgeStyle = (type: Report['type']) => {
    switch (type) {
      case '환경오염':
        return 'bg-rose-50 text-rose-600 border-rose-150';
      case '에너지 낭비':
        return 'bg-cyan-50 text-cyan-600 border-cyan-150';
      case '쓰레기 문제':
        return 'bg-amber-50 text-amber-600 border-amber-150';
      case '시설 고장':
        return 'bg-indigo-50 text-indigo-600 border-indigo-150';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const activeReportsInSelected = getReportsForDistrict(selectedDistrict);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          가상 격자 관제 지도 (Interactive Map)
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
          도시를 상징하는 5대 주거 및 산업 섹터가 가상 레이더 격자맵으로 렌더링됩니다. 민원이 미완료 상태인 구역은 경고 글로우가 점멸하며, 클릭 시 실시간 사건 목록을 정밀 점검할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 items-start">
        
        {/* Left 3 Cols: Futuristic Grid Map */}
        <div className="lg:col-span-3 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur-md shadow-sm flex flex-col justify-between h-[450px] relative">
          
          {/* Cyber style background lines (light grid) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40" />
          
          <div className="relative z-10">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center space-x-2">
              <Map className="w-4 h-4 text-emerald-500" />
              <span>EcoCity 원격 가상 그리드 맵</span>
            </h3>
          </div>

          {/* Interactive Geographic Layout Grid */}
          <div className="relative z-10 flex-1 my-6 grid grid-rows-3 grid-cols-3 gap-4 items-center justify-center max-w-md mx-auto w-full">
            
            {districts.map((dist) => {
              const isSelected = selectedDistrict === dist.id;
              const activeCount = getReportsForDistrict(dist.id).filter((r) => r.status !== '처리 완료').length;
              const glowClass = getDistrictGlowClass(dist.id);

              return (
                <button
                  key={dist.id}
                  onClick={() => setSelectedDistrict(dist.id)}
                  className={`flex flex-col items-center justify-center h-24 rounded-xl border p-3 transition-all duration-300 relative ${dist.coord} ${glowClass} ${
                    isSelected ? 'ring-2 ring-emerald-500 scale-[1.03] bg-white shadow-md' : ''
                  }`}
                >
                  <span className="text-xs font-bold tracking-wide">{dist.id}</span>
                  <span className="text-[9px] font-semibold mt-1 opacity-80 truncate max-w-full text-center">
                    {dist.name.split(' (')[1]?.replace(')', '') || dist.name}
                  </span>
                  
                  {/* Glowing warning circle badge with active counts */}
                  {activeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 border border-rose-400 text-[10px] font-extrabold font-mono text-white shadow-sm">
                      {activeCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Connecting lines or radar decor (SVG layer) */}
            <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center border border-slate-200 rounded-lg">
              <div className="absolute h-px w-full bg-dashed border-slate-200" />
              <div className="absolute w-px h-full bg-dashed border-slate-200" />
            </div>
          </div>

          {/* District description footer bar */}
          <div className="relative z-10 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] leading-relaxed">
            <span className="font-bold text-slate-700 block mb-0.5">{selectedDistrict} 기획 상세:</span>
            <p className="text-slate-500 font-semibold">
              {districts.find((d) => d.id === selectedDistrict)?.desc}
            </p>
          </div>
        </div>

        {/* Right 2 Cols: Report list inspector for clicked district */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur-md shadow-sm h-[450px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-emerald-500" />
              <span>{selectedDistrict} 신고 세부 조회</span>
            </h3>
            <p className="mt-1 text-[11px] text-slate-500 font-semibold">
              지도의 해당 구역을 누르면 실시간 접수된 전체 환경 제보가 노출됩니다.
            </p>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 max-h-[300px]">
            {activeReportsInSelected.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 opacity-60 mb-2" />
                <span className="text-xs font-bold">민원이 없는 청정 지구입니다.</span>
                <span className="text-[10px] text-slate-400 mt-0.5">상시 감시 및 모니터링 가동 중</span>
              </div>
            ) : (
              activeReportsInSelected.map((rep) => (
                <div 
                  key={rep.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2.5 transition-all hover:bg-slate-100/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-block text-[10px] font-bold font-mono tracking-wide px-2 py-0.5 rounded border ${getTypeBadgeStyle(rep.type)}`}>
                      {rep.type}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.status === '처리 완료'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                        : rep.status === '확인 중'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200/50 animate-pulse'
                        : 'bg-rose-50 text-rose-600 border border-rose-200/50 animate-pulse'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{rep.status}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-700">{rep.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    {rep.description}
                  </p>

                  {rep.imageUrl && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => setSelectedImage(rep.imageUrl)}
                        className="relative rounded-lg overflow-hidden border border-slate-200 group cursor-pointer block w-20 h-14 bg-white"
                      >
                        <img
                          src={rep.imageUrl}
                          alt="증빙자료"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-400 font-bold font-mono text-right">
                    접수일: {new Date(rep.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
            <span>District: {selectedDistrict}</span>
            <span>Total Reports: {activeReportsInSelected.length}</span>
          </div>
        </div>

      </div>

      {/* Expanded Image Modal overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="제보 증빙 사진"
              className="max-h-[75vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-rose-500 border border-slate-200 text-slate-600 hover:text-white transition-colors shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
