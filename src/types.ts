export interface User {
  uid: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  region: string;
  points: number;
  blocked: boolean;
  falseReportCount: number;
  createdAt: string;
}

export interface Report {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: "ENERGY_WASTE" | "POLLUTION" | "ILLEGAL_DUMPING" | "NOISE" | "ETC";
  title: string;
  description?: string;
  imageUrl: string;
  lat: number;
  lng: number;
  address?: string;
  status: "RECEIVED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  aiScore: number; // 0 to 100
  aiReason: string;
  isMeaningful: boolean;
  assignedTo?: string; // 현장 단속반 이름
  resultImageUrl?: string; // 조치 결과 이미지 URL
  resultMemo?: string; // 조치 결과 메모
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  type: "thermal" | "solar" | "wind" | "factory" | "residential" | "streetlight" | "public";
  status: "ON" | "OFF" | "점검 중";
  region: "A구역" | "B구역" | "C구역" | "D구역" | "E구역";
  energyConsumption: number; // kW
  alertNeeded: boolean; // 특정 구역 가로등 고장 신고가 많이 발생할 시 true
  location?: string;
  energyProduction?: number;
  carbonSaved?: number;
  isAging?: boolean;
}

export interface CouponRedemption {
  id: string;
  userId: string;
  couponName: string;
  cost: number;
  createdAt: string;
}

export type TabType = 'map' | 'reportForm' | 'myReports' | 'ranking' | 'points' | 'profile' | 'admin' | 'adminDashboard' | 'adminReports' | 'adminFacilities' | 'adminUsers';
