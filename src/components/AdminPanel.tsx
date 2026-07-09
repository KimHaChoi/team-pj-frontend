import React, { useState } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import { 
  Filter, 
  HelpCircle, 
  AlertTriangle, 
  Bot,
  Building,
  Scale
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
        text: 'E구역 관할권에서 야간 가로등 상시 전력 과소비에 관한 제보가 누적 확인되었습니다. 공공 전력 보호를 위해 즉각 "가로등 야간 절전제" 실행을 권고합니다.',
        actionText: '가로등 야간 절전 모드 개시',
        severity: 'critical'
      });
    }

    // Rule 2: Pollution in Sector A (Industrial area)
    const aPollution = activeReports.filter(r => r.location === 'A구역' && r.type === '환경오염');
    if (aPollution.length > 0) {
      recommendations.push({
        id: 'rec-2',
        text: 'A구역 중공업 제조 산업지대 일대에서 대기 가스 배출 기준 초과 민원이 상정되었습니다. 관할 법령에 의거하여 "노후 공장 장비 조기 철거 및 개량" 지시가 필요합니다.',
        actionText: 'A구역 필터 설비 정밀 진단 지시',
        severity: 'critical'
      });
    }

    // Rule 3: Aging systems in C-Sector / Public building
    const cProblems = activeReports.filter(r => r.location === 'C구역');
    const cHasAging = facilities.some(f => f.location === 'C구역' && f.isAging);
    if (cProblems.length > 0 && cHasAging) {
      recommendations.push({
        id: 'rec-3',
        text: '행정 중앙 구획(C구역) 공공 자산 내의 에너지 유출과 설비 기계 고장 건의가 식별되었습니다. 정부 기관 모범 가동을 위한 "노후 공공 기물 고효율 정비 개축" 사업 추진을 검고합니다.',
        actionText: 'C구역 공공 자산 특별 정비 검토',
        severity: 'warning'
      });
    }

    // Rule 4: System Overload (Consumption > Production)
    const totalProd = facilities.reduce((sum, f) => sum + f.energyProduction, 0);
    const totalCons = facilities.reduce((sum, f) => sum + f.energyConsumption, 0);
    if (totalCons > totalProd) {
      recommendations.push({
        id: 'rec-4',
        text: '심각: 도시 가용 전력망 종합 전력 생산량 대비 주민 및 가혹 산업 전력 총소비가 초과하는 공급 적자가 지속되고 있습니다. 블랙아웃 방지를 위해 조속히 "친환경 청정 발전기" 신설을 의결하십시오.',
        severity: 'critical'
      });
    }

    // Default recommendation if everything is clean
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-clean',
        text: '정상: 현재 시각 기준, 도시 전역의 환경 임계 위해 요인 또는 전력 공급 적자 리스크가 감지되지 않았습니다. 지적 모니터링 체계를 현 수준으로 정밀 유지해 주십시오.',
        severity: 'info'
      });
    }

    return recommendations;
  };

  const aiRecs = generateRecommendations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
      
      {/* 1. 서비스 안내 헤더 */}
      <div className="border-b-2 border-[#003366] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#0284c7] uppercase leading-none">
            MUNICIPAL CIVIL AFFAIRS PROCESSING CENTER
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-1 flex items-center gap-2">
            <Building className="w-6 h-6 text-[#003366]" />
            <span>지자체 합동 민원 처리 및 행정 조치실</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-semibold">
            시민이 실시간 정식 제출한 대국민 오염 및 전력 위해 신고 리스트를 열람 조치하고 지자체 표준 지침에 따라 처리 상태를 변경하는 공무원용 전산 워크플로우 본부입니다.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* 2. 좌측 2열: 메인 검색 및 문서 처리 대장 리스트 (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Filter Container Card */}
          <div className="portal-card p-5 bg-white">
            <div className="pb-3 border-b border-slate-200 mb-4 flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#003366]" />
              <h3 className="text-xs font-bold text-slate-500 font-sans tracking-wide uppercase">
                정부 공공 민원 전산 대장 다중 필터링
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* District Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-sans uppercase">관할 행정구역</span>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full rounded bg-white border border-slate-300 px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#003366]"
                >
                  <option value="All">전체 구획 (A~E구역)</option>
                  <option value="A구역">🧭 A구역</option>
                  <option value="B구역">🧭 B구역</option>
                  <option value="C구역">🧭 C구역</option>
                  <option value="D구역">🧭 D구역</option>
                  <option value="E구역">🧭 E구역</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-sans uppercase">민원 분류 종류</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded bg-white border border-slate-300 px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#003366]"
                >
                  <option value="All">전체 분류</option>
                  <option value="환경오염">🌿 환경오염</option>
                  <option value="에너지 낭비">⚡ 에너지 낭비</option>
                  <option value="시설 고장">⚙️ 시설 고장</option>
                  <option value="쓰레기 문제">🗑️ 쓰레기 문제</option>
                  <option value="기타">❓ 기타</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-sans uppercase">행정 조치 상태</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded bg-white border border-slate-300 px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#003366]"
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
            <h4 className="text-xs font-bold text-slate-500 font-sans uppercase tracking-wider flex items-center space-x-2">
              <span className="inline-block w-2 h-2 bg-[#003366] rounded-sm" />
              <span>지자체 등재 대국민 민원 관리 대장 ({filteredReports.length}건 조회됨)</span>
            </h4>

            {filteredReports.length === 0 ? (
              <div className="portal-card p-12 text-center text-slate-400 bg-white">
                <Bot className="w-8 h-8 mx-auto mb-2.5 text-slate-300" />
                <span className="text-xs font-bold text-slate-600">설정한 필터 조건에 저촉되는 서식이 없습니다.</span>
              </div>
            ) : (
              filteredReports.map((rep) => (
                <div 
                  key={rep.id}
                  className="portal-card p-5 bg-white space-y-4 hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[9px] font-bold font-mono tracking-wide px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                          {rep.location}
                        </span>
                        <span className="text-[9px] font-bold font-mono tracking-wide px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                          {rep.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-2">{rep.title}</h4>
                    </div>

                    <div className="text-[10px] text-slate-400 font-bold font-mono whitespace-nowrap">
                      행정접수일: {new Date(rep.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {rep.description}
                  </p>

                  {rep.imageUrl && (
                    <div className="relative rounded border border-slate-300 max-w-xs bg-slate-50 p-1 shadow-sm">
                      <img src={rep.imageUrl} alt="첨부사진" className="max-h-36 object-contain rounded-sm" />
                    </div>
                  )}

                  {/* Actions Bar to update Status on the fly */}
                  <div className="pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold font-sans uppercase">
                      담당 공무원 결재 서명 조치:
                    </span>
                    
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => updateReportStatus(rep.id, '접수')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                          rep.status === '접수'
                            ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                            : 'bg-white border-slate-300 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        🔴 접수
                      </button>
                      <button
                        onClick={() => updateReportStatus(rep.id, '확인 중')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                          rep.status === '확인 중'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm'
                            : 'bg-white border-slate-300 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        🟡 확인 중
                      </button>
                      <button
                        onClick={() => updateReportStatus(rep.id, '처리 완료')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                          rep.status === '처리 완료'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                            : 'bg-white border-slate-300 text-slate-400 hover:text-slate-600'
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

        {/* 3. 우측 1열: AI 자율 행정 권고 조치 제안 모듈 (1 Col) */}
        <div className="overflow-hidden portal-card p-6 bg-white space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-[#cbd5e1] bg-slate-50 text-[#003366] shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">AI 자율 행정 권고 조치</h3>
              <p className="text-[9px] text-[#0284c7] font-bold font-mono">GOVERNMENT COGNITIVE AGENT</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
            실시간 수신되는 시민 기재 신고 요지 및 도시 발전 소비 대장 정보를 융합 분석하여, 관련 조례에 저촉되는 위험 요소를 선제 탐지해 조치를 추천 권고하는 AI 보조 시스템입니다.
          </p>

          <div className="space-y-4">
            {aiRecs.map((rec) => {
              const borderStyle = 
                rec.severity === 'critical'
                  ? 'border-rose-300 bg-rose-50 text-rose-800'
                  : rec.severity === 'warning'
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800';

              const icon = 
                rec.severity === 'critical'
                  ? <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  : <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />

              return (
                <div key={rec.id} className={`rounded border p-4 space-y-3.5 text-xs leading-relaxed ${borderStyle}`}>
                  <div className="flex items-start gap-2">
                    {icon}
                    <p className="font-bold">{rec.text}</p>
                  </div>

                  {rec.actionText && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/50 text-[9px] font-mono font-bold tracking-wide uppercase text-slate-400">
                      <span>개선 권고 방안</span>
                      <span className="text-[#0284c7]">{rec.actionText} ➔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Administrative summary ledger */}
          <div className="rounded border border-slate-300 bg-slate-50 p-4 space-y-2.5 font-mono text-[10px] font-bold text-slate-600 shadow-inner">
            <span className="block text-slate-400 font-extrabold tracking-wider uppercase mb-1">행정 조치 통계 보고</span>
            <div className="flex items-center justify-between">
              <span>누적 민원 수신고</span>
              <span className="text-slate-800 font-extrabold">{reports.length} 건</span>
            </div>
            <div className="flex items-center justify-between">
              <span>미조치 위해 민원</span>
              <span className="text-rose-600 font-extrabold">{reports.filter(r => r.status !== '처리 완료' && r.type === '환경오염').length} 건</span>
            </div>
            <div className="flex items-center justify-between">
              <span>조치 지연 및 소요율</span>
              <span className="text-emerald-600 font-extrabold">실시간 조치 가동 중 (0%)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
