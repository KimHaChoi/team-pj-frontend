import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import type { Report, Facility, User } from '../types';

export const AdminPanel: React.FC = () => {
  const { getAllUsers, toggleBlockUser } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'DASHBOARD' | 'REPORTS' | 'FACILITIES' | 'USERS'>('DASHBOARD');

  // Selected report for review modal
  const [selectedReviewReport, setSelectedReviewReport] = useState<Report | null>(null);
  
  // Resolution form states
  const [assignedTo, setAssignedTo] = useState('');
  const [resultMemo, setResultMemo] = useState('');
  const [outcomeImagePreview, setOutcomeImagePreview] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to live DB updates
  useEffect(() => {
    const unsubReports = dbService.listenReports((data) => {
      setReports(data);
    });
    const unsubFacilities = dbService.listenFacilities((data) => {
      setFacilities(data);
    });
    
    loadUsers();

    return () => {
      unsubReports();
      unsubFacilities();
    };
  }, []);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsersList(data);
  };

  // Image load handling for after-action mock photo
  const handleOutcomeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setOutcomeImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Action handler to resolve report
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewReport) return;

    if (!assignedTo.trim() || !resultMemo.trim()) {
      alert('담당 조치 부서와 해결 경과 메모를 공란 없이 기입해 주십시오.');
      return;
    }

    setIsProcessingAction(true);
    try {
      // Execute the resolve transaction (this triggers citizen point accumulation dynamically inside dbService)
      await dbService.updateReportStatusAndResult(
        selectedReviewReport.id,
        'RESOLVED',
        assignedTo,
        resultMemo,
        outcomeImagePreview || ''
      );

      // Clean up modal states
      setSelectedReviewReport(null);
      setAssignedTo('');
      setResultMemo('');
      setOutcomeImagePreview(null);
      
      // Reload users to update points in live USERS list
      await loadUsers();
      alert('행정 해결 결재 서명이 승인되었습니다. 해당 시민에게 환경 마일리지가 자동 적립되었습니다!');

    } catch (err) {
      console.error(err);
      alert('결재 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Toggle citizen block state (D-4)
  const handleToggleUserBlock = async (targetUser: User) => {
    const updatedBlocked = !targetUser.blocked;
    const confirmMsg = updatedBlocked 
      ? `'${targetUser.name}' 시민을 장난 누적으로 영구 정지/차단하시겠습니까?`
      : `'${targetUser.name}' 시민의 계정 차단을 해제하시겠습니까?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleBlockUser(targetUser.uid);
      await loadUsers(); // reload users list
    } catch (err) {
      console.error(err);
      alert('시민 평판 업데이트 중 오류가 발생했습니다.');
    }
  };

  // Toggle virtual streetlight status
  const handleToggleFacilityStatus = async (facId: string, currentStatus: Facility['status']) => {
    let nextStatus: Facility['status'] = 'ON';
    if (currentStatus === 'ON') nextStatus = 'OFF';
    else if (currentStatus === 'OFF') nextStatus = '점검 중';

    try {
      await dbService.updateFacility(facId, nextStatus);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate executive KPI metrics
  const totalReportsCount = reports.length;
  const meaningfulReports = reports.filter(r => r.isMeaningful);
  const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;
  const pendingCriticalCount = reports.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED' && r.aiScore >= 75 && r.isMeaningful).length;
  const resolveRate = totalReportsCount > 0 ? Math.round((resolvedCount / totalReportsCount) * 100) : 100;

  // Sorting reports by AI Score Descending (Highest priority first) (3단계 - 2)
  const prioritySortedReports = [...reports].sort((a, b) => b.aiScore - a.aiScore);

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 pb-24 md:pb-8 space-y-5 animate-fadeIn">
      {/* SaaS Admin Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-900 text-white rounded-3xl p-5 shadow-md">
        <div>
          <span className="text-[9px] font-extrabold tracking-wider text-blue-400">CHALKAK ENTERPRISE SAAS CONSOLE</span>
          <h2 className="text-lg font-black tracking-tight mt-0.5">대구광역시 달성군 공공 기후 환경 조치 시스템</h2>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">
            공식 기후 에너지 관람과로써 시민 제보를 실시간 가치 평가하고 스마트 송전 가로등 자산을 원격 차단 제어합니다.
          </p>
        </div>

        {/* Workspace Mini Toggles */}
        <div className="flex flex-wrap gap-2 text-[10px] font-extrabold bg-white/5 p-1.5 rounded-2xl border border-white/10 self-stretch md:self-auto justify-around">
          <button
            onClick={() => setActiveAdminSubTab('DASHBOARD')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeAdminSubTab === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            📊 종합 KPI
          </button>
          <button
            onClick={() => setActiveAdminSubTab('REPORTS')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer relative ${
              activeAdminSubTab === 'REPORTS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            🚨 AI 우선순위 관제
            {reports.filter(r => r.status === 'RECEIVED' && r.isMeaningful).length > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-slate-900">
                {reports.filter(r => r.status === 'RECEIVED' && r.isMeaningful).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveAdminSubTab('FACILITIES')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer relative ${
              activeAdminSubTab === 'FACILITIES' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            💡 스마트 설비 제어
            {facilities.some(f => f.alertNeeded) && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-900 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveAdminSubTab('USERS')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeAdminSubTab === 'USERS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            👥 시민 평판 제재
          </button>
        </div>
      </div>

      {/* SUBTAB 1: EXECUTIVE HUD DASHBOARD */}
      {activeAdminSubTab === 'DASHBOARD' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Executive stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase">누적 제보 수신</span>
              <span className="text-2xl font-black text-slate-800 block">{totalReportsCount}건</span>
              <span className="text-[9px] text-slate-400 block font-semibold">스팸감지: {totalReportsCount - meaningfulReports.length}건</span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase">종합 민원 해결률</span>
              <span className="text-2xl font-black text-emerald-600 block">{resolveRate}%</span>
              <span className="text-[9px] text-slate-400 block font-semibold">해결 {resolvedCount}건 / 반려 {reports.filter(r=>r.status==='REJECTED').length}건</span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase">미해결 긴급 제보</span>
              <span className={`text-2xl font-black block ${pendingCriticalCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                {pendingCriticalCount}건
              </span>
              <span className="text-[9px] text-slate-400 block font-semibold">AI 스코어 75점 이상 기준</span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase">관할구청 승인 잔액</span>
              <span className="text-2xl font-black text-blue-600 block">756,000P</span>
              <span className="text-[9px] text-slate-400 block font-semibold">대국민 보상 탄소 지급풀</span>
            </div>
          </div>

          {/* Interactive summary panel & mini SVG grid maps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 h-[320px] flex flex-col justify-between relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
              
              <div className="relative z-10">
                <span className="text-[9px] text-blue-600 font-extrabold block">GEOGRAPHIC CADASTRE GRID MONITOR</span>
                <h3 className="text-sm font-black text-slate-800 mt-0.5">지자체 격자 관리 지도 실시간 모니터</h3>
              </div>

              {/* Simulated mini SVG map */}
              <div className="relative z-10 h-40 max-w-sm mx-auto w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 overflow-hidden">
                <svg className="w-full h-full text-slate-300" viewBox="0 0 300 200" fill="none" stroke="currentColor">
                  <path d="M30,100 Q150,20 270,100 T150,180 Z" strokeWidth="1" strokeDasharray="3,3" />
                  <rect x="20" y="20" width="70" height="50" rx="10" fill="currentColor" fillOpacity="0.05" />
                  <rect x="210" y="20" width="70" height="50" rx="10" fill="currentColor" fillOpacity="0.05" />
                  <circle cx="150" cy="100" r="30" fill="currentColor" fillOpacity="0.05" />
                </svg>
                {/* Overlay counts */}
                <div className="absolute top-[20%] left-[20%] bg-blue-600 text-white font-black text-[9px] py-0.5 px-2 rounded-lg">A: {reports.filter(r=>r.lat>=35.83 && r.lng<=128.46).length}건</div>
                <div className="absolute top-[20%] left-[70%] bg-blue-600 text-white font-black text-[9px] py-0.5 px-2 rounded-lg">B: {reports.filter(r=>r.lat>=35.83 && r.lng>128.46).length}건</div>
                <div className="absolute top-[50%] left-[45%] bg-blue-600 text-white font-black text-[9px] py-0.5 px-2 rounded-lg">C: {reports.filter(r=>r.lat<35.83 && r.lat>=35.82 && r.lng>=128.45).length}건</div>
              </div>

              <div className="text-[10px] text-slate-400 font-bold bg-slate-50 p-2 rounded-xl text-center leading-normal">
                각 관할권의 탄소 절감 활동 제보 수량이 매칭 구역 실시간 좌표에 따라 카운트됩니다.
              </div>
            </div>

            {/* Quick alert recommendations board */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 flex flex-col justify-between h-[320px]">
              <div>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">COGNITIVE RECOMMENDATIONS</span>
                <h3 className="text-xs font-bold text-slate-700 mt-0.5">AI 자율 시정 조치 추천사항</h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 py-1 pr-1">
                {reports.some(r => r.category === 'ENERGY_WASTE' && r.status !== 'RESOLVED') ? (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] text-amber-800 leading-normal font-semibold space-y-1 animate-fadeIn">
                    <span className="block font-black text-amber-700">⚡ 스마트 가로등 제어 권고</span>
                    <p>낮 시간 가로등 점등 관련 제보가 감지되었습니다. 지자체 전력 낭비 방지를 위해 해당 구역 가로등 원격 차단을 권고합니다.</p>
                  </div>
                ) : null}

                {reports.some(r => r.category === 'POLLUTION' && r.aiScore >= 80 && r.status !== 'RESOLVED') ? (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] text-rose-800 leading-normal font-semibold space-y-1 animate-fadeIn">
                    <span className="block font-black text-rose-700">🏭 심각 대기 배출 단속</span>
                    <p>AI가 심각 오염(90점 이상)을 진단한 민원이 등재되었습니다. 해당 산업 지대 필터 장비 특별 기획 점검 행정 명령을 상정해 주십시오.</p>
                  </div>
                ) : null}

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-500 leading-normal font-semibold">
                  <span className="block font-black text-slate-700">🌿 정상 유지 관리 보고</span>
                  <p>나머지 모든 관할권은 정상 환경 지표 범위 내에서 기후 탄소 저감 활동이 활발히 이행 중입니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AI-SCORED PRIORITY CONTROL ROOM (sorted by aiScore DESC) */}
      {activeAdminSubTab === 'REPORTS' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-sm font-black text-slate-800">AI 중요도 기반 우선순위 관제 대장</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Gemini AI가 실시간 평가한 시급성 점수(0~100) 내림차순 정렬입니다. 점수가 높은 긴급 제보부터 조속히 해결 배정하십시오.
            </p>
          </div>

          <div className="space-y-3">
            {prioritySortedReports.map((rep) => {
              const isSpam = !rep.isMeaningful;
              return (
                <div 
                  key={rep.id}
                  className={`bg-white rounded-3xl border shadow-sm p-4.5 space-y-3.5 transition-all hover:border-blue-400 ${
                    isSpam ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          {rep.category === 'ENERGY_WASTE' ? '💡 에너지 낭비' : rep.category === 'POLLUTION' ? '🏭 환경 오염' : rep.category === 'ILLEGAL_DUMPING' ? '🗑️ 무단 투기' : rep.category === 'NOISE' ? '🔊 소음/진동' : '⚙️ 기타'}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          rep.status === 'RESOLVED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : rep.status === 'IN_PROGRESS' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {rep.status === 'RECEIVED' ? '접수 대기' : rep.status === 'IN_PROGRESS' ? '조치 중' : rep.status === 'RESOLVED' ? '조치 해결' : '반려됨'}
                        </span>
                        {isSpam && (
                          <span className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full border border-rose-500 animate-pulse">
                            🚨 장난 허위 자동 판독
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-800 mt-2">{rep.title}</h4>
                    </div>

                    {/* AI Score Badge */}
                    <div className="text-right">
                      <span className="block text-[8px] text-slate-400 font-extrabold uppercase">AI URGENCY SCORE</span>
                      <span className={`text-xl font-black block leading-none mt-1 ${isSpam ? 'text-slate-300' : 'text-rose-600'}`}>
                        {rep.aiScore} P
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    {rep.description || '시민이 추가 상세 설명을 기재하지 않았습니다.'}
                  </p>

                  <div className="flex gap-4 items-center flex-wrap pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400 font-mono">
                    <span>👤 제보시민: {rep.userName} ({rep.userEmail})</span>
                    <span>📍 {rep.address}</span>
                    <span className="ml-auto text-slate-400">접수일: {new Date(rep.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Actions Area */}
                  <div className="flex justify-end gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        setSelectedReviewReport(rep);
                        setAssignedTo(rep.assignedTo || '');
                        setResultMemo(rep.resultMemo || '');
                        setOutcomeImagePreview(rep.resultImageUrl || null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl shadow-sm cursor-pointer transition-colors"
                    >
                      {rep.status === 'RESOLVED' ? '🔍 조치 내용 열람/수정' : '👷 조치 결재 서명'}
                    </button>
                    
                    {rep.status === 'RECEIVED' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('해당 신고를 스팸/장난성으로 분류해 공식 반려 처리하시겠습니까? (시민 허위신고 횟수가 1회 자동 누적 가산됩니다.)')) {
                            await dbService.updateReportStatusAndResult(rep.id, 'REJECTED', '지자체 환경과', 'AI 및 수동 분석 결과 장난/무의미한 텍스트 기재 신고로 판독하여 반려 처리합니다.', '');
                            alert('공식 반려 처리 완료');
                          }
                        }}
                        className="bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 hover:text-rose-700 text-slate-500 font-extrabold text-[10px] px-4 py-2 rounded-xl cursor-pointer transition-all"
                      >
                        ✕ 반려하기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: VIRTUAL TELEMETRY FACILITY PANEL */}
      {activeAdminSubTab === 'FACILITIES' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-sm font-black text-slate-800">지자체 스마트 가로등 및 설비 제어실</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              공공 가로등 전력 소모 상태를 감시하고, 시민들이 접수한 대낮 오작동 민원에 근거하여 원격으로 스위치를 차단 제어합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((fac) => {
              return (
                <div 
                  key={fac.id}
                  className={`bg-white rounded-3xl border p-5 space-y-4 transition-all ${
                    fac.alertNeeded 
                      ? 'border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.1)] ring-2 ring-rose-500/10' 
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 block font-mono">ID: {fac.id}</span>
                      <h4 className="text-xs font-black text-slate-800 mt-0.5">{fac.name}</h4>
                      <span className="block text-[9px] text-slate-400 mt-1">🗺️ 관할: 대구시 달성군 {fac.location}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                        fac.status === 'ON'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : fac.status === 'OFF'
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {fac.status === 'ON' ? '가동 중 (ON)' : fac.status === 'OFF' ? '차단 완료 (OFF)' : '수리 점검 중'}
                      </span>

                      {/* Flashing Alert Beacon */}
                      {fac.alertNeeded && (
                        <span className="bg-rose-600 text-white font-black text-[8px] py-0.5 px-1.5 rounded-lg border border-rose-500 animate-pulse">
                          🚨 점검 필요
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Telemetry info */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-bold text-slate-500">
                    <div>
                      <span className="block text-[8px] text-slate-400 font-sans">생산 에너지</span>
                      <span className="block text-slate-700 font-extrabold mt-0.5">{fac.energyProduction} kWh</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-400 font-sans">에너지 소비</span>
                      <span className="block text-slate-700 font-extrabold mt-0.5">{fac.energyConsumption} kWh</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-400 font-sans">탄소 저감 수준</span>
                      <span className="block text-emerald-600 font-black mt-0.5">{fac.carbonSaved} kg</span>
                    </div>
                  </div>

                  {/* Interactive ON/OFF switch buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFacilityStatus(fac.id, fac.status)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      ⚙️ 스마트 스위치 토글 (ON/OFF)
                    </button>
                    
                    {fac.alertNeeded && (
                      <button
                        onClick={async () => {
                          if (window.confirm('해당 구역의 가로등 불시 점검 및 전력 차단 처리를 완료하여 알람 경보를 강제 클리어하시겠습니까?')) {
                            await dbService.updateFacilityAlertNeeded(fac.id, false);
                            alert('알람 경보가 해제되었습니다.');
                          }
                        }}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[9px] px-3.5 rounded-xl cursor-pointer transition-colors"
                      >
                        경보 강제 해제
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 4: CITIZEN SAFETY PANEL (Sanction Hub) */}
      {activeAdminSubTab === 'USERS' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-sm font-black text-slate-800">지자체 대국민 시민 평판 단속 제재 대장</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              회원가입한 시민들의 기여 마일리지와 허위 제보 감지 건수(False Report Counts)를 관리하고, 악성 스패머를 수동 정지/차단합니다.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-3 space-y-2">
            <div className="flex text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 pb-2 px-3">
              <span className="flex-1">Citizen Member</span>
              <span className="w-24 text-center">False Count</span>
              <span className="w-24 text-center">Mileage</span>
              <span className="w-32 text-right">Sanction Action</span>
            </div>

            <div className="divide-y divide-slate-50">
              {usersList.map((targetUser) => {
                const isTroller = targetUser.falseReportCount >= 3;
                return (
                  <div key={targetUser.uid} className="flex items-center py-3 px-3">
                    {/* User profile */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{targetUser.name}</span>
                        {targetUser.blocked && (
                          <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-md animate-pulse">
                            BANNED
                          </span>
                        )}
                        {targetUser.role === 'ADMIN' && (
                          <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-md">
                            공직관
                          </span>
                        )}
                      </div>
                      <span className="block text-[9px] text-slate-400 truncate font-semibold mt-0.5">
                        {targetUser.email} • {targetUser.region}
                      </span>
                    </div>

                    {/* False counts */}
                    <div className="w-24 text-center">
                      <span className={`text-xs font-black ${isTroller ? 'text-rose-600 font-extrabold' : 'text-slate-600'}`}>
                        {targetUser.falseReportCount}회 / 5회 최대
                      </span>
                    </div>

                    {/* Current points */}
                    <div className="w-24 text-center">
                      <span className="text-xs font-black text-slate-700 font-mono">
                        {targetUser.points} P
                      </span>
                    </div>

                    {/* Sancion button */}
                    <div className="w-32 text-right">
                      {targetUser.role === 'ADMIN' ? (
                        <span className="text-[9px] text-slate-400 font-bold">제재 면제 대상</span>
                      ) : (
                        <button
                          onClick={() => handleToggleUserBlock(targetUser)}
                          className={`text-[9px] font-black py-1.5 px-3 rounded-xl shadow-sm transition-all cursor-pointer ${
                            targetUser.blocked
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          {targetUser.blocked ? '차단 해제' : '영구 정지'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE ACTION DECISION SIGNATURE MODAL OVERLAY */}
      {selectedReviewReport && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 animate-scaleUp shadow-2xl relative border border-slate-100 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setSelectedReviewReport(null);
                setOutcomeImagePreview(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-[9px] font-extrabold tracking-wider text-blue-600 block">GOVERNMENT RESOLUTION DISPATCH</span>
              <h3 className="text-base font-black text-slate-800 mt-0.5">시민 제보 행정 조치 결재</h3>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">제보 건명:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{selectedReviewReport.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI 긴급도:</span>
                <span className="font-extrabold text-rose-600 font-mono">{selectedReviewReport.aiScore}점</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">제보 시민:</span>
                <span className="font-bold text-slate-700">{selectedReviewReport.userName}</span>
              </div>
            </div>

            {selectedReviewReport.status === 'RESOLVED' ? (
              /* Already Resolved View mode */
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-[10px] text-emerald-800">
                  <span className="font-black block">✓ 처리 결재 승인 완료</span>
                  <p className="mt-1 leading-normal">본 민원은 정식으로 조치 완료 서명이 등록되었으며 해당 시민에게 포인트 마일리지가 정상 지급 완료되었습니다.</p>
                </div>
                <div className="text-[10px] space-y-2 text-slate-500 font-bold">
                  <div>담당 배정: <strong className="text-slate-800">{selectedReviewReport.assignedTo}</strong></div>
                  <div>행정 요지: <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1 font-semibold text-slate-600">{selectedReviewReport.resultMemo}</p></div>
                  {selectedReviewReport.resultImageUrl && (
                    <div>
                      <span>현장 조치 증빙 사진:</span>
                      <img src={selectedReviewReport.resultImageUrl} alt="조치사진" className="w-full h-32 object-cover rounded-xl mt-1 border border-slate-200" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Signature Editing form mode */
              <form onSubmit={handleResolveSubmit} className="space-y-4">
                {/* Assigned department */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 block">조치 담당 부서/담당자 명 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="예: 달성군 특별기후환경과 이주임"
                    className="w-full text-xs text-slate-700 border border-slate-100 focus:border-blue-500 rounded-2xl px-3.5 py-3 focus:outline-none placeholder-slate-300 font-semibold bg-slate-50/20"
                  />
                </div>

                {/* Response memo text */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 block">대국민 행정 조치 요약 서면 보고 <span className="text-rose-500">*</span></label>
                  <textarea
                    required
                    rows={3}
                    value={resultMemo}
                    onChange={(e) => setResultMemo(e.target.value)}
                    placeholder="시민에게 전송될 해결 경과 메모를 육하원칙 하에 기입해 주십시오. 예: 제보 주신 D구역 북서 보도블록 도로변 폐배터리를 구청 전용 수거 차량을 동원해 전량 수거 및 폐기 처리 조치하였습니다."
                    className="w-full text-xs text-slate-700 border border-slate-100 focus:border-blue-500 rounded-2xl p-3.5 focus:outline-none placeholder-slate-300 font-semibold leading-relaxed resize-none bg-slate-50/20"
                  />
                </div>

                {/* Resolution proof photo upload simulation */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 block">현장 조치 완료 증빙 이미지 첨부 (선택)</label>
                  {!outcomeImagePreview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-6 border border-dashed border-slate-200 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 cursor-pointer bg-slate-50/40"
                    >
                      <span className="text-xl">📸</span>
                      <span className="text-[10px] text-slate-600 font-bold">해결 완료 사진 찍기/첨부</span>
                    </button>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-100">
                      <img src={outcomeImagePreview} alt="Outcome Proof" className="w-full h-28 object-cover" />
                      <button
                        type="button"
                        onClick={() => setOutcomeImagePreview(null)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleOutcomeImageChange}
                    className="hidden"
                  />
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={isProcessingAction}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow transition-colors cursor-pointer"
                >
                  {isProcessingAction ? '결재 서인 업로드 및 포인트 마일리지 발행 중...' : '🖋️ 조치 해결 승인 서명'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
