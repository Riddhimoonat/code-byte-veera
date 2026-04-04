import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Removed MapView for Procedural Radar UI (Higher Reliability & Premium Feel)
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import { fetchRiskScore, fetchRiskMap } from '../services/api';
import RiskLevelBadge from '../components/RiskLevelBadge';
import { COLORS, SPACING } from '../constants';
import type { RiskScoreResponse, RiskMapPoint, RiskCategory } from '../types';

// Risk color for the circle overlay around user
const RISK_CIRCLE_COLOR: Record<string, string> = {
  Low:      'rgba(34,197,94,0.15)',
  Medium:   'rgba(245,158,11,0.2)',
  High:     'rgba(239,68,68,0.2)',
  Critical: 'rgba(220,38,38,0.3)',
  Unknown:  'rgba(100,100,120,0.1)',
};

const RISK_STROKE_COLOR: Record<string, string> = {
  Low:      '#22c55e',
  Medium:   '#f59e0b',
  High:     '#ef4444',
  Critical: '#dc2626',
  Unknown:  '#55556a',
};

export default function RiskMapScreen() {
  const { width } = Dimensions.get('window');
  const location = useLocation();
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [riskGrid, setRiskGrid] = useState<RiskMapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const riskCategory: RiskCategory = (riskData?.risk_category as RiskCategory) ?? 'Unknown';

  useEffect(() => {
    if (!location.latitude) return;
    assessRisk();
  }, [location.latitude]);

  const assessRisk = async () => {
    if (!location.latitude || !location.longitude) return;
    setIsLoading(true);
    try {
      const payload = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      };
      // Fetch both exact point risk and the map grid in parallel
      const [exactRisk, mapGrid] = await Promise.all([
        fetchRiskScore(payload),
        fetchRiskMap(payload),
      ]);
      setRiskData(exactRisk);
      setRiskGrid(mapGrid);
    } catch (err: any) {
      Alert.alert("Risk API Error", err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Radar UI is auto-centered around user by default logic.
  // Recenter functionality not required for procedural coordinate mapping.

  if (location.isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
        <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md }}>Getting your location…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Risk Map</Text>
        <TouchableOpacity onPress={assessRisk} style={styles.refreshBtn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Veera Safety Radar ─── */}
      <View style={styles.radarWrapper}>
        {/* Distance Rings */}
        <View style={[styles.ring, { width: width * 1.5, height: width * 1.5, opacity: 0.05 }]} />
        <View style={[styles.ring, { width: width * 1.1, height: width * 1.1, opacity: 0.1 }]} />
        <View style={[styles.ring, { width: width * 0.7, height: width * 0.7, opacity: 0.15 }]} />
        
        {/* Radar Scanning Line Animation (Optional effect) */}
        <View style={styles.radarCore}>
           {/* Center Point (You) */}
           <View style={[styles.userPulse, { backgroundColor: RISK_STROKE_COLOR[riskCategory] + '44' }]} />
           <View style={[styles.userCore, { backgroundColor: RISK_STROKE_COLOR[riskCategory] }]} />
           
           {/* Risk Pips (The Grid) */}
           {riskGrid.map((pt, idx) => {
             const cat = (pt.risk_category as RiskCategory) ?? 'Unknown';
             // Map GPS offset to relative UI positioning
             // We use a sensitivity factor to spread them on the radar screen
             const dx = (pt.longitude - (location.longitude || 0)) * 25000;
             const dy = (pt.latitude - (location.latitude || 0)) * 25000;
             
             return (
               <View 
                  key={`pip-${idx}`} 
                  style={[
                    styles.riskPip, 
                    { 
                      transform: [{ translateX: dx }, { translateY: -dy }], // -dy because Y is down in UI
                      backgroundColor: RISK_STROKE_COLOR[cat],
                      shadowColor: RISK_STROKE_COLOR[cat],
                    }
                  ]} 
               >
                 <View style={[styles.pipGlow, { backgroundColor: RISK_STROKE_COLOR[cat] + '33' }]} />
               </View>
             );
           })}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legTxt}>Extreme</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#f59e0b' }]} /><Text style={styles.legTxt}>Mid</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#22c55e' }]} /><Text style={styles.legTxt}>Safe</Text></View>
        </View>
      </View>

      {/* Bottom info card */}
      <View style={styles.infoCard}>
        <RiskLevelBadge category={riskCategory} score={riskData?.risk_level} />

        {riskData?.risk_factors?.length ? (
          <View style={styles.factorList}>
            {riskData.risk_factors.slice(0, 3).map((f, i) => (
              <Text key={i} style={styles.factorItem}>
                {'• '}{f}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.noFactors}>
            {riskData ? 'No specific risk factors.' : 'Tap ↻ to assess your current risk.'}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// Dark map style — matches the app's dark theme
// Placeholder for map style if needed later
const darkMapStyle: any[] = [];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  refreshBtn: { padding: SPACING.sm },
  radarWrapper: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden',
    backgroundColor: '#050508' 
  },
  radarCore: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 999,
  },
  userCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 10,
  },
  loadingText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  userPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  riskPip: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  pipGlow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: -9,
    marginTop: -9,
  },
  legendContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#111',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legTxt: { color: '#999', fontSize: 11, fontWeight: '700' },
  infoCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  factorList: { gap: SPACING.xs },
  factorItem: { color: COLORS.textSecondary, fontSize: 13 },
  noFactors: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
});
