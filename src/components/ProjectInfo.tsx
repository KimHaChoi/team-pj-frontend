import React, { useState } from 'react';
import { BookOpen, ShieldAlert, Sparkles, Navigation, AlertTriangle } from 'lucide-react';

export const ProjectInfo: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const slides = [
    {
      title: '01. 문제 인식 (Problem)',
      subtitle: '노 휴먼스랜드 폐지 이후의 역설',
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-xs font-semibold">
          <p className="text-sm font-bold text-slate-800">
            『노 휴먼스랜드』는 인간의 출입을 철저히 금지해 대자연을 보존하려던 취지였으나, 모종의 한계로 인해 마침내 공식 폐지 수순을 밟게 됩니다.
          </p>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 font-bold">
            ⚠️ 인간 복귀에 따른 환경 부하: 도시 재건축(건물 복구, 도로 정비, 공장 재가동 등)에는 엄청난 전력과 에너지가 소비되며, 이 과정에서 이산화탄소 배출과 환경 파괴가 급증하는 역설적 오염 상태에 부딪히게 됩니다.
          </div>
          <p className="font-semibold text-slate-500">
            우리는 이 복원 과도기에서 발생하는 에너지 낭비와 유해 환경 요소를 방치할 경우, 또 다른 형태의 생태계 파괴가 대한민국 전역을 뒤덮을 것임을 인지하고 이 문제를 예방 및 제어할 SW의 필요성을 절감했습니다.
          </p>
        </div>
      )
    },
    {
      title: '02. 핵심 아이디어 (Solution)',
      subtitle: '시뮬레이터와 시민 신고의 결합',
      icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-xs font-semibold">
          <p className="text-sm font-bold text-slate-800">
            도시 에너지 효율 제어와 상향식 시민 제보를 실시간으로 결합한 하이브리드 솔루션 **EcoCity**를 설계했습니다.
          </p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block font-bold text-cyan-600 mb-1">🕹️ 도시 에너지 시뮬레이터</span>
              <p className="text-slate-500 font-bold leading-normal">
                공업시설, 발전소, 가로등 전력 소모량을 실시간 계측 및 제어하고 최적의 에너지 수급 밸런스를 정책적으로 관리합니다.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block font-bold text-emerald-600 mb-1">📢 시민 참여형 신고 시스템</span>
              <p className="text-slate-500 font-bold leading-normal">
                환경 파괴와 전력 낭비를 목격한 시민이 현장 사진과 함께 즉시 클라우드에 제보하여, 격자 맵에 시각 경고를 활성화합니다.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '03. 핵심 기능 (Features)',
      subtitle: '종합적인 미래 제어 패널 설계',
      icon: <Navigation className="w-5 h-5 text-cyan-500" />,
      content: (
        <div className="grid gap-4 grid-cols-2 text-[11px] text-slate-500 font-semibold leading-normal">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="block font-bold text-slate-800 mb-1">📊 지능형 대시보드</span>
            <span>종합 친환경 점수(Eco Score), 공급 대비 수요 충족률, 오염 통계 지표 분석.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="block font-bold text-slate-800 mb-1">🌿 환경 시뮬레이터</span>
            <span>태양광 증설, 노후 개량 교체, 전역 가로등 야간 자동 절전 정책 가상 제어.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="block font-bold text-slate-800 mb-1">🧭 가상 격자 관제 맵</span>
            <span>구역(A~E)별 민원 빈도에 따른 네온 경고 펄스 및 증빙 사진 포함 상세 모달 조회.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="block font-bold text-slate-800 mb-1">🤖 AI 어드바이저 위젯</span>
            <span>데이터 통계와 미결 민원을 융합 분석해 실시간 해결방안 가이드라인 자동 출력.</span>
          </div>
        </div>
      )
    },
    {
      title: '04. 변화된 스토리 (Scenario)',
      subtitle: '대한민국 도시 재창조 시나리오',
      icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
      content: (
        <div className="space-y-3.5 text-slate-600 leading-relaxed text-xs font-semibold">
          <div className="relative pl-6 border-l border-slate-200 space-y-3">
            <div className="relative">
              <span className="absolute -left-8.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-bold font-mono">1</span>
              <p className="font-bold text-slate-800 text-xs">재건축 개시와 탄소 위기</p>
              <p className="text-slate-500 font-semibold mt-0.5">인간의 귀환으로 공장과 화력 설비 가동이 촉발되어 오염 수치가 급등함.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-8.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-bold font-mono">2</span>
              <p className="font-bold text-slate-800 text-xs">EcoCity 관제 센터 도입</p>
              <p className="text-slate-500 font-semibold mt-0.5">시민들의 사진 제보가 격자 관제 지도로 실시간 수렴되어 위험지가 직관화됨.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-8.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[10px] text-emerald-600 font-bold font-mono">3</span>
              <p className="font-bold text-emerald-600 text-xs">친환경 복원 성공</p>
              <p className="text-slate-500 font-semibold mt-0.5">관리자의 저탄소 설비 개축과 가로등 절전 명령이 실시간 클라우드로 관철되어 깨끗한 복원이 수립됨.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '05. 한계점 및 개선 방향 (Roadmap)',
      subtitle: '실제 데이터를 품을 미래의 플랫폼',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-xs font-semibold">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 font-bold">
            🎯 한계점: 현재는 시뮬레이션 기반의 임의 계측치와 수동 시민 신고에 의존해 허위 정보 차단이 다소 미흡할 수 있습니다.
          </div>
          <div className="space-y-2">
            <span className="block font-bold text-slate-800">🚀 향후 발전 및 고도화 로드맵:</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-500 font-bold">
              <li>공공 오픈 API 및 실제 미세먼지 측정 IoT 센서 데이터의 백엔드 연동.</li>
              <li>AI 머신러닝 비전 엔진을 도입해 시민이 업로드한 사진의 진위 및 훼손 규모 자동 판독.</li>
              <li>이상 수치 감지 시 해당 구역 가로등 및 기기의 대기 모드 자율 명령 엣지 알고리즘 탑재.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-display font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          EcoCity 프레젠테이션 (Presentation Deck)
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          웹앱에 내장된 고화질 발표자료 슬라이드 쇼입니다. PPT 화면 대용으로 활용하여 편리하게 발표할 수 있습니다.
        </p>
      </div>

      {/* Slide frame */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 sm:p-8 backdrop-blur-md shadow-sm h-[400px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/5 filter blur-3xl" />
        
        {/* Slide header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              {slides[activeSlide].icon}
              <span>{slides[activeSlide].title}</span>
            </h3>
            <p className="text-xs text-slate-400 font-bold font-mono tracking-wide">
              {slides[activeSlide].subtitle}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1 border border-slate-200 rounded-lg">
            SLIDE {activeSlide + 1} / {slides.length}
          </span>
        </div>

        {/* Slide content body */}
        <div className="flex-1 my-6 overflow-y-auto">
          {slides[activeSlide].content}
        </div>

        {/* Slide controller footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            ◀ 이전 슬라이드
          </button>
          
          {/* Bullet points */}
          <div className="flex space-x-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
                  activeSlide === idx ? 'bg-emerald-500 w-4' : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={activeSlide === slides.length - 1}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            다음 슬라이드 ▶
          </button>
        </div>
      </div>
    </div>
  );
};
