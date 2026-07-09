import React, { useState, useRef } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import type { Report } from '../types';
import { Camera, Send, ShieldAlert, Sparkles, X } from 'lucide-react';

export const ReportForm: React.FC = () => {
  const { submitReport } = useEcoCity();

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Report['type']>('환경오염');
  const [location, setLocation] = useState<Report['location']>('A구역');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload and FileReader preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 3MB for localStorage safety)
    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('이미지 용량이 너무 큽니다 (최대 3MB까지 가능).');
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

  // Submit report to centralized state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setErrorMessage('제목과 상세 내용을 모두 입력해주십시오.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitReport(title, type, location, description, imageFile);
      
      // Success feedback
      setSuccessMessage('시민 제보가 정상적으로 수신되었습니다. 1초 내에 관리자 관제판 및 실시간 격자 지도에 반영됩니다!');
      
      // Reset form
      setTitle('');
      setType('환경오염');
      setLocation('A구역');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);

    } catch (err: any) {
      console.error(err);
      setErrorMessage('신고 제출 과정에서 문제가 발생했습니다. 네트워크 상태를 확인해주십시오.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          시민 환경 민원 신고처
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
          탄소 과다 배출, 에너지 낭비, 불법 폐기 등 도시 복원 및 재건축 구역 내 발견된 모든 유해 환경 요소를 사진과 함께 제보해주시면, 실시간 행정 처리 지도가 업데이트됩니다.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 sm:p-8 backdrop-blur-md shadow-sm relative overflow-hidden">
        <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/5 filter blur-3xl" />

        {/* Feedback Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold flex items-start gap-2.5 animate-slideDown shadow-sm">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="leading-relaxed">
              <span className="block font-bold">🎉 제보 성공!</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-start gap-2.5 animate-slideDown shadow-sm">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">⚠️ 경고</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title Input */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-bold text-slate-400 font-mono uppercase tracking-wide">
              신고 제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 공원 북측 야산 길목 폐목재 더미 투기 발견"
              maxLength={50}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-semibold"
            />
          </div>

          {/* District & Category Row */}
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="type" className="block text-xs font-bold text-slate-400 font-mono uppercase tracking-wide">
                신고 유형 선택
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as Report['type'])}
                className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-3 text-xs text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
              >
                <option value="환경오염">🌿 환경오염 (매연, 폐수 등)</option>
                <option value="에너지 낭비">⚡ 에너지 낭비 (상시 조명 등)</option>
                <option value="시설 고장">⚙️ 시설 고장 (센서 결함 등)</option>
                <option value="쓰레기 문제">🗑️ 쓰레기 문제 (무단 투기 등)</option>
                <option value="기타">❓ 기타</option>
              </select>
            </div>

            {/* Location Select */}
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-xs font-bold text-slate-400 font-mono uppercase tracking-wide">
                신고 위치 선택
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value as Report['location'])}
                className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-3 text-xs text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
              >
                <option value="A구역">🧭 A구역 (북서부 공업지대)</option>
                <option value="B구역">🧭 B구역 (북동부 신재생 발전단지)</option>
                <option value="C구역">🧭 C구역 (중앙 삼림 및 관공서)</option>
                <option value="D구역">🧭 D구역 (남동부 주거복합 단지)</option>
                <option value="E구역">🧭 E구역 (남서부 외곽 전력 유통망)</option>
              </select>
            </div>

          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-bold text-slate-400 font-mono uppercase tracking-wide">
              상세 내용 설명
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="구체적인 상황을 기술해주십시오. (예: 어떤 가로등이 밤낮없이 켜져 있는지, 공장에서 검은 유독 연기가 몇 시부터 분출 중인지 등)"
              maxLength={400}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-semibold leading-relaxed resize-none"
            />
          </div>

          {/* Photo File upload UI with local preview */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-400 font-mono uppercase tracking-wide">
              현장 증빙 사진 첨부
            </span>
            
            <div className="flex flex-col items-center justify-center">
              {!imagePreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer font-bold"
                >
                  <Camera className="w-8 h-8 stroke-[1.5]" />
                  <span className="text-xs">이곳을 클릭하여 사진 업로드</span>
                  <span className="text-[10px] font-semibold text-slate-400">지원 형식: JPG, PNG, WEBP (최대 3MB)</span>
                </button>
              ) : (
                <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="max-h-64 object-contain rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-rose-500 border border-slate-200 text-slate-600 hover:text-white transition-colors shadow"
                  >
                    <X className="w-4 h-4" />
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
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3.5 text-xs font-bold text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/15 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>접수 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>위해 요인 제보하기 (전송)</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
