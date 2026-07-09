import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import type { Report } from '../types';

export const ReportMap: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역'>('A구역');
  const [activeReport, setActiveReport] = useState<Report | null>(null);

  // Filters
  const [filterCategory, setCategoryFilter] = useState<string>('ALL');
  const [filterStatus, setStatusFilter] = useState<string>('ALL');
  const [filterMinScore, setMinScore] = useState<number>(0);
  const [enableHeatmap, setEnableHeatmap] = useState<boolean>(true);

  // Subscribe to real-time reports
  useEffect(() => {
    const unsub = dbService.listenReports((data) => {
      setReports(data);
    });
    return () => unsub();
  }, []);

  const districts: { id: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역'; name: string; desc: string; centerLat: number; centerLng: number }[] = [
    { id: 'A구역', name: '중구 (북서부 고업 산업지구)', desc: '공장 굴뚝 매연 배출 및 노후 화력 시설이 밀집한 특별 관리 대상 지역', centerLat: 35.8342, centerLng: 128.4567 },
    { id: 'B구역', name: '동구 (북동부 무공해 발전지구)', desc: '스마트 풍력 날개 및 고집열 태양광 판넬이 조성된 청정 대체 단지', centerLat: 35.8452, centerLng: 128.4712 },
    { id: 'C구역', name: '중앙 생태공원 & 달성군청', desc: '자연 생태림 보존 지구이자 행정 기관들이 집적된 관공서 센터', centerLat: 35.8291, centerLng: 128.4612 },
    { id: 'D구역', name: '남동부 에코 하우징 타운', desc: '탄소 배출 제로 아파트 및 태양광 보급 주택이 어우러진 신거주 지구', centerLat: 35.8191, centerLng: 128.4512 },
    { id: 'E구역', name: '남서부 외곽 전력 중계망', desc: '가로등 전원 공급망 및 기후 에너지 센서 송배전 타워 구역', centerLat: 35.8412, centerLng: 128.4312 },
  ];

  // Helper to map 3D coordinate values to 2D UI offsets on our custom SVG layout (scaling coordinate range to SVG bounds)
  // Latitude boundaries approximately [35.81, 35.86] -> Map height [80%, 20%]
  // Longitude boundaries approximately [128.42, 128.48] -> Map width [15%, 85%]
  const getCoordinatesOffset = (lat: number, lng: number) => {
    const latMin = 35.8100;
    const latMax = 35.8600;
    const lngMin = 128.4200;
    const lngMax = 128.4800;

    const top = 100 - ((lat - latMin) / (latMax - latMin)) * 80 - 10; // offset inside map box
    const left = ((lng - lngMin) / (lngMax - lngMin)) * 70 + 15;

    return {
      top: `${Math.min(90, Math.max(10, top))}%`,
      left: `${Math.min(90, Math.max(10, left))}%`
    };
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (r.aiScore < filterMinScore) return false;
    return true;
  });

  // Calculate Environment Score for the selected district (B-2)
  const calculateEnvironmentScore = (districtId: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역') => {
    const districtReports = reports.filter((r) => {
      // rough assignment of coordinates to district bounds
      if (districtId === 'A구역') return r.lat >= 35.83 && r.lng <= 128.46;
      if (districtId === 'B구역') return r.lat >= 35.83 && r.lng > 128.46;
      if (districtId === 'C구역') return r.lat < 35.83 && r.lat >= 35.82 && r.lng >= 128.45;
      if (districtId === 'D구역') return r.lat < 35.82;
      return r.lat >= 35.83 && r.lng < 128.44; // E구역
    });

    const unresolvedCount = districtReports.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED' && r.isMeaningful).length;
    const highPriorityCount = districtReports.filter(r => r.aiScore >= 75 && r.status !== 'RESOLVED' && r.isMeaningful).length;
    const resolvedCount = districtReports.filter(r => r.status === 'RESOLVED').length;

    // Formula: environmentScore = 100 - unresolvedCount * 2 - highPriorityCount * 5 + resolvedCount * 1
    let score = 100 - (unresolvedCount * 2) - (highPriorityCount * 5) + (resolvedCount * 1);
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const currentEnvironmentScore = calculateEnvironmentScore(selectedDistrict);

  const getCategoryEmoji = (cat: Report['category']) => {
    const mapping = { ENERGY_WASTE: '💡', POLLUTION: '🏭', ILLEGAL_DUMPING: '🗑️', NOISE: '🔊', ETC: '⚙️' };
    return mapping[cat] || '❓';
  };

  const getCategoryLabel = (cat: Report['category']) => {
    const mapping = { ENERGY_WASTE: '에너지 낭비', POLLUTION: '환경 오염', ILLEGAL_DUMPING: '무단 투기', NOISE: '심각한 소음', ETC: '기타 민원' };
    return mapping[cat] || '일반 민원';
  };

  const getStatusBadgeClass = (status: Report['status']) => {
    switch (status) {
      case 'RECEIVED': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'REJECTED': return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusLabel = (status: Report['status']) => {
    switch (status) {
      case 'RECEIVED': return '접수 완료';
      case 'IN_PROGRESS': return '처리 중';
      case 'RESOLVED': return '해결 완료';
      case 'REJECTED': return '반려 처리';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 pb-24 md:pb-8 space-y-5 animate-fadeIn">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-900 text-white rounded-3xl p-5 shadow-md">
        <div>
          <span className="text-[9px] font-extrabold tracking-wider text-emerald-400">CHALKAK GIS DASHBOARD</span>
          <h2 className="text-lg font-black tracking-tight mt-0.5">실시간 환경·에너지 격자 관제 정보판</h2>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">
            시민들이 제보한 위치 기반 신고 현황을 열지표(Heatmap) 및 구역 환경 종합 지수로 감시합니다.
          </p>
        </div>

        {/* Heatmap Toggle & Stats Overview */}
        <div className="flex items-center gap-4 text-xs font-semibold bg-white/5 p-3 rounded-2xl border border-white/10 self-stretch md:self-auto justify-around">
          <div className="text-center px-1">
            <span className="block text-[10px] text-slate-400">총 민원 제보</span>
            <span className="text-sm font-black text-emerald-400">{reports.length}건</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-center px-1">
            <span className="block text-[10px] text-slate-400">미해결 민원</span>
            <span className="text-sm font-black text-rose-400">
              {reports.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED').length}건
            </span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <button
            onClick={() => setEnableHeatmap(!enableHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
              enableHeatmap 
                ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]' 
                : 'bg-white/10 text-slate-300'
            }`}
          >
            🔥 히트맵 레이어 {enableHeatmap ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Primary Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Interactive map box - 2 cols on large screen */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 relative h-[450px] overflow-hidden flex flex-col">
          {/* Geogrid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Quick HUD filter toggles */}
          <div className="relative z-10 flex flex-wrap gap-2 items-center bg-white/85 backdrop-blur-sm p-2 rounded-2xl border border-slate-100/50 mb-3 text-[10px] font-bold text-slate-500 shadow-sm">
            <select
              value={filterCategory}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1 focus:outline-none"
            >
              <option value="ALL">모든 카테고리</option>
              <option value="ENERGY_WASTE">💡 에너지 낭비</option>
              <option value="POLLUTION">🏭 환경 오염</option>
              <option value="ILLEGAL_DUMPING">🗑️ 무단 투기</option>
              <option value="NOISE">🔊 소음/진동</option>
              <option value="ETC">⚙️ 기타 민원</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1 focus:outline-none"
            >
              <option value="ALL">모든 처리 상태</option>
              <option value="RECEIVED">접수 대기</option>
              <option value="IN_PROGRESS">처리 중</option>
              <option value="RESOLVED">해결 완료</option>
              <option value="REJECTED">반려됨</option>
            </select>

            <div className="flex items-center gap-1.5 ml-auto">
              <span>AI 중요도 {filterMinScore}점 이상</span>
              <input
                type="range"
                min="0"
                max="90"
                value={filterMinScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* Map canvas containing the SVG and absolute marker pins */}
          <div className="relative flex-1 bg-sky-50/40 border border-sky-100/60 rounded-2xl overflow-hidden shadow-inner">
            {/* Districts overlay (SVG contours as simulated map) */}
            <div className="absolute inset-0 flex items-center justify-center p-6 select-none opacity-40">
              <svg className="w-full h-full text-slate-300" viewBox="0 0 400 300" fill="none" stroke="currentColor">
                <path d="M50,150 Q100,50 200,80 T350,60" strokeWidth="2" strokeDasharray="4,4" />
                <path d="M80,250 Q180,220 280,280 T380,220" strokeWidth="2" strokeDasharray="4,4" />
                <rect x="30" y="40" width="120" height="90" rx="20" fill="currentColor" fillOpacity="0.1" />
                <rect x="250" y="30" width="120" height="90" rx="20" fill="currentColor" fillOpacity="0.1" />
                <circle cx="200" cy="150" r="55" fill="currentColor" fillOpacity="0.1" />
                <rect x="240" y="170" width="130" height="100" rx="20" fill="currentColor" fillOpacity="0.1" />
                <rect x="40" y="170" width="110" height="100" rx="20" fill="currentColor" fillOpacity="0.1" />
              </svg>
            </div>

            {/* Label texts on background districts */}
            <div className="absolute top-[18%] left-[20%] text-[10px] font-black text-slate-400">중구 (A구역)</div>
            <div className="absolute top-[18%] left-[70%] text-[10px] font-black text-slate-400">동구 (B구역)</div>
            <div className="absolute top-[48%] left-[40%] text-[10px] font-black text-slate-400">중앙생태공원 (C구역)</div>
            <div className="absolute top-[75%] left-[65%] text-[10px] font-black text-slate-400">에코하우징 (D구역)</div>
            <div className="absolute top-[75%] left-[15%] text-[10px] font-black text-slate-400">외곽송배망 (E구역)</div>

            {/* Real-time map pins representing filtered reports */}
            {filteredReports.map((report) => {
              const offsets = getCoordinatesOffset(report.lat, report.lng);
              const isSelected = activeReport?.id === report.id;

              // Heatmap style settings
              const showHeatGlow = enableHeatmap && report.status !== 'RESOLVED' && report.status !== 'REJECTED';
              let heatColorClass = 'from-rose-500/20 to-transparent';
              let sizeClass = 'w-10 h-10';
              if (report.aiScore >= 75) {
                heatColorClass = 'from-rose-600/25 via-rose-500/10 to-transparent';
                sizeClass = 'w-16 h-16';
              } else if (report.aiScore >= 40) {
                heatColorClass = 'from-orange-500/20 via-orange-400/5 to-transparent';
                sizeClass = 'w-12 h-12';
              }

              return (
                <div
                  key={report.id}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
                  style={{ top: offsets.top, left: offsets.left }}
                >
                  {/* Glowing heat wave */}
                  {showHeatGlow && (
                    <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-radial rounded-full animate-pulse pointer-events-none ${heatColorClass} ${sizeClass}`} />
                  )}

                  {/* Marker Button */}
                  <button
                    onClick={() => setActiveReport(report)}
                    type="button"
                    className={`relative flex items-center justify-center w-7 h-7 rounded-full bg-white border shadow-md active:scale-95 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-slate-900 scale-125 ring-4 ring-slate-900/10 z-30' 
                        : report.aiScore >= 75 
                        ? 'border-rose-400' 
                        : 'border-slate-100'
                    }`}
                  >
                    <span className="text-sm select-none">
                      {getCategoryEmoji(report.category)}
                    </span>
                    {/* Small urgency badge on marker top right */}
                    {report.aiScore >= 75 && report.status !== 'RESOLVED' && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* SCALE bar HUD */}
          <div className="mt-2 text-[9px] text-slate-400 font-bold font-mono uppercase flex justify-between items-center bg-slate-50/50 p-2 rounded-xl">
            <span>COORDINATE SYSTEM: EPSG:5179 (DAEGU SPATIAL)</span>
            <span>SCALE BAR 1:15,000</span>
          </div>
        </div>

        {/* Right side District inspector HUD - 1 col */}
        <div className="space-y-5">
          {/* Environment health index HUD panel */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div>
              <span className="text-[9px] font-extrabold tracking-wider text-slate-400 block">DISTRICT HEALTH SCORE</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-base font-black text-slate-800">
                  {selectedDistrict} 종합 지수
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  currentEnvironmentScore >= 80 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : currentEnvironmentScore >= 50 
                    ? 'bg-amber-50 text-amber-700' 
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {currentEnvironmentScore >= 80 ? '청정 🌱' : currentEnvironmentScore >= 50 ? '보통 ⚠️' : '위험 🚨'}
                </span>
              </div>
            </div>

            {/* Dial gauge indicator */}
            <div className="flex items-center gap-5 bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-slate-100 bg-white">
                <span className={`text-base font-black ${
                  currentEnvironmentScore >= 80 ? 'text-emerald-600' : currentEnvironmentScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {currentEnvironmentScore}
                </span>
                <span className="text-[9px] text-slate-400 absolute bottom-1.5 font-bold">score</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold leading-normal space-y-0.5">
                <span className="block">● 미해결 건수 비례 감점 (-2P/건)</span>
                <span className="block">● 시급성 AI 고점 민원 비례 감점 (-5P/건)</span>
                <span className="block">● 해결 조치 완료 시 점수 가산 (+1P/건)</span>
              </div>
            </div>

            {/* District switch buttons */}
            <div className="grid grid-cols-5 gap-1">
              {districts.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDistrict(d.id);
                    setActiveReport(null); // clear popups
                  }}
                  className={`py-2 text-[10px] font-extrabold rounded-xl border text-center cursor-pointer transition-all ${
                    selectedDistrict === d.id
                      ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/40 text-slate-500'
                  }`}
                >
                  {d.id.replace('구역', '')}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 leading-normal leading-relaxed">
              {districts.find(d => d.id === selectedDistrict)?.desc}
            </p>
          </div>

          {/* Active selected report details HUD popup card */}
          {activeReport ? (
            <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-4 animate-scaleUp relative border border-white/5 shadow-xl">
              <button
                onClick={() => setActiveReport(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 border border-white/10 rounded-full bg-white/5`}>
                    {getCategoryEmoji(activeReport.category)} {getCategoryLabel(activeReport.category)}
                  </span>
                  <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded border ${getStatusBadgeClass(activeReport.status)}`}>
                    {getStatusLabel(activeReport.status)}
                  </span>
                </div>
                <h4 className="text-xs font-black leading-snug">{activeReport.title}</h4>
              </div>

              <div className="rounded-xl overflow-hidden h-28 border border-white/10 relative">
                <img src={activeReport.imageUrl} alt=" 증빙" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-rose-600 border border-rose-500 text-[10px] text-white font-extrabold px-2 py-0.5 rounded-lg shadow">
                  AI {activeReport.aiScore}점
                </div>
              </div>

              {activeReport.description && (
                <p className="text-[10px] text-slate-400 leading-relaxed max-h-16 overflow-y-auto font-medium">
                  {activeReport.description}
                </p>
              )}

              <div className="space-y-1 bg-white/5 p-3 rounded-2xl text-[9px] leading-normal font-semibold text-slate-300 border border-white/5">
                <span className="text-[9px] font-black text-emerald-400 block">🤖 AI 판독 정황 분석</span>
                <p>{activeReport.aiReason}</p>
              </div>

              {activeReport.status === 'RESOLVED' && activeReport.resultMemo && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900/30 rounded-2xl space-y-1.5 text-[9px]">
                  <span className="text-[9px] font-black text-emerald-400 block">✅ 조치 결과 보고</span>
                  <p className="text-slate-300 leading-normal leading-relaxed">{activeReport.resultMemo}</p>
                  {activeReport.resultImageUrl && (
                    <img src={activeReport.resultImageUrl} alt="조치" className="w-full h-16 object-cover rounded-lg border border-emerald-900/30" />
                  )}
                </div>
              )}

              <div className="text-[9px] text-slate-500 font-extrabold font-mono text-right pt-1 flex justify-between">
                <span>📍 {activeReport.address}</span>
                <span>{new Date(activeReport.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center text-slate-400 h-44 flex flex-col items-center justify-center gap-2">
              <span className="text-2xl">🗺️</span>
              <p className="text-xs font-bold text-slate-600">제보 마커 인스펙터</p>
              <p className="text-[10px] text-slate-400 font-medium">
                지도의 제보 핀 마커를 클릭하시면 <br />
                AI 분석 및 조치 결과를 실시간 열람할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
