import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchRiskScore, fetchRiskMap } from '../services/api';
import { useLocation } from '../hooks/useLocation';
import { RiskScoreResponse, RiskMapPoint } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

interface RiskContextType {
  riskData: RiskScoreResponse | null;
  riskMap: RiskMapPoint[];
  isLoading: boolean;
  refreshRisk: () => Promise<void>;
}

const RiskContext = createContext<RiskContextType | undefined>(undefined);

export const RiskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [riskMap, setRiskMap] = useState<RiskMapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const refreshRisk = async () => {
    if (!location.latitude || !location.longitude) return;
    
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const [score, map] = await Promise.all([
        fetchRiskScore({
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp,
        }),
        fetchRiskMap({
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp,
        })
      ]);

      setRiskData(score);
      setRiskMap(map);
      
      // Persist last score for immediate load on next app open
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_RISK_SCORE, JSON.stringify(score));
    } catch (err) {
      console.error('[RiskContext] Refresh Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll risk every 45 seconds to keep Home/Map synced globally
  useEffect(() => {
    if (location.latitude && location.longitude) {
      refreshRisk();
      const interval = setInterval(refreshRisk, 45000);
      return () => clearInterval(interval);
    }
  }, [location.latitude, location.longitude]);

  return (
    <RiskContext.Provider value={{ riskData, riskMap, isLoading, refreshRisk }}>
      {children}
    </RiskContext.Provider>
  );
};

export const useRisk = () => {
  const context = useContext(RiskContext);
  if (context === undefined) {
    throw new Error('useRisk must be used within a RiskProvider');
  }
  return context;
};
