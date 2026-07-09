import React, { useState } from 'react';
import { BookOpen, ShieldAlert, Sparkles, Navigation, AlertTriangle, Presentation, ChevronLeft, ChevronRight } from 'lucide-react';

export const ProjectInfo: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const slides = [
    {
      title: '01. 사업 추진 배경 (Background)',
      subtitle: '노 휴먼스랜드 폐지 조치와 복원 도시의 탄소 부하',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-xs font-semibold">
          <p className="text-sm font-bold text-slate-800">
            『노 휴먼스랜드』 규정이 종결됨에 따라, 복원 대상 지역으로 인간의 주거 및 공업 활동이 동시 다발적으로 개시되었습니다.
          </p>
          <div className="p-4 rounded bg-rose-50 border border-rose-200 text-rose-800 font-bold">
            ⚠️ 과도한 에너지 소비 유실: 급격한 인구 귀환 및 도심 정비, 공업 단지 재건축으로 인해 단기 전력 소비량이 급등하였으며, 탄소 가스 유출 및 매연 오염 등 역설적인 복기 환경 부하가 가속되고 있습니다.
          </div>
          <p className="font-semibold text-slate-500 leading-relaxed">
            행정 사각지대에서 방치되는 에너지 과소비와 환경 오염원을 조속히 통제하지 않을 경우, 대자연 생태 보존 구역의 복원 자체가 무력화될 수 있어 행정 및 시민이 결합된 상시 통제 시스템 수립이 시급합니다.
          </p>
        </div>
      )
    },
    {
      title: '02. 기술적 해결 방안 (Solution)',
      subtitle: 'Virtual Simulator 제어와 상향식 시민 제보 통합 플랫폼',
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-xs font-semibold">
          <p className="text-sm font-bold text-slate-800">
            도시 에너지 설비의 하향식 원격 통제와, 시민의 눈으로 찾아내는 상향식 환경 민원 체계를 융합하였습니다.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded border border-slate-300 bg-slate-50">
              <span className="block font-bold text-[#003366] text-sm mb-1.5">🕹️ 가상 에너지 시뮬레이터</span>
              <p className="text-slate-500 font-bold leading-relaxed">
                시내 가동 시설별 발전량 및 소모 소비량을 전산 가상화하여 수동 원격 정책 지시(가로등 절전, 장비 리모델링)를 모의 가동합니다.
              </p>
            </div>
            <div className="p-4 rounded border border-slate-300 bg-slate-50">
              <span className="block font-bold text-[#0284c7] text-sm mb-1.5">📢 시민 참여형 실시간 제보 GIS</span>
              <p className="text-slate-500 font-bold leading-relaxed">
                환경 파괴 상황이나 무단 투기 등의 임계 위해 요소를 시민이 즉시 사진과 함께 웹 포털로 제고하여 행정 관제 지도에 공유합니다.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '03. 플랫폼 핵심 체계 (Key Features)',
      subtitle: '공공 표준 데이터 융합을 통한 대국민 관제 대장',
      icon: <Navigation className="w-5 h-5 text-[#0284c7]" />,
      content: (
        <div className="grid gap-4 sm:grid-cols-2 text-xs text-slate-600 font-semibold leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded border border-slate-300">
            <span className="block font-bold text-[#003366] mb-1.5">📊 통합 에너지 현황 대시보드</span>
            <span>종합 친환경 지표(Eco Score), 공급 대비 실소비 전력 충족률, 미해결 시민 환경 민원 통계 현황.</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded border border-slate-300">
            <span className="block font-bold text-[#003366] mb-1.5">⚙️ 가상 정책 조치 컨트롤러</span>
            <span>신재생 발전소 추가 기안, 노후 비효율 발전 교체, 가로등 전력 60% 차단 절전 모드 정책 실행.</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded border border-slate-300">
            <span className="block font-bold text-[#003366] mb-1.5">🧭 지리 정보 GIS 지적 관제 지도</span>
            <span>행정 섹션 구역(A~E구역)별 실시간 위험 점화 펄스 및 증빙 이미지 상세 확인 모달.</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded border border-slate-300">
            <span className="block font-bold text-[#003366] mb-1.5">⚖️ AI 자율 행정 권고 조치 제안</span>
            <span>대장 통계 수치와 접수된 민원을 종합하여 즉시 개선이 요구되는 현안과 우선 액션 플랜 제시.</span>
          </div>
        </div>
      )
    },
    {
      title: '04. 행정 적용 시나리오 (Use Case)',
      subtitle: '도시 환경 재건 및 탄소 중립 가동 전개',
      icon: <BookOpen className="w-5 h-5 text-[#003366]" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-xs font-semibold">
          <div className="relative pl-6 border-l-2 border-slate-300 space-y-4">
            <div className="relative">
              <span className="absolute -left-9.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold font-mono">1</span>
              <p className="font-bold text-slate-800 text-xs">도시 복원 활동에 따른 전력 적자</p>
              <p className="text-slate-500 font-bold mt-1">도심 인구 유입 증가로 인해 A공업지대의 대기 매연 방지 장치 및 전력망 부족 현상이 동시 촉발.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-9.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold font-mono">2</span>
              <p className="font-bold text-slate-800 text-xs">시민 모니터링 민원 실시간 GIS 수렴</p>
              <p className="text-slate-500 font-bold mt-1">시민들이 이상 가동 공장을 격자 지도에 신고 등록하여 행정 위험 신호 즉각 유도.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-9.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#e0f2fe] text-[#003366] border border-[#003366] text-[11px] font-bold font-mono">3</span>
              <p className="font-bold text-[#003366] text-xs">관리자의 가상 에너지 정비 행정 조치 개시</p>
              <p className="text-slate-500 font-bold mt-1">행정 관리자가 노후 기기 개량 및 친환경 태양광 발전소 허가를 기안 및 완료하여 도시 친환경 지수 즉각 회복.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '05. 시스템 한계 및 로드맵 (Roadmap)',
      subtitle: '미래지향적 환경 에너지 공공 안전 통합 플랫폼',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-xs font-semibold">
          <div className="p-4 rounded border border-amber-300 bg-amber-50 text-amber-950 font-bold">
            🎯 시스템 설계 한계: 본 버전은 가상 시뮬레이션 기반 시정 데이터에 기반하므로, 시민의 무작위 허위 제보에 대한 실시간 자동 AI 인증 필터링 체계는 추가 연동을 요합니다.
          </div>
          <div className="space-y-2">
            <span className="block font-bold text-slate-800">🚀 향후 발전 고도화 로드맵:</span>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-500 font-bold">
              <li>공공 포털 환경부 오픈 API 및 미세먼지 측정 드론 센서 하드웨어 직접 연계.</li>
              <li>AI 딥러닝 비전 엔진을 연계하여 시민이 접수한 사진의 손상 척도와 훼손 여부 자동 판독.</li>
              <li>위험 한계치 오염 발생 시 행정망과 연동된 인근 변전소 설비의 출력 자율 조정 스마트 시티 자동 가동.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
      
      {/* 1. 서비스 안내 헤더 */}
      <div className="border-b-2 border-[#003366] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#0284c7] uppercase leading-none">
            BUSINESS BRIEFING SLIDE DECK
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-1 flex items-center gap-2">
            <Presentation className="w-6 h-6 text-[#003366]" />
            <span>EcoCity 사업 개요 및 대국민 제안 설명서</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-semibold">
            통합 환경 에너지 복원 사업의 기획 요지, 주요 해결 방안 및 향후 국가 행정망 전산 연동 고도화 로드맵을 요약 기재한 대국민 공식 브리핑 슬라이드입니다.
          </p>
        </div>
      </div>

      {/* 2. 프레젠테이션 슬라이드 프레임 */}
      <div className="portal-card p-6 sm:p-8 bg-white h-[410px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Slide Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {slides[activeSlide].icon}
              <span>{slides[activeSlide].title}</span>
            </h3>
            <p className="text-[10px] text-[#0284c7] font-bold font-mono tracking-wide">
              {slides[activeSlide].subtitle}
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 border border-slate-300 rounded">
            PAGE {activeSlide + 1} / {slides.length}
          </span>
        </div>

        {/* Slide Content Body */}
        <div className="flex-1 my-5 overflow-y-auto pr-1">
          {slides[activeSlide].content}
        </div>

        {/* Slide Controller Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
            className="flex items-center gap-1 px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 장</span>
          </button>
          
          {/* Bullet points */}
          <div className="flex space-x-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  activeSlide === idx ? 'bg-[#003366] w-4.5' : 'bg-slate-300 hover:bg-slate-400 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={activeSlide === slides.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded bg-[#003366] hover:bg-[#0a3054] text-white text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            <span>다음 장</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
