import React, { useState, useRef } from 'react';
import { useEcoCity } from '../context/EcoCityContext';
import type { Report } from '../types';
import { Camera, Send, ShieldAlert, CheckCircle, X, FileText, Info } from 'lucide-react';

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
      setErrorMessage('이미지 용량이 초과되었습니다 (최대 3MB까지 첨부 가능).');
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
      setErrorMessage('민원 서식의 제목과 상세 내용을 빠짐없이 기재해주십시오.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitReport(title, type, location, description, imageFile);
      
      // Success feedback
      setSuccessMessage('귀하께서 제보하신 민원 사항이 행정 시스템에 정식 접수되었습니다. 실시간 지도 관제 및 행정 패널에 즉시 공유됩니다.');
      
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
      setErrorMessage('신고 접수 중 통신 상의 오류가 발생했습니다. 잠시 후 다시 시도해주십시오.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
      
      {/* 1. 운영 서식 제목 */}
      <div className="border-b-2 border-[#003366] pb-4">
        <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#0284c7] uppercase leading-none">
          CIVIC REPORT REGISTRATION
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-1 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#003366]" />
          <span>시민 환경·에너지 민원 신고서 작성</span>
        </h2>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">
          지방자치단체 특별 규정에 의거하여, 복원 구역 내 탄소 배출 유해 시설, 비효율 전력 소모, 매연, 불법 산업 쓰레기 무단 투기 등의 환경 저해 현상을 고발 및 제보하는 공식 민원 서식입니다.
        </p>
      </div>

      {/* 2. 행정 신고 주의사항 배너 */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-[11px] font-bold text-amber-800 leading-relaxed">
        <Info className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <span>
          주의사항: 허위 제보 또는 타인의 명예를 실추시키는 거짓 신고의 경우 정보통신망법에 의거하여 반려 또는 행정 불이익을 받을 수 있으므로, 반드시 현장 사진 등 실증 증빙 자료를 함께 첨부해 주시기 바랍니다.
        </span>
      </div>

      {/* 3. 메인 민원 서식 폼 */}
      <div className="portal-card p-6 sm:p-8 bg-white">
        
        {/* Feedback Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-start gap-2.5 animate-slideDown shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="leading-relaxed">
              <span className="block text-sm font-extrabold">🎉 민원 정식 접수 완료</span>
              <span className="block mt-1 font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2.5 animate-slideDown shadow-sm">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="block text-sm font-extrabold">⚠️ 민원 기재 불충분</span>
              <span className="block mt-1 font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 민원 제목 */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-bold text-slate-500 font-sans uppercase tracking-wide">
              민원 신고 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: C구역 행정청 사거리 남서측 보도블록 도로변 폐배터리 방치"
              maxLength={50}
              className="w-full rounded bg-white border border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/20 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
            />
          </div>

          {/* 분류 및 위치 선택 (공공 격자 서식) */}
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* 민원 유형 */}
            <div className="space-y-1.5">
              <label htmlFor="type" className="block text-xs font-bold text-slate-500 font-sans uppercase tracking-wide">
                민원 분류 <span className="text-rose-500">*</span>
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as Report['type'])}
                className="w-full rounded bg-white border border-slate-300 focus:border-[#003366] px-3 py-2.5 text-xs text-slate-700 focus:outline-none transition-all font-bold"
              >
                <option value="환경오염">🌿 환경오염 (공장 매연 배출, 불법 폐수 방류 등)</option>
                <option value="에너지 낭비">⚡ 에너지 낭비 (대낮 가로등 점등, 과소비 방치 등)</option>
                <option value="시설 고장">⚙️ 시설 고장 (태양광 인버터 오작동, 전선 파손 등)</option>
                <option value="쓰레기 문제">🗑️ 쓰레기 문제 (가전 수거 불이행, 산업 폐기물 투기 등)</option>
                <option value="기타">❓ 기타 행정 개선 건의</option>
              </select>
            </div>

            {/* 발생 구역 */}
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-xs font-bold text-slate-500 font-sans uppercase tracking-wide">
                발생 관할 구역 <span className="text-rose-500">*</span>
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value as Report['location'])}
                className="w-full rounded bg-white border border-slate-300 focus:border-[#003366] px-3 py-2.5 text-xs text-slate-700 focus:outline-none transition-all font-bold"
              >
                <option value="A구역">🧭 A구역 (북서부 고업 산업 단지 지구)</option>
                <option value="B구역">🧭 B구역 (북동부 무공해 발전 시설 단지)</option>
                <option value="C구역">🧭 C구역 (중앙 생태공원 및 지자체 관공서)</option>
                <option value="D구역">🧭 D구역 (남동부 고층 주거 주택 복합 단지)</option>
                <option value="E구역">🧭 E구역 (남서부 농경 및 외곽 전력 중계망)</option>
              </select>
            </div>

          </div>

          {/* 민원 상세 요지 */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-bold text-slate-500 font-sans uppercase tracking-wide">
              민원 신고 상세 요지 <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="구체적인 민원 발생 정황, 해당 시간대, 피해 상황 등을 육하원칙에 맞게 상세히 기록해 주시면 행정청 담당관 배정 및 수립 조치가 대폭 신속해집니다."
              maxLength={400}
              className="w-full rounded bg-white border border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/20 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold leading-relaxed resize-none"
            />
          </div>

          {/* 사진 증빙 첨부 대장 */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-500 font-sans uppercase tracking-wide">
              현장 증빙 실증 이미지 첨부
            </span>
            
            <div className="flex flex-col items-center justify-center">
              {!imagePreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-7 rounded border-2 border-dashed border-slate-300 hover:border-[#0284c7] bg-slate-50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer font-bold"
                >
                  <Camera className="w-7 h-7 text-slate-400 stroke-[1.8]" />
                  <span className="text-xs text-slate-600 font-bold">이곳을 클릭하여 제보 사진 수동 첨부</span>
                  <span className="text-[10px] text-slate-400 font-semibold">형식: JPG, PNG, WEBP (지자체 전산 용량 제약상 최대 3MB 파일만 가능)</span>
                </button>
              ) : (
                <div className="relative w-full rounded border border-slate-300 bg-slate-50 p-2 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="max-h-60 object-contain rounded border border-slate-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-rose-600 border border-slate-300 text-slate-700 hover:text-white transition-colors shadow"
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

          {/* 접수 및 전송 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded bg-[#003366] hover:bg-[#0a3054] px-4 py-3.5 text-xs font-bold text-white shadow active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>민원 정보 정부 전송망 업로드 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>공식 민원 정보 접수 및 업로드</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
