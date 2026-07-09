import { db, storage, isFirebaseActive } from '../firebase';
import type { Facility, Report, User, CouponRedemption } from '../types';
import { aiService } from './aiService';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ----------------------------------------------------
// 1. Initial Seeding Data
// ----------------------------------------------------
export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'fac-1',
    name: '중구 1구역 스마트 가로등',
    type: 'streetlight',
    status: 'ON',
    region: 'A구역',
    energyConsumption: 120, // kW
    alertNeeded: false
  },
  {
    id: 'fac-2',
    name: '동구 2구역 스마트 가로등',
    type: 'streetlight',
    status: 'OFF',
    region: 'B구역',
    energyConsumption: 0, // kW
    alertNeeded: false
  },
  {
    id: 'fac-3',
    name: '북구 3구역 공원 조명망',
    type: 'streetlight',
    status: 'ON',
    region: 'C구역',
    energyConsumption: 85, // kW
    alertNeeded: false
  },
  {
    id: 'fac-4',
    name: '비슬 친환경 태양광 발전소',
    type: 'solar',
    status: 'ON',
    region: 'D구역',
    energyConsumption: 15, // kW
    alertNeeded: false
  },
  {
    id: 'fac-5',
    name: '현풍 스마트 융합 에너지 센터',
    type: 'public',
    status: 'ON',
    region: 'E구역',
    energyConsumption: 320, // kW
    alertNeeded: false
  },
  {
    id: 'fac-6',
    name: '달성 테크노 산업 공장 배출망',
    type: 'factory',
    status: '점검 중',
    region: 'A구역',
    energyConsumption: 1500, // kW
    alertNeeded: false
  },
  {
    id: 'fac-7',
    name: '현풍 에코 레지던셜 타운',
    type: 'residential',
    status: 'ON',
    region: 'D구역',
    energyConsumption: 650, // kW
    alertNeeded: false
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    userId: 'user-citizen',
    userName: '김대구',
    userEmail: 'citizen@chalkak.com',
    category: 'POLLUTION',
    title: '테크노폴리스 중공업 공장 밤시간대 짙은 검은 연기 무단 배출',
    description: '야간 새벽 시간대에 산업 공장 굴뚝에서 필터를 거치지 않은 듯한 짙고 매캐한 검은 연기가 지속적으로 배출되고 있어 인근 아파트 단지까지 탄 냄새가 진동합니다. 즉각 정밀 진단과 대기 오염 측정이 필요합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80',
    lat: 35.8342,
    lng: 128.4567,
    address: '대구시 달성군 유가읍 테크노순환로 12길',
    status: 'RECEIVED',
    aiScore: 88,
    aiReason: '산업 단지 야간 무단 오염원 배출 건으로 대기 확산성과 호흡기 위해도가 매우 높아 즉각 현장 단속 투입이 추천됩니다.',
    isMeaningful: true,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'rep-2',
    userId: 'user-citizen',
    userName: '김대구',
    userEmail: 'citizen@chalkak.com',
    category: 'ENERGY_WASTE',
    title: '대낮 스마트 가로등 상시 켜짐 오작동',
    description: '맑은 대낮 오후 12시임에도 가로등 감지 센서 오작동인지 중구 1구역 스마트 가로등 수십 개가 꺼지지 않고 상시 가동 중입니다. 심각한 대낮 전력 낭비이니 점검 및 리셋 부탁드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    lat: 35.8452,
    lng: 128.4412,
    address: '대구시 달성군 현풍읍 현풍로 88',
    status: 'IN_PROGRESS',
    aiScore: 82,
    aiReason: '대낮 야외 광량 충족 상태에서의 조명 미소등 오작동 건으로 전력 낭비량이 크며, 원격 가상 제어를 통한 전원 오프 및 수리가 타당합니다.',
    isMeaningful: true,
    assignedTo: '중구 에너지 관리 기동대',
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(), // 10 hours ago
    updatedAt: new Date(Date.now() - 8 * 3600000).toISOString()
  },
  {
    id: 'rep-3',
    userId: 'user-bad',
    userName: '장난꾼',
    userEmail: 'troller@chalkak.com',
    category: 'ETC',
    title: '테스트용 신고',
    description: 'asdfㅁㄴㅇㄹ',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    lat: 35.8512,
    lng: 128.4312,
    address: '대구시 달성군 논공읍',
    status: 'REJECTED',
    aiScore: 12,
    aiReason: '의미 없는 텍스트 입력 및 장난성 신고(asdf, 무지성 타자)로 판명되어 반려 조치되었으며 허위 기록 1회가 가산되었습니다.',
    isMeaningful: false,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 24 hours ago
    updatedAt: new Date(Date.now() - 23 * 3600000).toISOString()
  },
  {
    id: 'rep-4',
    userId: 'user-citizen',
    userName: '김대구',
    userEmail: 'citizen@chalkak.com',
    category: 'ILLEGAL_DUMPING',
    title: '초등학교 뒤 야산 초입 폐드럼통 및 화학 수거 통 불법 방치',
    description: '어린이 보호 구역 및 야산 입구 인근에 정체불명의 폐드럼통 20여 개와 페인트 찌꺼기 통들이 무단으로 투기되어 있습니다. 일부 침출수가 흙바닥에 흐르는 것 같아 비 오면 수질 오염이 심각할 것 같습니다.',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    lat: 35.8291,
    lng: 128.4612,
    address: '대구시 달성군 유가읍 유가로 3길',
    status: 'RESOLVED',
    aiScore: 92,
    aiReason: '어린이 위행 위협 및 2차 수질/토양 오염을 동반하는 유독 화학 성분 폐기물 불법 야외 투기 건으로 최고 등급의 시급성이 보입니다.',
    isMeaningful: true,
    assignedTo: '달성 환경 정비 특별기동반',
    resultMemo: '현장 긴급 출동 완료하여 무단 불법 폐드럼통 22개 전량 안전 수거 완료하였습니다. 인근 CCTV를 확인하여 불법 투기 트럭 수배 및 과태료 부과 절차에 착수했습니다.',
    resultImageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(), // 36 hours ago
    updatedAt: new Date(Date.now() - 30 * 3600000).toISOString()
  }
];

