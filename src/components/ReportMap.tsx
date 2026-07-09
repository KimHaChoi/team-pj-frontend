import React, { useState } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import type { Report } from '../types';
import { Map, CheckCircle, Clock, Eye, AlertOctagon, X, Compass, Layers } from 'lucide-react';

export const ReportMap: React.FC = () => {
  const { reports } = useEcoCity();
  const [selectedDistrict, setSelectedDistrict] = useState<'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역'>('A구역');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const districts: { id: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역'; name: string; coord: string; desc: string }[] = [
    { id: 'A구역', name: 'A구역 (북서부 고업 산업 단지 지구)', coord: 'row-start-1 col-start-1', desc: '산업 중공업 제조 공장 및 구식 화력 발전 설비 밀집 지역 (가속 정비 대상)' },
    { id: 'B구역', name: 'B구역 (북동부 무공해 청정 발전 단지)', coord: 'row-start-1 col-start-3', desc: '태양광 고효율 집열판 및 스마트 풍력 에너지 복원 단지' },
    { id: 'C구역', name: 'C구역 (중앙 생태공원 및 지자체 관공서)', coord: 'row-start-2 col-start-2', desc: '자연 우수 보존 지구, 중앙 녹지 광장 및 지자체 통합 행정청 본부' },
    { id: 'E구역', name: 'E구역 (남서부 농경 및 외곽 송전 전력망)', coord: 'row-start-3 col-start-1', desc: '도시 전체의 전압을 변전 배분하는 송배전 통합 전력 네트워크 구역' },
    { id: 'D구역', name: 'D구역 (남동부 고층 스마트 주거 단지)', coord: 'row-start-3 col-start-3', desc: '탄소 배출 제로 공법이 수립 가동되는 에너지 자립 시범 주거 복합 대단지' },
  ];

  // Helper to filter reports for a given district
  const getReportsForDistrict = (district: string) => {
    return reports.filter((r) => r.location === district);
  };

  // Helper to check what color government status the district should show (High Contrast Solid Color)
  const getDistrictMapClass = (district: string) => {
    const districtReports = getReportsForDistrict(district).filter((r) => r.status !== '처리 완료');
    if (districtReports.length === 0) {
      return 'border-[#cbd5e1] bg-[#f0fdf4] hover:bg-[#e6fcf0] hover:border-emerald-500 text-emerald-800'; // Clean green
    }

    // Check if there is an environmental pollution report
    const hasPollution = districtReports.some((r) => r.type === '환경오염');
    const hasEnergyWaste = districtReports.some((r) => r.type === '에너지 낭비');

    if (hasPollution) {
      return 'border-rose-300 bg-[#fef2f2] hover:bg-[#ffebeb] hover:border-rose-600 text-rose-800'; // Serious red
    }
    if (hasEnergyWaste) {
      return 'border-cyan-300 bg-[#ecfeff] hover:bg-[#e0f7fa] hover:border-cyan-600 text-cyan-800'; // Warning blue
    }
    return 'border-amber-300 bg-[#fffbeb] hover:bg-[#fff9e6] hover:border-amber-600 text-amber-800'; // Caution orange
  };

  // Helper to render type-based color badges
  const getTypeBadgeStyle = (type: Report['type']) => {
    switch (type) {
      case '환경오염':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case '에너지 낭비':
        return 'bg-cyan-50 text-cyan-700 border-cyan-300';
      case '쓰레기 문제':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case '시설 고장':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-300';
    }
  };

  const activeReportsInSelected = getReportsForDistrict(selectedDistrict);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
      
      {/* 1. 서비스 안내 헤더 */}
      <div className="border-b-2 border-[#003366] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#0284c7] uppercase leading-none">
            GEOGRAPHIC INFORMATION SYSTEM (GIS)
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-1 flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#003366]" />
            <span>지리 정보 시스템(GIS) 실시간 환경 민원 지도</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-semibold">
            도시 지적도를 기반으로 수립된 5대 구역 관제 그리드 지도입니다. 시민 제보 현황에 따라 위험 구역별 등급 색상(정상: 녹색, 경계: 황색, 심각: 적색)이 실시간 점등됩니다.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 items-start">
        
        {/* 2. 지적도 격자 지도 뷰 (3 Cols) */}
        <div className="lg:col-span-3 overflow-hidden portal-card p-6 bg-white h-[450px] flex flex-col justify-between relative">
          
          {/* Official Land Grid Coordinates layout background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-35" />
          
          <div className="relative z-10 pb-2 border-b border-slate-200 flex justify-between items-center bg-white/90 backdrop-blur-sm">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 font-sans flex items-center space-x-2">
              <Map className="w-4 h-4 text-[#003366]" />
              <span>대한민국 지적 지리 정보 기반 원격 격자 도면</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold font-mono">SCALE 1:50,000</span>
          </div>

          {/* Interactive Geographic Map */}
          <div className="relative z-10 flex-1 my-5 grid grid-rows-3 grid-cols-3 gap-4 items-center justify-center max-w-sm mx-auto w-full">
            
            {districts.map((dist) => {
              const isSelected = selectedDistrict === dist.id;
              const activeCount = getReportsForDistrict(dist.id).filter((r) => r.status !== '처리 완료').length;
              const mapClass = getDistrictMapClass(dist.id);

              return (
                <button
                  key={dist.id}
                  onClick={() => setSelectedDistrict(dist.id)}
                  className={`flex flex-col items-center justify-center h-24 rounded border p-3.5 transition-all duration-200 cursor-pointer relative ${dist.coord} ${mapClass} ${
                    isSelected ? 'ring-2 ring-[#003366] scale-[1.02] shadow-sm font-extrabold bg-white border-[#003366]' : 'font-bold'
                  }`}
                >
                  <span className="text-xs tracking-tight">{dist.id}</span>
                  <span className="text-[9px] mt-1 opacity-90 truncate max-w-full text-center">
                    {dist.name.split(' (')[1]?.replace(')', '') || dist.name}
                  </span>
                  
                  {/* Glowing warning circle badge with active counts */}
                  {activeCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 border border-white text-[10px] font-extrabold font-mono text-white shadow">
                      {activeCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Cadaster cross-section decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center border border-slate-300">
              <div className="absolute h-px w-full bg-dashed border-slate-300" />
              <div className="absolute w-px h-full bg-dashed border-slate-300" />
            </div>
          </div>

          {/* District description footer bar */}
          <div className="relative z-10 p-3 rounded border border-slate-200 bg-slate-50 text-[11px] leading-relaxed">
            <span className="font-bold text-[#003366] flex items-center gap-1 mb-0.5">
              <Layers className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>{selectedDistrict} 구획 설명:</span>
            </span>
            <p className="text-slate-500 font-semibold">
              {districts.find((d) => d.id === selectedDistrict)?.desc}
            </p>
          </div>
        </div>

        {/* 3. 우측 해당 구역 민원 리스트 인스펙터 (2 Cols) */}
        <div className="lg:col-span-2 overflow-hidden portal-card p-6 bg-white h-[450px] flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <AlertOctagon className="w-4.5 h-4.5 text-[#003366]" />
              <span>{selectedDistrict} 실시간 접수 민원 일람</span>
            </h3>
            <p className="mt-1 text-[11px] text-slate-400 font-semibold">
              지도의 해당 행정 구획을 누르면 정부 전산 대장에 기재된 실시간 민원이 표시됩니다.
            </p>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 max-h-[300px]">
            {activeReportsInSelected.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 opacity-80 mb-2.5" />
                <span className="text-xs font-bold text-slate-700">접수 처리된 민원이 없는 청정 지구입니다.</span>
                <span className="text-[10px] text-slate-400 mt-1">지구 상시 정찰 및 환경 관제 유지 중</span>
              </div>
            ) : (
              activeReportsInSelected.map((rep) => (
                <div 
                  key={rep.id}
                  className="p-3.5 rounded border border-slate-200 bg-slate-50 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-block text-[9px] font-bold tracking-wide px-2 py-0.5 rounded border ${getTypeBadgeStyle(rep.type)}`}>
                      {rep.type}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      rep.status === '처리 완료'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : rep.status === '확인 중'
                        ? 'bg-amber-50 text-amber-700 border border-amber-300'
                        : 'bg-rose-50 text-rose-700 border border-rose-300'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{rep.status}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{rep.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    {rep.description}
                  </p>

                  {rep.imageUrl && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => setSelectedImage(rep.imageUrl)}
                        className="relative rounded border border-slate-300 overflow-hidden group cursor-pointer block w-20 h-14 bg-white"
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
                    행정 접수: {new Date(rep.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
            <span>DISTRICT CODE: {selectedDistrict}</span>
            <span>TOTAL COUNT: {activeReportsInSelected.length} CASES</span>
          </div>
        </div>

      </div>

      {/* Expanded Image Modal overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-2xl max-h-[80vh] overflow-hidden rounded border border-slate-300 bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="제보 증빙 사진"
              className="max-h-[75vh] object-contain rounded"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-rose-600 border border-slate-300 text-slate-700 hover:text-white transition-colors shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
