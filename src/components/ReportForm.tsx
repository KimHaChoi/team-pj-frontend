import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import type { Report } from '../types';

interface ReportFormProps {
  onSuccessRedirect: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccessRedirect }) => {
  const { user } = useAuth();

  // Form states
  const [category, setCategory] = useState<Report['category']>('ENERGY_WASTE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // GPS states
  const [lat, setLat] = useState<number>(35.8342); // Default to Daegu Technopolis region
  const [lng, setLng] = useState<number>(128.4567);
  const [address, setAddress] = useState<string>('대구광역시 달성군 유가읍 테크노상업로');
  const [gpsStatus, setGpsStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  // UI / AI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    score: number;
    isMeaningful: boolean;
    reason: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto GPS Retrieval on component mount
  useEffect(() => {
    retrieveGPS();
  }, []);

  const retrieveGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('ERROR');
      return;
    }

    setGpsStatus('LOADING');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLng(longitude);
        setGpsStatus('SUCCESS');

        // Simple geocode mock based on approximate coordinates
        if (Math.abs(latitude - 35.8342) < 0.1) {
          setAddress('대구광역시 달성군 유가읍 현풍로 인근');
        } else {
          setAddress(`위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)} 현장 부근`);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        setGpsStatus('ERROR');
        // Keep default coordinates
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Image upload handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('이미지 용량이 초과되었습니다 (최대 4MB까지 가능).');
      return;
    }

    setImageFile(file);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Main Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrorMessage('신고를 작성하려면 로그인이 필요합니다.');
      return;
    }

    if (user.blocked) {
      setErrorMessage('허위 신고 누적으로 인해 계정이 차단되어 신고 작성이 불가능합니다.');
      return;
    }

    if (!imageFile) {
      setErrorMessage('현장 확인 및 검증을 위한 사진 증빙 첨부가 필수적입니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Auto title generation if title is empty
    const categoryLabels: Record<Report['category'], string> = {
      ENERGY_WASTE: '에너지 낭비 사각지대',
      POLLUTION: '환경오염 정황 제보',
      ILLEGAL_DUMPING: '불법 투기 정황 제보',
      NOISE: '소음/진동 피해 민원',
      ETC: '환경 에너지 기타 건의'
    };
    const finalTitle = title.trim() || `${address} ${categoryLabels[category]} 신고`;

    try {
      const savedReport = await dbService.addReport({
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        category,
        title: finalTitle,
        description: description.trim(),
        lat,
        lng,
        address,
        imageUrl: '' // will be updated inside dbService
      }, imageFile);

      // Display AI analysis outcome modal
      setAiResult({
        score: savedReport.aiScore,
        isMeaningful: savedReport.isMeaningful,
        reason: savedReport.aiReason,
        riskLevel: savedReport.aiScore > 70 ? 'HIGH' : savedReport.aiScore > 30 ? 'MEDIUM' : 'LOW'
      });

    } catch (err: any) {
      console.error(err);
      setErrorMessage('신고 등록 중 네트워크 또는 시스템 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categories definition
  const categoriesList: { id: Report['category']; label: string; icon: string; desc: string; color: string }[] = [
    {
      id: 'ENERGY_WASTE',
      label: '에너지 낭비',
      icon: '💡',
      desc: '대낮 가로등 켜짐, 공공 에어컨 낭비',
      color: 'border-amber-200 bg-amber-50/40 text-amber-800'
    },
    {
      id: 'POLLUTION',
      label: '환경 오염',
      icon: '🏭',
      desc: '공장 매연 배출, 하천 폐수, 유독 물질',
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
    },
    {
      id: 'ILLEGAL_DUMPING',
      label: '무단 투기',
      icon: '🗑️',
      desc: '산업 폐기물, 가전제품 야외 무단 방출',
      color: 'border-blue-200 bg-blue-50/40 text-blue-800'
    },
    {
      id: 'NOISE',
      label: '심각한 소음',
      icon: '🔊',
      desc: '야간 공사장 진동, 심야 생활 확성 소음',
      color: 'border-indigo-200 bg-indigo-50/40 text-indigo-800'
    },
    {
      id: 'ETC',
      label: '기타 민원',
      icon: '⚙️',
      desc: '그 외 공공시설 파손 및 도시 환경 저해',
      color: 'border-slate-200 bg-slate-50/40 text-slate-800'
    }
  ];

  if (user?.blocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-3xl mb-4">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-slate-800">계정 차단 안내</h3>
          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
            귀하의 계정은 지속적인 **허위 장난성 신고 누적**으로 인하여 영구 정지되었습니다. <br />
            해당 사항에 대해 이의 제기가 필요하신 경우 지자체 에너지 환경 관제소로 유선 연락 주시기 바랍니다.
          </p>
          <div className="mt-6 text-[11px] font-semibold text-rose-700 bg-rose-100/50 py-2 px-4 rounded-xl inline-block">
            누적 허위 감지 건수: {user.falseReportCount}회 / 5회 최대
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span>📸 찰칵 간편 신고</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          사진과 위치만으로 간편하게 제보하세요. AI가 시급성을 평가해 관리자에게 실시간 전송합니다.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-5">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-2xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Select Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">신고 분류 선택 <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-1 gap-2">
              {categoriesList.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-800">{cat.label}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{cat.desc}</span>
                    </div>
                    {isSelected && (
                      <span className="ml-auto text-emerald-600 font-extrabold text-sm">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Attachment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">현장 사진 증빙 <span className="text-rose-500">*</span></label>
            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-3xl flex flex-col items-center justify-center gap-1.5 bg-slate-50/40 text-slate-400 cursor-pointer transition-all"
              >
                <span className="text-3xl">📷</span>
                <span className="text-xs text-slate-600 font-bold">이곳을 터치해 현장 사진 찍기/첨부</span>
                <span className="text-[10px] text-slate-400">최대 4MB 이내 이미지 파일만 허용</span>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100">
                <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-3.5 right-3.5 bg-black/60 hover:bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs backdrop-blur-sm shadow transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Location & GPS Panel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500">위치 자동 매핑 결과</label>
              <button
                type="button"
                onClick={retrieveGPS}
                className="text-[10px] text-emerald-600 hover:underline font-bold"
              >
                🔄 다시 조회
              </button>
            </div>
            
            <div className="p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">📍</span>
                <span className="text-xs font-bold text-slate-700 leading-tight">
                  {address}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                <span>위경도: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
                {gpsStatus === 'SUCCESS' && (
                  <span className="text-emerald-600 font-bold">● GPS 자동 매핑 완료</span>
                )}
                {gpsStatus === 'LOADING' && (
                  <span className="text-amber-500 font-bold animate-pulse">● 위치 탐색 중...</span>
                )}
                {gpsStatus === 'ERROR' && (
                  <span className="text-rose-500 font-bold">● GPS 사용 불가 (임의 지정됨)</span>
                )}
              </div>
            </div>
          </div>

          {/* Simple optional Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">간략 설명 (선택 사항)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 가로등이 낮 시간에도 계속 점등되어 엄청나게 에너지가 낭비되고 있습니다. 조속히 원격 제어로 전원을 꺼 주세요!"
              rows={3}
              maxLength={200}
              className="w-full text-xs text-slate-700 border border-slate-100 focus:border-emerald-500 rounded-2xl p-3.5 focus:outline-none placeholder-slate-300 resize-none font-medium leading-relaxed bg-slate-50/20"
            />
          </div>

          {/* Optional custom title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">신고 제목 (선택 사항)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 미기재 시 자동으로 관할 구소-카테고리로 지정됩니다"
              maxLength={40}
              className="w-full text-xs text-slate-700 border border-slate-100 focus:border-emerald-500 rounded-2xl px-3.5 py-3 focus:outline-none placeholder-slate-300 font-medium bg-slate-50/20"
            />
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? '🤖 AI가 민원의 정황을 정밀 가치 평가 중...' : '📥 찰칵 신고 접수'}
          </button>
        </form>
      </div>

      {/* AI Analysis Result Feedback Modal */}
      {aiResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 animate-scaleUp shadow-2xl">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-3xl ${
              aiResult.isMeaningful ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {aiResult.isMeaningful ? '🌱' : '⚠️'}
            </div>

            <div>
              <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">AI ANALYSIS COMPLETED</span>
              <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                {aiResult.isMeaningful ? '신고 가치 분석 결과' : '이상 무의미 신고 경고'}
              </h3>
            </div>

            {aiResult.isMeaningful ? (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                <span className="text-[10px] text-emerald-600 font-bold block">AI 시급성 / 중요도 점수</span>
                <span className="text-3xl font-black text-emerald-600 block">{aiResult.score}P</span>
                <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                  지자체 관리자의 민원 해결 처리가 완료되는 즉시, <br />
                  귀하의 계정으로 <strong className="text-emerald-600">{aiResult.score}포인트</strong>가 지급됩니다.
                </span>
              </div>
            ) : (
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1">
                <span className="text-[10px] text-rose-600 font-bold block">무의미 신고 판독 완료</span>
                <span className="text-xl font-bold text-rose-600 block">장난성/스팸 의심</span>
                <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                  본 민원은 무의미하거나 관련 사진 증빙이 상이한 신고로 AI가 판단하여 **포인트 미지급** 대상 및 **반려** 처리됩니다. <br />
                  장난 신고 반복 시 영구 정지될 수 있습니다.
                </span>
              </div>
            )}

            <div className="space-y-1.5 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-extrabold text-slate-400 block">AI 판독 세부 근거</span>
              <p className="text-[10px] font-semibold text-slate-500 leading-normal">
                {aiResult.reason}
              </p>
            </div>

            <button
              onClick={() => {
                setAiResult(null);
                onSuccessRedirect(); // Redirect to My Reports
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-2xl shadow transition-colors cursor-pointer"
            >
              확인 및 보관함 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