// ----------------------------------------------------
// 2. Helper Functions (LocalStorage)
// ----------------------------------------------------
const getLocalStorageData = <T>(key: string, initialData: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data) as T;
};

const setLocalStorageData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ----------------------------------------------------
// 3. Main Database Services
// ----------------------------------------------------
export const dbService = {
  /**
   * Seed Firestore or LocalStorage database if empty
   */
  async seedIfNeeded(): Promise<void> {
    if (!isFirebaseActive) {
      if (!localStorage.getItem('chalkak_facilities')) {
        setLocalStorageData('chalkak_facilities', INITIAL_FACILITIES);
      }
      if (!localStorage.getItem('chalkak_reports')) {
        setLocalStorageData('chalkak_reports', INITIAL_REPORTS);
      }
      if (!localStorage.getItem('chalkak_redemptions')) {
        setLocalStorageData('chalkak_redemptions', [] as CouponRedemption[]);
      }
      return;
    }

    try {
      const facRef = collection(db, 'facilities');
      const repRef = collection(db, 'reports');

      const facSnap = await getDocs(facRef);
      if (facSnap.empty) {
        console.log('Seeding initial Chalkak facilities to Firestore...');
        const batch = writeBatch(db);
        INITIAL_FACILITIES.forEach((fac) => {
          const docRef = doc(facRef, fac.id);
          batch.set(docRef, fac);
        });
        await batch.commit();
      }

      const repSnap = await getDocs(repRef);
      if (repSnap.empty) {
        console.log('Seeding initial Chalkak reports to Firestore...');
        const batch = writeBatch(db);
        INITIAL_REPORTS.forEach((rep) => {
          const docRef = doc(repRef, rep.id);
          batch.set(docRef, rep);
        });
        await batch.commit();
      }
    } catch (e) {
      console.error('Database seeding error:', e);
    }
  },

  /**
   * Listen to real-time changes of facilities
   */
  listenFacilities(callback: (facilities: Facility[]) => void): () => void {
    if (!isFirebaseActive) {
      const getLocal = () => {
        const data = getLocalStorageData<Facility[]>('chalkak_facilities', INITIAL_FACILITIES);
        callback(data);
      };
      getLocal();
      const interval = setInterval(getLocal, 1500);
      return () => clearInterval(interval);
    }

    const q = collection(db, 'facilities');
    return onSnapshot(q, (snapshot) => {
      const facilities: Facility[] = [];
      snapshot.forEach((doc) => {
        facilities.push(doc.data() as Facility);
      });
      facilities.sort((a, b) => a.id.localeCompare(b.id));
      callback(facilities);
    }, (error) => {
      console.error("Firestore listenFacilities error:", error);
    });
  },

  /**
   * Listen to real-time changes of reports (all reports)
   */
  listenReports(callback: (reports: Report[]) => void): () => void {
    if (!isFirebaseActive) {
      const getLocal = () => {
        const data = getLocalStorageData<Report[]>('chalkak_reports', INITIAL_REPORTS);
        callback(data);
      };
      getLocal();
      const interval = setInterval(getLocal, 1500);
      return () => clearInterval(interval);
    }

    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const reports: Report[] = [];
      snapshot.forEach((doc) => {
        reports.push(doc.data() as Report);
      });
      callback(reports);
    }, (error) => {
      console.error("Firestore listenReports error:", error);
    });
  },

  /**
   * Listen to reports filed by a specific user
   */
  listenUserReports(userId: string, callback: (reports: Report[]) => void): () => void {
    if (!isFirebaseActive) {
      const getLocal = () => {
        const data = getLocalStorageData<Report[]>('chalkak_reports', INITIAL_REPORTS);
        const filtered = data.filter((r) => r.userId === userId);
        callback(filtered);
      };
      getLocal();
      const interval = setInterval(getLocal, 1500);
      return () => clearInterval(interval);
    }

    const q = query(
      collection(db, 'reports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const reports: Report[] = [];
      snapshot.forEach((doc) => {
        reports.push(doc.data() as Report);
      });
      callback(reports);
    }, (error) => {
      console.error("Firestore listenUserReports error:", error);
    });
  },

  /**
   * Add a brand new citizen report with active Gemini AI Analysis Integration
   */
  async addReport(
    report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'aiScore' | 'aiReason' | 'isMeaningful' | 'status'>,
    imageFile: File | null
  ): Promise<Report> {
    const id = `rep-${Date.now()}`;
    const createdAt = new Date().toISOString();
    let imageUrl = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'; // fallback placeholder

    // 1. Process Image Upload (Firebase Storage or Local Storage Base64 fallback)
    if (imageFile) {
      if (isFirebaseActive && storage) {
        try {
          const storageRef = ref(storage, `reports/${report.userId}/${id}/original.jpg`);
          const uploadSnapshot = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(uploadSnapshot.ref);
        } catch (e) {
          console.error('Firebase Storage upload failed, falling back to Base64:', e);
          imageUrl = await this.fileToBase64(imageFile);
        }
      } else {
        imageUrl = await this.fileToBase64(imageFile);
      }
    }

    // 2. Perform Real-time Gemini AI Analysis
    console.log('🤖 AI Analysis triggered for new report...');
    const aiResult = await aiService.analyzeReport(
      report.category,
      report.description || '',
      report.lat,
      report.lng
    );

    const newReport: Report = {
      ...report,
      id,
      imageUrl,
      status: 'RECEIVED',
      aiScore: aiResult.score,
      aiReason: aiResult.reason,
      isMeaningful: aiResult.isMeaningful,
      createdAt,
      updatedAt: createdAt
    };

    // 3. Save to Storage & Update False Report Counter for user if AI tags as spam
    if (!aiResult.isMeaningful) {
      const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
      const updated = usersList.map((u) => {
        if (u.uid === report.userId) {
          const falseCount = u.falseReportCount + 1;
          const shouldBlock = falseCount >= 5;
          return { ...u, falseReportCount: falseCount, blocked: shouldBlock ? true : u.blocked };
        }
        return u;
      });
      localStorage.setItem('chalkak_users', JSON.stringify(updated));
      
      // Update session if it's the active logged in user
      const currentUserStr = localStorage.getItem('chalkak_current_user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr) as User;
        if (currentUser.uid === report.userId) {
          const updatedSelf = updated.find(u => u.uid === report.userId);
          if (updatedSelf) {
            localStorage.setItem('chalkak_current_user', JSON.stringify(updatedSelf));
          }
        }
      }

      // If in Firebase Mode, increment counter in firestore
      if (isFirebaseActive) {
        try {
          const userDocRef = doc(db, 'users', report.userId);
          await updateDoc(userDocRef, {
            falseReportCount: increment(1)
          });
        } catch (e) {
          console.error('Firestore User update failed:', e);
        }
      }
    }

    // 4. Double check if this area streetlight is failing and trigger alertNeeded on facility streetlight
    if (report.category === 'ENERGY_WASTE' && (report.description || '').includes('가로등')) {
      const facilities = getLocalStorageData<Facility[]>('chalkak_facilities', INITIAL_FACILITIES);
      const matched = facilities.find(f => f.type === 'streetlight' && f.region === 'A구역'); // A구역 가로등 매치 시연용
      if (matched) {
        matched.alertNeeded = true;
        setLocalStorageData('chalkak_facilities', facilities);
        if (isFirebaseActive) {
          try {
            await updateDoc(doc(db, 'facilities', matched.id), { alertNeeded: true });
          } catch (e) {
            console.error('Firestore Facility update failed:', e);
          }
        }
      }
    }

    // 5. Store report
    if (!isFirebaseActive) {
      const reports = getLocalStorageData<Report[]>('chalkak_reports', INITIAL_REPORTS);
      setLocalStorageData('chalkak_reports', [newReport, ...reports]);
      return newReport;
    }

    try {
      const docRef = doc(db, 'reports', id);
      await setDoc(docRef, newReport);
    } catch (e) {
      console.error('Firestore addReport doc insertion failed:', e);
    }
    
    return newReport;
  },

  /**
   * Update facility status (ON / OFF / 점검 중)
   */
  async updateFacility(facilityId: string, status: Facility['status']): Promise<void> {
    if (!isFirebaseActive) {
      const data = getLocalStorageData<Facility[]>('chalkak_facilities', INITIAL_FACILITIES);
      const updated = data.map((f) => {
        if (f.id === facilityId) {
          let consumption = f.energyConsumption;
          if (status === 'OFF') consumption = 0;
          if (status === 'ON') consumption = f.type === 'streetlight' ? 120 : f.type === 'public' ? 320 : f.energyConsumption;
          if (status === '점검 중') consumption = Math.round(f.energyConsumption * 0.1);
          return { ...f, status, energyConsumption: consumption };
        }
        return f;
      });
      setLocalStorageData('chalkak_facilities', updated);
      return;
    }

    const docRef = doc(db, 'facilities', facilityId);
    let consumptionValue = 0;
    const facilitiesList = getLocalStorageData<Facility[]>('chalkak_facilities', INITIAL_FACILITIES);
    const origin = facilitiesList.find(f => f.id === facilityId);
    if (origin) {
      if (status === 'OFF') consumptionValue = 0;
      if (status === 'ON') consumptionValue = origin.type === 'streetlight' ? 120 : origin.type === 'public' ? 320 : origin.energyConsumption;
      if (status === '점검 중') consumptionValue = Math.round(origin.energyConsumption * 0.1);
    }
    await updateDoc(docRef, { status, energyConsumption: consumptionValue });
  },

  /**
   * Update report status and assign/resolve details in administrative panel.
   * If status transitions to RESOLVED, citizen automatically earns points equal to aiScore!
   */
  async updateReportStatusAndResult(
    reportId: string,
    status: Report['status'],
    assignedTo?: string,
    resultMemo?: string,
    resultImageOrUrl: File | string | null = null
  ): Promise<void> {
    const updatedAt = new Date().toISOString();
    let resultImageUrl = '';

    // 1. Image upload processing for resolved photo
    if (resultImageOrUrl) {
      if (typeof resultImageOrUrl === 'string') {
        resultImageUrl = resultImageOrUrl;
      } else if (isFirebaseActive && storage) {
        try {
          const storageRef = ref(storage, `reports/admin_resolutions/${reportId}/resolved.jpg`);
          const uploadSnapshot = await uploadBytes(storageRef, resultImageOrUrl);
          resultImageUrl = await getDownloadURL(uploadSnapshot.ref);
        } catch (e) {
          resultImageUrl = await this.fileToBase64(resultImageOrUrl);
        }
      } else {
        resultImageUrl = await this.fileToBase64(resultImageOrUrl);
      }
    }

    const currentReports = getLocalStorageData<Report[]>('chalkak_reports', INITIAL_REPORTS);
    const targetReport = currentReports.find((r) => r.id === reportId);

    if (!targetReport) return;

    const previousStatus = targetReport.status;
    const isNewResolution = (previousStatus !== 'RESOLVED' && status === 'RESOLVED');

    // 2. Perform point award transaction if status turns RESOLVED for a meaningful report
    if (isNewResolution && targetReport.isMeaningful) {
      const pointsToAward = targetReport.aiScore;
      
      const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
      const updatedUsers = usersList.map((u) => {
        if (u.uid === targetReport.userId) {
          return { ...u, points: u.points + pointsToAward };
        }
        return u;
      });
      localStorage.setItem('chalkak_users', JSON.stringify(updatedUsers));

      // Sync active session if the reporter is logged in (unlikely during admin session, but safe)
      const currentUserStr = localStorage.getItem('chalkak_current_user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr) as User;
        if (currentUser.uid === targetReport.userId) {
          const updatedSelf = updatedUsers.find(u => u.uid === targetReport.userId);
          if (updatedSelf) {
            localStorage.setItem('chalkak_current_user', JSON.stringify(updatedSelf));
          }
        }
      }

      // If in Live Firebase, update Firestore user profile points
      if (isFirebaseActive) {
        try {
          const userDocRef = doc(db, 'users', targetReport.userId);
          await updateDoc(userDocRef, {
            points: increment(pointsToAward)
          });
        } catch (e) {
          console.error('Firestore User update points failed:', e);
        }
      }
    }

    // 3. Update report document
    const updatedFields: Partial<Report> = {
      status,
      updatedAt
    };
    if (assignedTo !== undefined) updatedFields.assignedTo = assignedTo;
    if (resultMemo !== undefined) updatedFields.resultMemo = resultMemo;
    if (resultImageUrl !== '') updatedFields.resultImageUrl = resultImageUrl;

    // Local Sync
    const updatedReports = currentReports.map((r) => {
      if (r.id === reportId) {
        return { ...r, ...updatedFields };
      }
      return r;
    });
    setLocalStorageData('chalkak_reports', updatedReports);

    // If 가로등 alarm이 해결되었다면 alertNeeded 플래그 해제 검토
    if (status === 'RESOLVED' && targetReport.category === 'ENERGY_WASTE') {
      const facilities = getLocalStorageData<Facility[]>('chalkak_facilities', INITIAL_FACILITIES);
      const matched = facilities.find(f => f.type === 'streetlight' && f.region === 'A구역');
      if (matched) {
        // Only disable alarm if all energy waste reports in A구역 are resolved
        const activeAProblems = updatedReports.some(r => r.category === 'ENERGY_WASTE' && r.status !== 'RESOLVED' && r.isMeaningful);
        if (!activeAProblems) {
          matched.alertNeeded = false;
          setLocalStorageData('chalkak_facilities', facilities);
          if (isFirebaseActive) {
            try {
              await updateDoc(doc(db, 'facilities', matched.id), { alertNeeded: false });
            } catch (e) {}
          }
        }
      }
    }

    // Live Sync
    if (isFirebaseActive) {
      const docRef = doc(db, 'reports', reportId);
      await updateDoc(docRef, updatedFields);
    }
  },

  /**
   * Redeem accumulated energy points into digital coupon vouchers
   */
  async redeemCoupon(userId: string, couponName: string, cost: number): Promise<void> {
    const usersList = JSON.parse(localStorage.getItem('chalkak_users') || '[]') as User[];
    const targetUser = usersList.find((u) => u.uid === userId);

    if (!targetUser) throw new Error('존재하지 않는 유저입니다.');
    if (targetUser.points < cost) throw new Error('보유한 에너지가 부족하여 쿠폰으로 교환할 수 없습니다.');

    // 1. Deduct points
    const updatedUsers = usersList.map((u) => {
      if (u.uid === userId) {
        const updated = { ...u, points: u.points - cost };
        // Sync session
        const currentSession = localStorage.getItem('chalkak_current_user');
        if (currentSession) {
          const current = JSON.parse(currentSession) as User;
          if (current.uid === userId) {
            localStorage.setItem('chalkak_current_user', JSON.stringify(updated));
          }
        }
        return updated;
      }
      return u;
    });
    localStorage.setItem('chalkak_users', JSON.stringify(updatedUsers));

    if (isFirebaseActive) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { points: increment(-cost) });
      } catch (e) {}
    }

    // 2. Add Coupon Redemption Log
    const id = `coupon-${Date.now()}`;
    const newRedemption: CouponRedemption = {
      id,
      userId,
      couponName,
      cost,
      createdAt: new Date().toISOString()
    };

    const redemptions = getLocalStorageData<CouponRedemption[]>('chalkak_redemptions', []);
    setLocalStorageData('chalkak_redemptions', [newRedemption, ...redemptions]);

    if (isFirebaseActive) {
      try {
        const docRef = doc(db, 'couponRedemptions', id);
        await setDoc(docRef, newRedemption);
      } catch (e) {}
    }
  },

  /**
   * Listen to coupon redemptions for a specific user
   */
  listenUserRedemptions(userId: string, callback: (redemptions: CouponRedemption[]) => void): () => void {
    if (!isFirebaseActive) {
      const getLocal = () => {
        const data = getLocalStorageData<CouponRedemption[]>('chalkak_redemptions', []);
        const filtered = data.filter((r) => r.userId === userId);
        callback(filtered);
      };
      getLocal();
      const interval = setInterval(getLocal, 1500);
      return () => clearInterval(interval);
    }

    const q = query(
      collection(db, 'couponRedemptions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const logs: CouponRedemption[] = [];
      snapshot.forEach((doc) => {
        logs.push(doc.data() as CouponRedemption);
      });
      callback(logs);
    }, (error) => {
      console.error("Firestore listenUserRedemptions error:", error);
    });
  },

  /**
   * Reset database back to default initial values
   */
  async resetDatabase(): Promise<void> {
    setLocalStorageData('chalkak_facilities', INITIAL_FACILITIES);
    setLocalStorageData('chalkak_reports', INITIAL_REPORTS);
    setLocalStorageData('chalkak_redemptions', [] as CouponRedemption[]);

    const usersStr = localStorage.getItem('chalkak_users');
    if (usersStr) {
      const users = JSON.parse(usersStr) as User[];
      const resetPointsUsers = users.map((u) => {
        if (u.uid === 'user-citizen') return { ...u, points: 420, blocked: false, falseReportCount: 0 };
        if (u.uid === 'user-admin') return { ...u, points: 0, blocked: false, falseReportCount: 0 };
        if (u.uid === 'user-bad') return { ...u, points: 0, blocked: false, falseReportCount: 3 };
        return { ...u, points: 0, blocked: false, falseReportCount: 0 };
      });
      localStorage.setItem('chalkak_users', JSON.stringify(resetPointsUsers));

      const session = localStorage.getItem('chalkak_current_user');
      if (session) {
        const current = JSON.parse(session) as User;
        const resetSelf = resetPointsUsers.find(u => u.uid === current.uid);
        if (resetSelf) {
          localStorage.setItem('chalkak_current_user', JSON.stringify(resetSelf));
        }
      }
    }

    if (!isFirebaseActive) return;

    try {
      const facRef = collection(db, 'facilities');
      const facSnap = await getDocs(facRef);
      const batch1 = writeBatch(db);
      facSnap.forEach((doc) => {
        batch1.delete(doc.ref);
      });
      await batch1.commit();

      const repRef = collection(db, 'reports');
      const repSnap = await getDocs(repRef);
      const batch2 = writeBatch(db);
      repSnap.forEach((doc) => {
        batch2.delete(doc.ref);
      });
      await batch2.commit();

      await this.seedIfNeeded();
    } catch (e) {
      console.error('Reset database failed:', e);
    }
  },

  /**
   * Update facility alertNeeded state
   */
  async updateFacilityAlertNeeded(facilityId: string, alertNeeded: boolean): Promise<void> {
    const facilities = getLocalStorageData<Facility[]>('chalkak_facilities', INITIAL_FACILITIES);
    const updated = facilities.map((f) => {
      if (f.id === facilityId) {
        return { ...f, alertNeeded };
      }
      return f;
    });
    setLocalStorageData('chalkak_facilities', updated);

    if (isFirebaseActive) {
      try {
        const docRef = doc(db, 'facilities', facilityId);
        await updateDoc(docRef, { alertNeeded });
      } catch (e) {
        console.error('Firestore alertNeeded update failed:', e);
      }
    }
  },

  /**
   * Helper to convert files to Base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
};
