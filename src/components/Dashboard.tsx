import React from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import { StatCard } from './StatCard';
import { 
  Zap, 
  Flame, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Award
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { stats, facilities, reports, isLoading } = useEcoCity();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // Calculate live District-by-District Production vs Consumption
  const districts: ('A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역')[] = ['A구역', 'B구역', 'C구역', 'D구역', 'E구역'];
  const districtData = districts.map((dist) => {
    const distFacs = facilities.filter(f => f.location === dist);
    const prod = distFacs.reduce((sum, f) => sum + f.energyProduction, 0);
    const cons = distFacs.reduce((sum, f) => sum + f.energyConsumption, 0);
    return { name: dist, production: prod, consumption: cons };
  });

  // Calculate maximum value for chart scaling (min 200 to prevent zero division)
  const maxChartVal = Math.max(
    ...districtData.flatMap(d => [d.production, d.consumption]),
    200
  );

  // Get active alerts (unresolved reports)
  const activeAlerts = reports.filter(r => r.status !== '처리 완료').slice(0, 4);

  // Determine Eco Score level feedback
  const getEcoScoreFeedback = (score: number) => {
    if (score >= 80) return { label: '우수 (EXCELLENT)', desc: '지속 가능한 완벽한 친환경 상태', color: 'text-emerald-600' };
    if (score >= 60) return { label: '양호 (GOOD)', desc: '탄소 배출 및 에너지 효율이 무난함', color: 'text-cyan-600' };
    if (score >= 40) return { label: '경고 (WARNING)', desc: '일부 구역 화력/공장 오염 조치 필요', color: 'text-amber-600' };
    return { label: '위험 (DANGER)', desc: '과도한 전력 낭비 및 심각한 환경 오염 상태', color: 'text-rose-600' };
  };

  const scoreFeedback = getEcoScoreFeedback(stats.ecoScore);

  // SVG Gauge calculations
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.ecoScore / 100) * circumference;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            도시 통합 관제 대시보드
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-xl font-medium">
            복원 구역의 실시간 전력 사용량 및 공공 오염도를 요약한 메인 대시보드입니다. 시뮬레이션 결과 및 실시간 신고 데이터가 연동됩니다.
          </p>
        </div>
      </div>

      {/* Grid: Eco Score Gauge + KPI Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Big Eco Score Gauge */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 flex flex-col items-center justify-center text-center backdrop-blur-md shadow-sm">
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/5 filter blur-3xl" />
          
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
            종합 친환경 지수 (ECO SCORE)
          </h3>

          {/* SVG Circular Gauge */}
          <div className="relative my-6 flex items-center justify-center">
            <svg className="h-40 w-40 transform -rotate-90">
              {/* Back track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#f1f5f9" /* slate-100 */
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Active track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="url(#ecoGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              {/* Gradients */}
              <defs>
                <linearGradient id="ecoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
                  <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center value */}
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-display font-extrabold tracking-tight text-slate-800">
                {stats.ecoScore}
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider">/ 100 PTS</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className={`text-sm font-extrabold tracking-wide ${scoreFeedback.color}`}>
              {scoreFeedback.label}
            </p>
            <p className="text-xs text-slate-500 px-4 leading-relaxed font-semibold">
              {scoreFeedback.desc}
            </p>
          </div>

          {/* Score breakdown metrics footer */}
          <div className="mt-6 w-full grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-[10px] font-semibold text-slate-400 font-mono">
            <div className="border-r border-slate-100">
              <span className="block text-slate-700 font-bold">{facilities.filter(f => f.isAging).length}개</span>
              노후 설비
            </div>
            <div>
              <span className="block text-slate-700 font-bold">{stats.unresolvedReports}건</span>
              미해결 민원
            </div>
          </div>
        </div>

        {/* Right Column: Key KPI Stats Cards Grid */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <StatCard
            title="총 전력 생산량"
            value={`${stats.totalProduction} MW`}
            icon={<Zap className="w-5 h-5" />}
            color="green"
            subText="친환경 및 기성 발전량 합산"
            progress={(stats.totalProduction / maxChartVal) * 100}
          />
          <StatCard
            title="총 전력 소비량"
            value={`${stats.totalConsumption} MW`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
            subText={`수요 충족률: ${Math.round((stats.totalConsumption / (stats.totalProduction || 1)) * 100)}%`}
            progress={(stats.totalConsumption / stats.totalProduction) * 100}
          />
          <StatCard
            title="도시 평균 오염도"
            value={`${stats.avgPollution}%`}
            icon={<Flame className="w-5 h-5" />}
            color={stats.avgPollution > 50 ? 'red' : stats.avgPollution > 25 ? 'yellow' : 'cyan'}
            subText="대기 오염 및 미세먼지 수치"
            progress={stats.avgPollution}
          />
          <StatCard
            title="미해결 환경 민원"
            value={`${stats.unresolvedReports} 건`}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={stats.unresolvedReports > 0 ? 'red' : 'green'}
            subText={`총 민원: ${stats.totalReports}건 중 미완료`}
            progress={(stats.unresolvedReports / (stats.totalReports || 1)) * 100}
          />
        </div>

      </div>

      {/* Grid: Charts + Real-time Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* District Chart Panel */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold tracking-tight text-slate-800">구역별 에너지 생산 및 소비 분석</h3>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-semibold">
              A~E구역 가동 시설들의 전력 공급(발전)과 수요(소비)의 실시간 수급 밸런스 비교 현황입니다.
            </p>
          </div>

          {/* Custom SVG/CSS Bar Chart Comparison */}
          <div className="my-8 flex flex-col space-y-6">
            {districtData.map((data) => {
              const prodPercent = (data.production / maxChartVal) * 100;
              const consPercent = (data.consumption / maxChartVal) * 100;

              return (
                <div key={data.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                    <span>{data.name}</span>
                    <span className="text-[10px] font-medium text-slate-500">
                      생산: <span className="text-emerald-600 font-bold">{data.production}</span> / 소비: <span className="text-cyan-600 font-bold">{data.consumption}</span> MW
                    </span>
                  </div>
                  
                  {/* Two comparative bars */}
                  <div className="space-y-1">
                    {/* Production bar */}
                    <div className="relative flex items-center h-2.5 w-full rounded-full bg-slate-100">
                      <div 
                        style={{ width: `${Math.max(2, prodPercent)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-emerald-400 shadow-sm transition-all duration-700 ease-out" 
                      />
                    </div>
                    {/* Consumption bar */}
                    <div className="relative flex items-center h-2.5 w-full rounded-full bg-slate-100">
                      <div 
                        style={{ width: `${Math.max(2, consPercent)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-cyan-400 shadow-sm transition-all duration-700 ease-out" 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Legends */}
          <div className="flex items-center space-x-6 text-[11px] font-bold text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <span>에너지 생산량 (MW)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-6 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" />
              <span>에너지 소비량 (MW)</span>
            </div>
          </div>
        </div>

        {/* Real-time Alarm / Incident Feed */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 flex flex-col backdrop-blur-md shadow-sm">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold tracking-tight text-slate-800">실시간 환경 알림 피드</h3>
              </div>
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-600 border border-rose-200/50 animate-pulse">
                ACTIVE
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-semibold">
              시민들로부터 제보 및 접수된 최신 미완료 민원 사건입니다.
            </p>
          </div>

          {/* Alarm list */}
          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[280px] pr-1">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <Award className="w-8 h-8 text-emerald-500 opacity-60 mb-2" />
                <span className="text-xs font-bold">미해결 알림이 없습니다.</span>
                <span className="text-[10px] mt-0.5 text-slate-400">완전 무공해 도시 수립 중</span>
              </div>
            ) : (
              activeAlerts.map((report) => (
                <div 
                  key={report.id}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/50"
                >
                  <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${
                    report.status === '접수' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                  }`} />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-[9px] font-mono font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                        {report.type}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {report.location}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-700 truncate">
                      {report.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 font-medium">
                      {report.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {activeAlerts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 font-mono flex items-center justify-center space-x-1 uppercase">
                <span>Total open issues: {stats.unresolvedReports}</span>
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
