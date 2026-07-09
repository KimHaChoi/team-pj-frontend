import React, { useState } from 'react';
import { useEcoCity } from '../context/EcoCityContext';

import { 
  Filter, 
  CheckCircle, 
  HelpCircle, 
  AlertTriangle, 
  Bot
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { reports, updateReportStatus, isStreetlightSavingActive, facilities } = useEcoCity();

  // Filters
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Filter logic
  const filteredReports = reports.filter((rep) => {
    const matchDistrict = filterDistrict === 'All' || rep.location === filterDistrict;
    const matchType = filterType === 'All' || rep.type === filterType;
    const matchStatus = filterStatus === 'All' || rep.status === filterStatus;
    return matchDistrict && matchType && matchStatus;
  });

  // ----------------------------------------------------
  // AI RULE-BASED ADVISOR ALGORITHM
  // ----------------------------------------------------
  const generateRecommendations = () => {
    const recommendations: { id: string; text: string; actionText?: string; severity: 'warning' | 'info' | 'critical' }[] = [];
    
    // Find active unresolved reports
    const activeReports = reports.filter(r => r.status !== '처리 완료');

    // Rule 1: Energy Waste in Sector E (Streetlights)
    const eWaste = activeReports.filter(r => r.location === 'E구역' && r.type === '에너지 낭비');
    if (eWaste.length > 0 && !isStreetlightSavingActive) {
      recommendations.push({
        id: 'rec-1',
        text: 'E구역에서 에너지 낭비(가로등 낮시간 점등) 신고가 반복적으로 감지되었습니다. 불필요한 에너지 손실을 주도적으로 방지하기 위해 즉각 "가로등 절전 모드" 적용을 강력 권장합니다.',
        actionText: '가로등 절전 모드 실행 추천',
        severity: 'critical'
      });
    }

    // Rule 2: Pollution in Sector A (Industrial area)
    const aPollution = activeReports.filter(r => r.location === 'A구역' && r.type === '환경오염');
    if (aPollution.length > 0) {
      recommendations.push({
        id: 'rec-2',
        text: 'A구역 중공업 단지 인근에서 대기 오염(검은 매연 분출) 신고가 과다하게 누적 수신되었습니다. 즉각적인 공장 배출 시설 정밀 진단 및 "노후 시설 고효율 개량" 조치가 조속히 필요합니다.',
        actionText: 'A구역 공장 필터 검사 지시',
        severity: 'critical'
      });
    }

    // Rule 3: Aging systems in C-Sector / Public building
    const cProblems = activeReports.filter(r => r.location === 'C구역');
    const cHasAging = facilities.some(f => f.location === 'C구역' && f.isAging);
    if (cProblems.length > 0 && cHasAging) {
      recommendations.push({
        id: 'rec-3',
        text: 'C구역의 행정 중심부 내 공공 청사 시설 고장 및 기타 오작동 민원이 감지되고 있습니다. 기성 노후 빌딩의 에너지 유실이 높으므로 신속히 "노후 시설 교체" 사업 추진을 검토하십시오.',
        actionText: 'C구역 노후 시설 리모델링 검토',
        severity: 'warning'
      });
    }

    // Rule 4: System Overload (Consumption > Production)
    const totalProd = facilities.reduce((sum, f) => sum + f.energyProduction, 0);
    const totalCons = facilities.reduce((sum, f) => sum + f.energyConsumption, 0);
    if (totalCons > totalProd) {
      recommendations.push({
        id: 'rec-4',
        text: '경고: 도시의 총 에너지 공급량(발전)보다 에너지 수요량(소비)이 초과하는 전력 적자 상태가 계속되고 있습니다. 정전 사태를 예방하기 위해 즉시 "친환경 발전기"를 건설하여 생산을 늘리십시오.',
        severity: 'critical'
      });
    }

    // Default recommendation if everything is clean
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-clean',
        text: '축하합니다! 현재 도시 전역에서 활성화된 임계 환경 위기 사항이 감지되지 않았습니다. 현재 가동 상태를 유지하며 신재생 발전 효율화를 계속해서 관찰하십시오.',
        severity: 'info'
      });
    }

    return recommendations;
  };

  const aiRecs = generateRecommendations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          도시 환경 관리자 행정실 (Admin)
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
          시민이 실시간 등록한 환경 민원을 배후 제어 및 점검하는 컨트롤 룸입니다. 민원 처리 상태 변경 시 종합 Eco 지수 및 지도의 글로우가 자동으로 재연산됩니다.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        
        {/* Left 2 Cols: Main Filter and Report List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filter Container Card */}
          <div className="rounded-xl border border-slate-200 bg-white/70 p-5 backdrop-blur-md shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Filter className="w-4 h-4 text-emerald-500" />
              <span>신고 데이터 다중 필터링</span>
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* District Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">구역 분류</span>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full rounded bg-white border border-slate-200 px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">전체 구역 (A~E)</option>
                  <option value="A구역">🧭 A구역</option>
                  <option value="B구역">🧭 B구역</option>
                  <option value="C구역">🧭 C구역</option>
                  <option value="D구역">🧭 D구역</option>
                  <option value="E구역">🧭 E구역</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">민원 종류</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded bg-white border border-slate-200 px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">전체 유형</option>
                  <option value="환경오염">🌿 환경오염</option>
                  <option value="에너지 낭비">⚡ 에너지 낭비</option>
                  <option value="시설 고장">⚙️ 시설 고장</option>
                  <option value="쓰레기 문제">🗑️ 쓰레기 문제</option>
                  <option value="기타">❓ 기타</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">처리 상태</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded bg-white border border-slate-200 px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">전체 상태</option>
                  <option value="접수">🔴 접수</option>
                  <option value="확인 중">🟡 확인 중</option>
                  <option value="처리 완료">🟢 처리 완료</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
              접수된 민원 관리 리스트 ({filteredReports.length}건 검색됨)
            </h4>

            {filteredReports.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white/70 p-12 text-center text-slate-400 shadow-sm">
                <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <span className="text-xs font-bold">선택한 조건에 부합하는 민원이 없습니다.</span>
              </div>
            ) : (
              filteredReports.map((rep) => (
                <div 
                  key={rep.id}
                  className="rounded-xl border border-slate-200 bg-white/70 p-5 backdrop-blur-md space-y-4 shadow-sm transition-all hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold font-mono tracking-wide px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500">
                          {rep.location}
                        </span>
                        <span className="text-[10px] font-bold font-mono tracking-wide px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500">
                          {rep.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-2">{rep.title}</h4>
                    </div>

                    <div className="text-[10px] text-slate-400 font-bold font-mono">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {rep.description}
                  </p>

                  {rep.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 max-w-xs bg-slate-50 shadow-inner">
                      <img src={rep.imageUrl} alt="첨부사진" className="max-h-36 object-contain" />
                    </div>
                  )}

                  {/* Actions Bar to update Status on the fly */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">
                      행정 조치 상태 조정:
                    </span>
                    
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => updateReportStatus(rep.id, '접수')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          rep.status === '접수'
                            ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm'
                        }`}
                      >
                        🔴 접수
                      </button>
                      <button
                        onClick={() => updateReportStatus(rep.id, '확인 중')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          rep.status === '확인 중'
                            ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm'
                        }`}
                      >
                        🟡 확인 중
                      </button>
                      <button
                        onClick={() => updateReportStatus(rep.id, '처리 완료')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          rep.status === '처리 완료'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm'
                        }`}
                      >
                        🟢 처리 완료
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right 1 Col: AI Advisory Agent Panel */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur-md shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-250 text-cyan-600 shadow-sm">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">EcoCity AI 어드바이저</h3>
              <p className="text-[10px] text-slate-400 font-bold font-mono">POLICY ADVISER MODULE</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
            실시간 수신되는 시민 신고 내역과 도시 에너지 통계를 융합하여 기계 학습식 룰 베이스 추천 정책을 자율 제안하는 AI 행정 보조 모듈입니다.
          </p>

          <div className="space-y-4">
            {aiRecs.map((rec) => {
              const borderStyle = 
                rec.severity === 'critical'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : rec.severity === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700';

              const icon = 
                rec.severity === 'critical'
                  ? <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  : rec.severity === 'warning'
                  ? <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  : <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />;

              return (
                <div key={rec.id} className={`rounded-xl border p-4.5 space-y-3 text-xs leading-relaxed ${borderStyle} shadow-sm`}>
                  <div className="flex items-start gap-2">
                    {icon}
                    <p className="font-semibold">{rec.text}</p>
                  </div>

                  {rec.actionText && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/50 text-[10px] font-mono font-bold tracking-wide uppercase text-slate-400">
                      <span>개선 추천 액션</span>
                      <span className="text-cyan-600">{rec.actionText} ➔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Administrative summary widget */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-2.5 font-mono text-[10px] font-bold text-slate-500 shadow-inner">
            <span className="block text-slate-400 font-bold tracking-wider uppercase mb-1">행정 효율 종합 리포트</span>
            <div className="flex items-center justify-between">
              <span>총 민원 수신량</span>
              <span className="text-slate-700">{reports.length} 건</span>
            </div>
            <div className="flex items-center justify-between">
              <span>미해결 오염 민원</span>
              <span className="text-rose-600">{reports.filter(r => r.status !== '처리 완료' && r.type === '환경오염').length} 건</span>
            </div>
            <div className="flex items-center justify-between">
              <span>평균 조치 소요율</span>
              <span className="text-emerald-600">실시간 반영 (즉시)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
