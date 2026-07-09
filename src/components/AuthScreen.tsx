import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { login, signup, isLoading } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('대구광역시 달성군 유가읍');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleDemoLogin = async (demoEmail: string) => {
    setAuthError(null);
    try {
      await login(demoEmail, 'password123');
    } catch (err) {
      setAuthError('데모 계정 로그인 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password.trim()) {
      setAuthError('이메일과 비밀번호를 모두 입력해 주십시오.');
      return;
    }

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setAuthError('사용자 이름을 입력해 주십시오.');
          return;
        }
        await signup(email, password, name, region);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || '인증 처리에 실패했습니다. 입력값을 확인해 주세요.');
    }
  };

  const regionsList = [
    '대구광역시 달성군 유가읍',
    '대구광역시 달성군 현풍읍',
    '대구광역시 달성군 구지면',
    '대구광역시 달서구 신당동',
    '대구광역시 북구 복현동'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-100 selection:text-emerald-800 font-sans">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl">📸</div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">찰칵 (Chalkak)</h1>
          <p className="text-xs text-slate-400 font-medium">
            시민 참여형 실시간 위치 기반 환경·에너지 관제 및 제보 포털
          </p>
        </div>

        {/* Hackathon Demo Cards HUD (Crucial for Instant Judging Verification) */}
        <div className="bg-slate-950 text-white rounded-3xl p-4.5 shadow-md space-y-3">
          <div>
            <span className="text-[9px] font-extrabold text-emerald-400 tracking-wider">JUDGING QUICK PRESETS</span>
            <h3 className="text-xs font-black mt-0.5 text-slate-100">원클릭 데모 계정 간편 로그인</h3>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5 leading-normal">
              테스트를 원활하게 수행하실 수 있도록 미리 시딩된 데모 프로필 카드를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Citizen Preset */}
            <button
              onClick={() => handleDemoLogin('citizen@chalkak.com')}
              disabled={isLoading}
              className="bg-white/5 border border-white/10 hover:border-emerald-500 rounded-2xl p-2.5 text-center active:scale-95 transition-all cursor-pointer flex flex-col items-center gap-1"
            >
              <span className="text-lg">🌱</span>
              <span className="text-[10px] font-black text-emerald-400">일반 시민</span>
              <span className="text-[8px] text-slate-400 block mt-0.5">420 포인트 보유</span>
            </button>

            {/* Admin Preset */}
            <button
              onClick={() => handleDemoLogin('admin@chalkak.com')}
              disabled={isLoading}
              className="bg-white/5 border border-white/10 hover:border-blue-500 rounded-2xl p-2.5 text-center active:scale-95 transition-all cursor-pointer flex flex-col items-center gap-1"
            >
              <span className="text-lg">👷</span>
              <span className="text-[10px] font-black text-blue-400">행정 관리자</span>
              <span className="text-[8px] text-slate-400 block mt-0.5">관제 대시보드 권한</span>
            </button>

            {/* Troller Preset */}
            <button
              onClick={() => handleDemoLogin('troller@chalkak.com')}
              disabled={isLoading}
              className="bg-white/5 border border-white/10 hover:border-rose-500 rounded-2xl p-2.5 text-center active:scale-95 transition-all cursor-pointer flex flex-col items-center gap-1"
            >
              <span className="text-lg">⚠️</span>
              <span className="text-[10px] font-black text-rose-400">차단 트롤러</span>
              <span className="text-[8px] text-slate-400 block mt-0.5">허위 제보로 영구 차단됨</span>
            </button>
          </div>
        </div>

        {/* Manual Input Auth Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(true);
                setAuthError(null);
              }}
              className={`flex-1 text-center py-1.5 text-xs font-black transition-all ${
                isLoginMode ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'
              }`}
            >
              기존 계정 로그인
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(false);
                setAuthError(null);
              }}
              className={`flex-1 text-center py-1.5 text-xs font-black transition-all ${
                !isLoginMode ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'
              }`}
            >
              새로운 시민 가입
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold rounded-xl leading-normal">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Only Signup) */}
            {!isLoginMode && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block">이름 / 닉네임 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full text-xs text-slate-700 border border-slate-100 focus:border-emerald-500 rounded-2xl px-3.5 py-3 focus:outline-none placeholder-slate-300 font-semibold bg-slate-50/20"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 block">이메일 주소 <span className="text-rose-500">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@chalkak.com"
                className="w-full text-xs text-slate-700 border border-slate-100 focus:border-emerald-500 rounded-2xl px-3.5 py-3 focus:outline-none placeholder-slate-300 font-semibold bg-slate-50/20"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 block">비밀번호 <span className="text-rose-500">*</span></label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="●●●●●●"
                className="w-full text-xs text-slate-700 border border-slate-100 focus:border-emerald-500 rounded-2xl px-3.5 py-3 focus:outline-none placeholder-slate-300 font-semibold bg-slate-50/20"
              />
            </div>

            {/* Region Field (Only Signup) */}
            {!isLoginMode && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block">나의 거주 행정구역 선택 <span className="text-rose-500">*</span></label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full text-xs text-slate-700 border border-slate-100 focus:border-emerald-500 rounded-2xl px-3.5 py-3 focus:outline-none font-bold bg-slate-50/20"
                >
                  {regionsList.map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow transition-colors cursor-pointer"
            >
              {isLoading 
                ? '가치 인증 네트워크 연결 중...' 
                : isLoginMode 
                ? '시민 인증 로그인' 
                : '찰칵 포털 가입 신청'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
