import { db, storage, isFirebaseActive } from '../firebase';
import type { Facility, Report } from '../types';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ----------------------------------------------------
// 1. Initial Seeding Data
// ----------------------------------------------------
export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'fac-1',
    name: 'DGSW 구식 화력 발전소',
    type: 'thermal',
    energyProduction: 250,
    energyConsumption: 30,
    pollution: 85,
    status: '정상 가동',
    location: 'A구역',
    isAging: true
  },
  {
    id: 'fac-2',
    name: 'Eco 비슬 태양광 발전단지',
    type: 'solar',
    energyProduction: 120,
    energyConsumption: 5,
    pollution: 0,
    status: '정상 가동',
    location: 'B구역',
    isAging: false
  },
  {
    id: 'fac-3',
    name: '현풍 풍력 발전단지',
    type: 'wind',
    energyProduction: 90,
    energyConsumption: 3,
    pollution: 0,
    status: '정상 가동',
    location: 'C구역',
    isAging: false
  },
  {
    id: 'fac-4',
    name: '테크노폴리스 중공업 공장',
    type: 'factory',
    energyProduction: 0,
    energyConsumption: 160,
    pollution: 75,
    status: '정상 가동',
    location: 'A구역',
    isAging: true
  },
  {
    id: 'fac-5',
    name: '현풍 스마트 주거 타운',
    type: 'residential',
    energyProduction: 15,
    energyConsumption: 110,
    pollution: 8,
    status: '정상 가동',
    location: 'D구역',
    isAging: false
  },
  {
    id: 'fac-6',
    name: '가로등 통합 전력망',
    type: 'streetlight',
    energyProduction: 0,
    energyConsumption: 50,
    pollution: 3,
    status: '정상 가동',
    location: 'E구역',
    isAging: false
  },
  {
    id: 'fac-7',
    name: '달성군 공공 종합 센터',
    type: 'public',
    energyProduction: 0,
    energyConsumption: 70,
    pollution: 12,
    status: '정상 가동',
    location: 'C구역',
    isAging: true
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    title: 'A구역 산업 공장 밤시간대 검은 매연 배출',
    type: '환경오염',
    location: 'A구역',
    description: '야간 새벽 시간대에 공장에서 시야를 가릴 정도의 짙은 검은 연기가 지속적으로 나오고 있습니다. 호흡기 자극이 너무 심합니다. 즉각 정밀 진단이 필요합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80',
    status: '접수',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString() // 4 hours ago
  },
  {
    id: 'rep-2',
    title: 'E구역 주간 가로등 상시 점등 문제',
    type: '에너지 낭비',
    location: 'E구역',
    description: '맑은 대낮 12시임에도 가로등 전철 전력망이 꺼지지 않고 모든 가로등이 백주대낮에 켜져 전력이 과도하게 낭비되고 있습니다. 관리자 센서 오작동인지 점검 바랍니다.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    status: '확인 중',
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString() // 10 hours ago
  },
  {
    id: 'rep-3',
    title: 'C구역 야산 뒤 불법 폐기물 방치 건',
    type: '쓰레기 문제',
    location: 'C구역',
    description: '테크노파크 북측 야산 길목 초입에 페인트 통과 정체불명의 폐드럼통 수십 개가 투기 및 방치되어 환경 오염과 침출수 누출 우려가 높습니다. 신속한 정리를 부탁드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    status: '처리 완료',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString() // 24 hours ago
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
// 3. Main Live/Fallback Database Services
// ----------------------------------------------------
export const dbService = {
  /**
   * Seed the database if empty
   */
  async seedIfNeeded(): Promise<void> {
    if (!isFirebaseActive) {
      if (!localStorage.getItem('ecocity_facilities')) {
        setLocalStorageData('ecocity_facilities', INITIAL_FACILITIES);
      }
      if (!localStorage.getItem('ecocity_reports')) {
        setLocalStorageData('ecocity_reports', INITIAL_REPORTS);
      }
      return;
    }

    try {
      const facRef = collection(db, 'facilities');
      const repRef = collection(db, 'reports');

      const facSnap = await getDocs(facRef);
      if (facSnap.empty) {
        console.log('Seeding initial facilities to Firestore...');
        const batch = writeBatch(db);
        INITIAL_FACILITIES.forEach((fac) => {
          const docRef = doc(facRef, fac.id);
          batch.set(docRef, fac);
        });
        await batch.commit();
      }

      const repSnap = await getDocs(repRef);
      if (repSnap.empty) {
        console.log('Seeding initial reports to Firestore...');
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
      // Local fallback mode: simple polling/interval or manual trigger
      const getLocal = () => {
        const data = getLocalStorageData<Facility[]>('ecocity_facilities', INITIAL_FACILITIES);
        callback(data);
      };
      getLocal();
      const interval = setInterval(getLocal, 1000);
      return () => clearInterval(interval);
    }

    const q = collection(db, 'facilities');
    return onSnapshot(q, (snapshot) => {
      const facilities: Facility[] = [];
      snapshot.forEach((doc) => {
        facilities.push(doc.data() as Facility);
      });
      // Sort facilities by id so list stays stable
      facilities.sort((a, b) => a.id.localeCompare(b.id));
      callback(facilities);
    }, (error) => {
      console.error("Firestore listenFacilities error:", error);
    });
  },

  /**
   * Listen to real-time changes of reports
   */
  listenReports(callback: (reports: Report[]) => void): () => void {
    if (!isFirebaseActive) {
      const getLocal = () => {
        const data = getLocalStorageData<Report[]>('ecocity_reports', INITIAL_REPORTS);
        callback(data);
      };
      getLocal();
      const interval = setInterval(getLocal, 1000);
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
   * Update a specific facility status/values
   */
  async updateFacility(facility: Facility): Promise<void> {
    if (!isFirebaseActive) {
      const data = getLocalStorageData<Facility[]>('ecocity_facilities', INITIAL_FACILITIES);
      const updated = data.map((f) => (f.id === facility.id ? facility : f));
      setLocalStorageData('ecocity_facilities', updated);
      return;
    }

    const docRef = doc(db, 'facilities', facility.id);
    await setDoc(docRef, facility, { merge: true });
  },

  /**
   * Add a brand new citizen report
   */
  async addReport(
    report: Omit<Report, 'id' | 'createdAt'>,
    imageFile: File | null
  ): Promise<Report> {
    const id = `rep-${Date.now()}`;
    const createdAt = new Date().toISOString();
    let imageUrl: string | null = null;

    if (imageFile) {
      if (isFirebaseActive && storage) {
        try {
          const storageRef = ref(storage, `reports/${id}-${imageFile.name}`);
          const uploadSnapshot = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(uploadSnapshot.ref);
        } catch (e) {
          console.error('Firebase Storage upload failed, falling back to Base64:', e);
          imageUrl = await this.fileToBase64(imageFile);
        }
      } else {
        // Base64 encode for LocalStorage
        imageUrl = await this.fileToBase64(imageFile);
      }
    }

    const newReport: Report = {
      ...report,
      id,
      imageUrl,
      createdAt
    };

    if (!isFirebaseActive) {
      const data = getLocalStorageData<Report[]>('ecocity_reports', INITIAL_REPORTS);
      setLocalStorageData('ecocity_reports', [newReport, ...data]);
      return newReport;
    }

    const docRef = doc(db, 'reports', id);
    await setDoc(docRef, newReport);
    return newReport;
  },

  /**
   * Update the status of a specific report (접수 | 확인 중 | 처리 완료)
   */
  async updateReportStatus(reportId: string, status: Report['status']): Promise<void> {
    if (!isFirebaseActive) {
      const data = getLocalStorageData<Report[]>('ecocity_reports', INITIAL_REPORTS);
      const updated = data.map((r) => (r.id === reportId ? { ...r, status } : r));
      setLocalStorageData('ecocity_reports', updated);
      return;
    }

    const docRef = doc(db, 'reports', reportId);
    await updateDoc(docRef, { status });
  },

  /**
   * Reset database back to default initial values
   */
  async resetDatabase(): Promise<void> {
    if (!isFirebaseActive) {
      setLocalStorageData('ecocity_facilities', INITIAL_FACILITIES);
      setLocalStorageData('ecocity_reports', INITIAL_REPORTS);
      return;
    }

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

      // Seed them again
      await this.seedIfNeeded();
    } catch (e) {
      console.error('Reset database failed:', e);
    }
  },

  /**
   * Util to convert local files to Base64 data url
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
