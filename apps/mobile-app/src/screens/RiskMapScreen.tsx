import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
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
  const location = useLocation();
  const mapRef = useRef<MapView>(null);
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

  const recenter = () => {
    if (!location.latitude || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude!,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  if (location.isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
        <Text style={styles.loadingText}>Getting your location…</Text>
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

      {/* Map */}
      <View style={styles.mapWrapper}>
        {location.latitude ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude!,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {/* User marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude!,
              }}
              title="You are here"
            >
              <View style={styles.userPin}>
                <View style={styles.userPinInner} />
              </View>
            </Marker>

            {/* Grid overlay circles for blurred heatmap effect */}
            {riskGrid.map((pt, idx) => {
              const cat = (pt.risk_category as RiskCategory) ?? 'Unknown';
              return (
                <Circle
                  key={`grid-${idx}`}
                  center={{ latitude: pt.latitude, longitude: pt.longitude }}
                  radius={500}
                  fillColor={RISK_CIRCLE_COLOR[cat] ?? RISK_CIRCLE_COLOR.Unknown}
                  strokeColor="transparent"
                />
              );
            })}
            
            {/* User marker radius overlay */}
            <Circle
              center={{ latitude: location.latitude, longitude: location.longitude! }}
              radius={200}
              fillColor="transparent"
              strokeColor={RISK_STROKE_COLOR[riskCategory] ?? RISK_STROKE_COLOR.Unknown}
              strokeWidth={2}
            />
          </MapView>
        ) : (
          <View style={styles.noLocationBox}>
            <Ionicons name="location-outline" size={48} color={COLORS.border} />
            <Text style={styles.noLocationText}>Location not available</Text>
          </View>
        )}

        {/* Recenter FAB */}
        <TouchableOpacity style={styles.recenterFab} onPress={recenter}>
          <Ionicons name="locate" size={22} color="#fff" />
        </TouchableOpacity>
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
  mapWrapper: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  noLocationBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  noLocationText: { color: COLORS.textMuted },
  userPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(232,93,93,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPinInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  recenterFab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  loadingText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
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
