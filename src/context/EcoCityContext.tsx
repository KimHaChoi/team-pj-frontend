import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Facility, Report } from '../types';
import { dbService, INITIAL_FACILITIES, INITIAL_REPORTS } from '../services/dbService';
import { isFirebaseActive } from '../firebase';

interface EcoCityContextType {
  facilities: Facility[];
  reports: Report[];
  isLoading: boolean;
  isFirebase: boolean;
  
  // Dynamic computed stats
  stats: {
    totalProduction: number;
    totalConsumption: number;
    avgPollution: number;
    totalReports: number;
    unresolvedReports: number;
    activeAlarms: number;
    ecoScore: number;
  };
  
  // Simulator Functions
  addEcoPlant: (location: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역') => Promise<void>;
  replaceAgingFacilities: () => Promise<void>;
  toggleStreetlightSaving: () => Promise<void>;
  isStreetlightSavingActive: boolean;
  
  // Report Functions
  submitReport: (
    title: string,
    type: Report['type'],
    location: Report['location'],
    description: string,
    imageFile: File | null
  ) => Promise<Report>;
  updateReportStatus: (reportId: string, status: Report['status']) => Promise<void>;
  
  // System Functions
  resetData: () => Promise<void>;
}

const EcoCityContext = createContext<EcoCityContextType | undefined>(undefined);

export const EcoCityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreetlightSavingActive, setIsStreetlightSavingActive] = useState(false);

  // Initialize DB and Seeding
  useEffect(() => {
    const initDb = async () => {
      setIsLoading(true);
      await dbService.seedIfNeeded();

      // Subscribe to real-time facilities
      const unsubFac = dbService.listenFacilities((data) => {
        setFacilities(data);
        
        // Track global streetlight saving state based on database values
        const streetlights = data.filter(f => f.type === 'streetlight');
        const isAllSaving = streetlights.length > 0 && streetlights.every(s => s.status === '절전 모드');
        setIsStreetlightSavingActive(isAllSaving);
      });

      // Subscribe to real-time reports
      const unsubRep = dbService.listenReports((data) => {
        setReports(data);
      });

      setIsLoading(false);

      return () => {
        unsubFac();
        unsubRep();
      };
    };

    initDb();
  }, []);

  // Compute stats on the fly
  const computeStats = () => {
    if (facilities.length === 0) {
      return {
        totalProduction: 0,
        totalConsumption: 0,
        avgPollution: 0,
        totalReports: 0,
        unresolvedReports: 0,
        activeAlarms: 0,
        ecoScore: 100
      };
    }

    const totalProduction = facilities.reduce((sum, f) => sum + f.energyProduction, 0);
    const totalConsumption = facilities.reduce((sum, f) => sum + f.energyConsumption, 0);
    
    // Average pollution from all facilities
    const avgPollution = Math.round(
      facilities.reduce((sum, f) => sum + f.pollution, 0) / facilities.length
    );

    const totalReports = reports.length;
    const unresolvedReports = reports.filter((r) => r.status !== '처리 완료').length;
    const activeAlarms = reports.filter((r) => r.status === '접수').length;

    // Eco Score algorithm: Starts at 100
    let ecoScore = 100;
    
    // 1. Pollution penalty (max -30 points)
    ecoScore -= (avgPollution / 100) * 30;

    // 2. Efficiency penalty (max -30 points)
    if (totalProduction > 0) {
      const consumptionRatio = totalConsumption / totalProduction;
      if (consumptionRatio > 1.2) {
        ecoScore -= 30; // severe over-consumption
      } else {
        ecoScore -= Math.min(consumptionRatio * 25, 30);
      }
    } else {
      ecoScore -= 30;
    }

    // 3. Unresolved environmental reports penalty (max -20 points)
    ecoScore -= Math.min(unresolvedReports * 4, 20);

    // 4. Aging facility penalty (max -20 points)
    const agingCount = facilities.filter(f => f.isAging).length;
    ecoScore -= Math.min(agingCount * 4, 20);

    // Clamp score between 0 and 100
    ecoScore = Math.max(0, Math.min(Math.round(ecoScore), 100));

    return {
      totalProduction,
      totalConsumption,
      avgPollution,
      totalReports,
      unresolvedReports,
      activeAlarms,
      ecoScore
    };
  };

  const stats = computeStats();

  // ----------------------------------------------------
  // SIMULATOR OPERATIONS
  // ----------------------------------------------------
  
  /**
   * Add a new Eco Solar/Wind Plant to a district
   */
  const addEcoPlant = async (location: 'A구역' | 'B구역' | 'C구역' | 'D구역' | 'E구역') => {
    const ecoPlantsCount = facilities.filter(f => f.name.includes('친환경 태양광')).length;
    const id = `fac-eco-${Date.now()}`;
    const newPlant: Facility = {
      id,
      name: `친환경 태양광 발전기 [No. ${ecoPlantsCount + 1}]`,
      type: 'solar',
      energyProduction: 150, // 150MW production
      energyConsumption: 5,   // low internal consumption
      pollution: 0,          // zero pollution
      status: '정상 가동',
      location,
      isAging: false
    };

    if (!isFirebaseActive) {
      const updated = [...facilities, newPlant];
      localStorage.setItem('ecocity_facilities', JSON.stringify(updated));
      setFacilities(updated);
      return;
    }

    await dbService.updateFacility(newPlant);
  };

  /**
   * Replace all aging/inefficient facilities with eco-friendly variants
   */
  const replaceAgingFacilities = async () => {
    const updatedFacilities = facilities.map((f): Facility => {
      if (f.isAging) {
        return {
          ...f,
          name: `${f.name} (에코 개량형)`,
          energyConsumption: Math.round(f.energyConsumption * 0.7), // 30% reduction
          pollution: Math.round(f.pollution * 0.4),                 // 60% pollution reduction
          isAging: false
        };
      }
      return f;
    });

    if (!isFirebaseActive) {
      localStorage.setItem('ecocity_facilities', JSON.stringify(updatedFacilities));
      setFacilities(updatedFacilities);
      return;
    }

    // Update each updated facility in Firestore
    for (const f of updatedFacilities) {
      const original = facilities.find(o => o.id === f.id);
      if (original?.isAging) {
        await dbService.updateFacility(f);
      }
    }
  };

  /**
   * Toggle saving mode on all streetlights
   */
  const toggleStreetlightSaving = async () => {
    const nextSavingState = !isStreetlightSavingActive;
    
    const updated = facilities.map((f): Facility => {
      if (f.type === 'streetlight') {
        return {
          ...f,
          status: nextSavingState ? '절전 모드' : '정상 가동',
          energyConsumption: nextSavingState ? 20 : 50 // 60% power reduction
        };
      }
      return f;
    });

    if (!isFirebaseActive) {
      localStorage.setItem('ecocity_facilities', JSON.stringify(updated));
      setFacilities(updated);
      setIsStreetlightSavingActive(nextSavingState);
      return;
    }

    // Write to Firestore
    for (const f of updated) {
      if (f.type === 'streetlight') {
        await dbService.updateFacility(f);
      }
    }
    setIsStreetlightSavingActive(nextSavingState);
  };

  // ----------------------------------------------------
  // REPORT OPERATIONS
  // ----------------------------------------------------

  const submitReport = async (
    title: string,
    type: Report['type'],
    location: Report['location'],
    description: string,
    imageFile: File | null
  ) => {
    const newReport = await dbService.addReport({
      title,
      type,
      location,
      description,
      status: '접수',
      imageUrl: null
    }, imageFile);
    
    return newReport;
  };

  const updateReportStatus = async (reportId: string, status: Report['status']) => {
    await dbService.updateReportStatus(reportId, status);
  };

  // ----------------------------------------------------
  // SYSTEM OPERATIONS
  // ----------------------------------------------------

  const resetData = async () => {
    await dbService.resetDatabase();
    if (!isFirebaseActive) {
      setFacilities(INITIAL_FACILITIES);
      setReports(INITIAL_REPORTS);
    }
  };

  return (
    <EcoCityContext.Provider
      value={{
        facilities,
        reports,
        isLoading,
        isFirebase: isFirebaseActive,
        stats,
        addEcoPlant,
        replaceAgingFacilities,
        toggleStreetlightSaving,
        isStreetlightSavingActive,
        submitReport,
        updateReportStatus,
        resetData
      }}
    >
      {children}
    </EcoCityContext.Provider>
  );
};

export const useEcoCity = () => {
  const context = useContext(EcoCityContext);
  if (context === undefined) {
    throw new Error('useEcoCity must be used within an EcoCityProvider');
  }
  return context;
};
