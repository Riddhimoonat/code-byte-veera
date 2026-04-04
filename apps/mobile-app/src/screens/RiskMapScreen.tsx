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
import { 
  PanGestureHandler, 
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  RotationGestureHandler,
  RotationGestureHandlerGestureEvent,
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import { useLocation } from '../hooks/useLocation';
import { useRisk } from '../context/RiskContext';
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
  const { riskData, riskMap, isLoading, refreshRisk } = useRisk();

  // Tactical Gestures
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const onPanEvent = (event: PanGestureHandlerGestureEvent) => {
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
  };

  const onPinchEvent = (event: PinchGestureHandlerGestureEvent) => {
    scale.value = event.nativeEvent.scale;
  };

  const onRotateEvent = (event: RotationGestureHandlerGestureEvent) => {
    // Rotation disabled for HUD stability
  };

  const onReset = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
  };

  const animatedRadarStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const riskCategory: RiskCategory = (riskData?.risk_category as RiskCategory) ?? 'Unknown';

  // Manual refresh via HUD button now triggers Global Sync
  const handleManualRefresh = () => {
    refreshRisk();
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
        <TouchableOpacity onPress={handleManualRefresh} style={styles.refreshBtn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Veera Safety Radar ─── */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RotationGestureHandler onGestureEvent={onRotateEvent}>
          <Animated.View style={{ flex: 1 }}>
            <PinchGestureHandler onGestureEvent={onPinchEvent}>
              <Animated.View style={{ flex: 1 }}>
                <PanGestureHandler onGestureEvent={onPanEvent}>
                  <Animated.View style={[styles.radarWrapper, animatedRadarStyle]}>
                    {/* Distance Rings */}
                    <View style={[styles.ring, { width: width * 1.8, height: width * 1.8, opacity: 0.03 }]} />
                    <View style={[styles.ring, { width: width * 1.3, height: width * 1.3, opacity: 0.08 }]} />
                    <View style={[styles.ring, { width: width * 0.8, height: width * 0.8, opacity: 0.12 }]} />
                    
                    <View style={styles.radarCore}>
                       {/* Center Point (You) */}
                       <View style={[styles.userPulse, { backgroundColor: RISK_STROKE_COLOR[riskCategory] + '22' }]} />
                       <View style={[styles.userCore, { backgroundColor: '#fff', elevation: 15 }]}>
                          <Ionicons name="navigate" size={12} color={RISK_STROKE_COLOR[riskCategory]} style={{ transform: [{ rotate: '45deg' }] }} />
                       </View>
                       
                       {/* Risk Pips (The Grid) */}
                       {riskMap.map((pt, idx) => {
                         const cat = (pt.risk_category as RiskCategory) ?? 'Unknown';
                         const dx = (pt.longitude - (location.longitude || 0)) * 28000;
                         const dy = (pt.latitude - (location.latitude || 0)) * 28000;
                         
                         return (
                           <View 
                              key={`pip-${idx}`} 
                              style={[
                                styles.riskPip, 
                                { 
                                  transform: [{ translateX: dx }, { translateY: -dy }], 
                                  backgroundColor: RISK_STROKE_COLOR[cat],
                                }
                              ]} 
                           >
                             <View style={[styles.pipGlow, { backgroundColor: RISK_STROKE_COLOR[cat] + '22' }]} />
                           </View>
                         );
                       })}
                    </View>
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </RotationGestureHandler>

        {/* Legend fixed outside pan */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legTxt}>Danger</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#f59e0b' }]} /><Text style={styles.legTxt}>Mid</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#22c55e' }]} /><Text style={styles.legTxt}>Safe</Text></View>
        </View>
        
        {/* Reset FAB if panned far */}
        <TouchableOpacity style={styles.recenterRadar} onPress={onReset}>
          <Ionicons name="locate" size={20} color="#fff" />
        </TouchableOpacity>
      </GestureHandlerRootView>

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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  recenterRadar: {
    position: 'absolute',
    bottom: SPACING.xl * 2,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
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
