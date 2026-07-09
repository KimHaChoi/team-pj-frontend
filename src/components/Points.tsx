import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import type { CouponRedemption } from '../types';

interface CouponItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: string;
  category: string;
}

export const Points: React.FC = () => {
  const { user, updateUserPoints } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'MARKET' | 'MY_COUPONS'>('MARKET');
  const [myRedemptions, setMyRedemptions] = useState<CouponRedemption[]>([]);
  const [feedbackMsg, setFeedbackMessage] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);
  const [activeBarcode, setActiveBarcode] = useState<{ code: string; name: string } | null>(null);

  const coupons: CouponItem[] = [
    {
      id: 'coupon_zeropay_5k',
      name: '대구시 탄소중립 제로페이 5,000원권',
      desc: '달성군 관내 가맹점 및 친환경 제휴 상점에서 즉시 결제 가능한 지자체 화폐',
      cost: 3000,
      icon: '💵',
      category: '상품권'
    },
    {
      id: 'coupon_tumbler',
      name: '마이 보틀 친환경 텀블러 에코 쿠폰',
      desc: '달성 에코 카페 본점에서 다회용 텀블러 무상 교환 및 환경 굿즈 할인권',
      cost: 2000,
      icon: '🍵',
      category: '환경굿즈'
    },
    {
      id: 'coupon_bike_1h',
      name: '공공 자전거 타랑께 1시간 무료 이용권',
      desc: '달성군 유가읍/현풍읍 스마트 자전거 거치대 스테이션 원격 락 전면 해제 패스',
      cost: 1000,
      icon: '🚲',
      category: '친환경교통'
    },
    {
      id: 'coupon_garbage_20l',
      name: '재활용 쓰레기 종량제 봉투 20L 10매',
      desc: '자원 순환 거점 동 행정복지센터 방문 시 즉시 무상 배부 교환 모바일 기프티콘',
      cost: 500,
      icon: '🗑️',
      category: '생활용품'
    }
  ];

  useEffect(() => {
    if (!user) return;
    const unsubscribe = dbService.listenUserRedemptions(user.uid, (data) => {
      setMyRedemptions(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleRedeem = async (coupon: CouponItem) => {
    if (!user) {
      setFeedbackMessage({ type: 'ERROR', text: '쿠폰을 구매하려면 로그인이 필수적입니다.' });
      return;
    }

    if (user.points < coupon.cost) {
      setFeedbackMessage({ type: 'ERROR', text: '보유하신 에너지 마일리지가 부족합니다. 더 많은 가치 제보 활동에 동참해 주세요.' });
      return;
    }

    try {
      await dbService.redeemCoupon(user.uid, coupon.name, coupon.cost);
      
      // Update local context profile points (deduct coupon cost)
      await updateUserPoints(user.uid, -coupon.cost);
      
      setFeedbackMessage({ type: 'SUCCESS', text: `축하합니다! '${coupon.name}' 교환이 완료되었습니다. 나의 쿠폰함에서 바코드를 사용하세요!` });

      // Clear success feedback after 5 seconds
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 5000);

    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'ERROR', text: '쿠폰 구매 처리 중 트랜잭션 통신 오류가 발생했습니다.' });
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-5 pb-24 md:pb-8 space-y-5 animate-fadeIn">
      {/* Header HUD */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <span>💚 마일리지 포인트숍</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            환경 보호에 이바지한 기여 포인트로 실용적인 공공 서비스 혜택을 구매해 사용해 보세요!
          </p>
        </div>
      </div>

      {/* Balance HUD Card */}
      {user && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-inner flex justify-between items-center">
          <div>
            <span className="text-[10px] text-emerald-400 font-extrabold block">MY MILEAGE BALANCE</span>
            <span className="text-xl font-black mt-1 block">{user.name} 시민님</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">사용 가능 포인트</span>
            <span className="text-2xl font-black text-emerald-400">{user.points} P</span>
          </div>
        </div>
      )}

      {/* Menu Subtabs */}
      <div className="bg-slate-50 border border-slate-100 p-1 rounded-2xl flex">
        <button
          onClick={() => {
            setActiveSubTab('MARKET');
            setFeedbackMessage(null);
          }}
          className={`flex-1 py-2.5 text-[10px] font-extrabold rounded-xl text-center cursor-pointer transition-all ${
            activeSubTab === 'MARKET'
              ? 'bg-white border border-slate-100/50 shadow-sm text-emerald-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          🎁 상품 교환소
        </button>
        <button
          onClick={() => {
            setActiveSubTab('MY_COUPONS');
            setFeedbackMessage(null);
          }}
          className={`flex-1 py-2.5 text-[10px] font-extrabold rounded-xl text-center cursor-pointer transition-all relative ${
            activeSubTab === 'MY_COUPONS'
              ? 'bg-white border border-slate-100/50 shadow-sm text-emerald-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          🎫 나의 쿠폰함
          {myRedemptions.length > 0 && (
            <span className="absolute top-2 right-4 bg-emerald-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
              {myRedemptions.length}
            </span>
          )}
        </button>
      </div>

      {/* Transaction Notifications */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-2xl border text-xs font-bold leading-normal animate-slideDown ${
          feedbackMsg.type === 'SUCCESS'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          {feedbackMsg.type === 'SUCCESS' ? '✅' : '⚠️'} {feedbackMsg.text}
        </div>
      )}

      {/* Subtab Contents 1: Marketplace */}
      {activeSubTab === 'MARKET' ? (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const isAffordable = user ? user.points >= coupon.cost : false;
            return (
              <div 
                key={coupon.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex gap-4 items-center hover:shadow-md transition-shadow"
              >
                {/* Coupon Icon Circle */}
                <div className="w-14 h-14 bg-slate-50 border border-slate-100/40 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {coupon.icon}
                </div>

                {/* Coupon Descriptions */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded inline-block">
                    {coupon.category}
                  </span>
                  <h4 className="text-xs font-black text-slate-800 mt-1 truncate">
                    {coupon.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold line-clamp-2">
                    {coupon.desc}
                  </p>
                </div>

                {/* Redeem Trigger Area */}
                <div className="text-right flex-shrink-0 flex flex-col gap-1.5 items-end">
                  <span className="text-sm font-black text-slate-700 block">
                    {coupon.cost} P
                  </span>
                  <button
                    onClick={() => handleRedeem(coupon)}
                    className={`text-[9px] font-black py-1.5 px-3 rounded-xl shadow-sm transition-all cursor-pointer ${
                      isAffordable
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    교환하기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Subtab Contents 2: My Coupons */
        <div className="space-y-3">
          {myRedemptions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center space-y-3">
              <span className="text-3xl block">🎫</span>
              <h4 className="text-xs font-bold text-slate-700">보유하신 모바일 쿠폰이 없습니다.</h4>
              <p className="text-[10px] text-slate-400 font-medium">
                환경 포인트를 획득하여 맛있는 에코 음료나 대구 제로페이 할인권으로 전송해 보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              {myRedemptions.map((redem) => {
                return (
                  <div 
                    key={redem.id}
                    onClick={() => setActiveBarcode({ code: redem.id, name: redem.couponName })}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex justify-between items-center cursor-pointer hover:border-emerald-300 transition-all active:scale-[0.99]"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block font-mono">
                        Acquired: {new Date(redem.createdAt).toLocaleDateString()}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 mt-1">
                        {redem.couponName}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1">
                        📍 유효기간: 발급일로부터 180일 (스캔하여 사용 가능)
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-xl">📱</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold hover:underline">
                        바코드 보기
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interactive Floating Barcode scanner Card Modal */}
      {activeBarcode && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveBarcode(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 animate-scaleUp shadow-2xl relative border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveBarcode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-[9px] font-extrabold tracking-wider text-emerald-600 block">CHALKAK ENVIRONMENT REDEMPTION</span>
              <h3 className="text-base font-black text-slate-800 mt-1 leading-snug">
                {activeBarcode.name}
              </h3>
            </div>

            {/* Generated Barcode simulation */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3.5">
              {/* Simulated barcode bars */}
              <div className="flex justify-center items-stretch h-14 gap-0.5 bg-white p-3 rounded-xl border border-slate-200/50">
                <div className="w-1 bg-black" />
                <div className="w-0.5 bg-black" />
                <div className="w-2 bg-transparent" />
                <div className="w-1 bg-black" />
                <div className="w-0.5 bg-black" />
                <div className="w-1 bg-black" />
                <div className="w-2.5 bg-black" />
                <div className="w-1.5 bg-transparent" />
                <div className="w-1 bg-black" />
                <div className="w-1 bg-black" />
                <div className="w-2 bg-black" />
                <div className="w-0.5 bg-black" />
                <div className="w-2.5 bg-black" />
                <div className="w-1 bg-transparent" />
                <div className="w-1.5 bg-black" />
                <div className="w-0.5 bg-black" />
                <div className="w-2.5 bg-black" />
              </div>
              <span className="block text-[11px] font-bold font-mono text-slate-600 tracking-wider">
                {activeBarcode.code.replace('redem_', 'CH-').substring(0, 16).toUpperCase()}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 font-medium leading-normal">
              본 쿠폰은 일회용 모바일 바코드 쿠폰이며, 제휴 가맹점 또는 달성군 에너지센터 행정 데스크에 본 바코드를 제시하여 무상 교환할 수 있습니다.
            </div>

            <button
              onClick={() => setActiveBarcode(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-2xl shadow transition-colors cursor-pointer"
            >
              화면 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
