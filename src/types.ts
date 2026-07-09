export interface Facility {
  id: string;
  name: string;
  type: 'thermal' | 'solar' | 'wind' | 'factory' | 'residential' | 'streetlight' | 'public';
  energyProduction: number; // MW
  energyConsumption: number; // MW
  pollution: number; // % (0 to 100)
  status: '정상 가동' | '절전 모드' | 'ECO 가동' | '정비 중';
  location: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역';
  isAging: boolean;
}

export interface Report {
  id: string;
  title: string;
  type: '환경오염' | '에너지 낭비' | '시설 고장' | '쓰레기 문제' | '기타';
  location: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역';
  description: string;
  imageUrl: string | null; // URL string (Firestore Cloud Storage url or Base64 fallback)
  status: '접수' | '확인 중' | '처리 완료';
  createdAt: string; // Formatting timestamp
}

export type TabType = 'dashboard' | 'simulator' | 'reportForm' | 'map' | 'admin' | 'projectInfo';
