import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Linking,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SOSButton from '../components/SOSButton';
import RiskLevelBadge from '../components/RiskLevelBadge';
import LocationDisplay from '../components/LocationDisplay';
import QuickContactsBar from '../components/QuickContactsBar';
import AddContactModal from '../components/AddContactModal';

import { useLocation } from '../hooks/useLocation';
import { useContacts } from '../hooks/useContacts';
import { useRisk } from '../context/RiskContext';
import { triggerSOS } from '../services/api';
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  configureNotifications,
} from '../tasks/backgroundTasks';
import { COLORS, SPACING, STORAGE_KEYS } from '../constants';
import type { RiskScoreResponse, RiskCategory } from '../types';

export default function HomeScreen() {
  const location = useLocation();
  const { contacts, addContact } = useContacts();

  // ── States ──────────────────────────────────────────────────────────────────
  const [userName, setUserName] = useState<string>('User');
  const [isSafetyActive, setIsSafetyActive] = useState(false);
  const { riskData, isLoading: isRiskLoading } = useRisk();
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  // Dead-Man's Timer States
  const [timerSeconds, setTimerSeconds] = useState(1200); 
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Initialization ──────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.USER_NAME).then((n) => {
      if (n) setUserName(n);
    });
    configureNotifications();
    return () => {
       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // ── Risk Polling (Removed: Now handled globally by RiskProvider) ───────────

  // ── Animations ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isSafetyActive) {
      if (timerSeconds < 60) {
        // High urgency pulse & shake
        Animated.parallel([
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ])
          ),
          Animated.loop(
             Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 2, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -2, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
             ])
          )
        ]).start();
      } else if (timerSeconds < 300) {
        // Medium urgency steady pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
        shakeAnim.setValue(0);
      }
    } else {
      pulseAnim.setValue(1);
      shakeAnim.setValue(0);
    }
  }, [isSafetyActive, timerSeconds < 60, timerSeconds < 300]);

  // ── Safety Mode & Timer Logic ────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const handleSOSConfirmed = useCallback(async (isAutoTrigger = false) => {
    if (!location.latitude || !location.longitude) {
      Alert.alert('Location Unavailable', 'Cannot send SOS without location fix.');
      return;
    }
    
    setIsSafetyActive(false);
    stopTimer();

    setIsSendingSOS(true);
    try {
      triggerSOS({
        latitude: location.latitude,
        longitude: location.longitude,
      }).catch(() => {});

      const typeStr = isAutoTrigger ? "[TIMER EXPIRED] " : "";
      const smsBody = `🚨 ${typeStr}VEERA SOS ALERT 🚨\nI haven't checked in as safe.\nLocation: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      
      const phoneNumbers = ['100', '112'];
      contacts.forEach(c => {
        if (c.phone) phoneNumbers.push(c.phone);
      });

      const smsUrl = Platform.OS === 'ios' 
        ? `sms:${phoneNumbers.join(',')}?&body=${encodeURIComponent(smsBody)}`
        : `sms:${phoneNumbers.join(',')}?body=${encodeURIComponent(smsBody)}`;

      await Linking.openURL(smsUrl);
    } catch (e: any) {
      Alert.alert('SOS Failed', e.message);
    } finally {
      setIsSendingSOS(false);
    }
  }, [location.latitude, location.longitude, contacts, stopTimer]);

  const startTimer = useCallback((durationSeconds: number) => {
    stopTimer();
    setTimerSeconds(durationSeconds);
    
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          stopTimer();
          handleSOSConfirmed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer, handleSOSConfirmed]);

  const handleSafetyToggle = useCallback(async (newValue: boolean) => {
     if (newValue) {
        if (location.latitude) {
            const trackingBody = `🛡️ [VEERA PROTECTION ACTIVE]\nI've started a safety session. Track me here: https://maps.google.com/?q=${location.latitude},${location.longitude}\n(Do not worry, this is proactive)`;
            
            const numbers = ['100', '112'];
            contacts.forEach(c => { if(c.phone) numbers.push(c.phone) });
            
            const separator = Platform.OS === 'ios' ? '&' : '?';
            const smsUrl = `sms:${numbers.join(',')}${separator}body=${encodeURIComponent(trackingBody)}`;
            
            Alert.alert(
                "Broadcast Location", 
                `Broadcasting live tracking to ${numbers.length} recipients (including 100/112). Send link now?`,
                [
                    { text: "Skip", onPress: () => {} },
                    { text: "Send Link", onPress: () => Linking.openURL(smsUrl) }
                ]
            );
        }

        setIsSafetyActive(true);
        startTimer(1200); 
        try {
           await startBackgroundLocationTracking();
        } catch (e) {}
     } else {
        setIsSafetyActive(false);
        stopTimer();
        try {
           await stopBackgroundLocationTracking();
        } catch (e) {}
     }
  }, [location.latitude, location.longitude, startTimer, stopTimer, contacts]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const timerTheme = (() => {
    if (timerSeconds < 60) return { color: '#FF3B30', glow: '#FF3B3033' };
    if (timerSeconds < 300) return { color: '#FFCC00', glow: '#FFCC0033' };
    return { color: '#34C759', glow: '#34C75933' };
  })();

  const riskCategory: RiskCategory = (riskData?.risk_category as RiskCategory) ?? 'Unknown';
  const riskValue = riskData?.risk_score ?? riskData?.risk_level;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.greetingHeader}>SAFETY MODE ACTIVE</Text>
            <Text style={styles.userNameHeader} numberOfLines={1}>{userName} 👋</Text>
          </View>
          <View style={[styles.modernSwitch, isSafetyActive ? styles.modernSwitchActive : styles.modernSwitchInactive]}>
            <Text style={[styles.modernSwitchText, { color: isSafetyActive ? '#34C759' : '#8E8E93' }]}>
              {isSafetyActive ? 'GUARD' : 'OFF'}
            </Text>
            <Switch
              trackColor={{ false: '#3a3a3c', true: '#34C759' }}
              thumbColor={isSafetyActive ? '#ffffff' : '#f4f3f4'}
              onValueChange={handleSafetyToggle}
              value={isSafetyActive}
            />
          </View>
        </View>

        <RiskLevelBadge category={riskCategory} score={riskValue} />

        {/* ── NEXT-GEN TIMER BOX ── */}
        {isSafetyActive && (
          <View style={[styles.nextGenTimer, { borderColor: timerTheme.color }]}>
            <View style={[styles.timerBackGlow, { backgroundColor: timerTheme.color }]} />
            
            <View style={styles.timerTopBar}>
              <View style={[styles.timerDot, { backgroundColor: timerTheme.color }]} />
              <Text style={[styles.timerLabel, { color: timerTheme.color }]}>WATCH-OVER-ME ACTIVE</Text>
              <View style={[styles.timerDot, { backgroundColor: timerTheme.color }]} />
            </View>
            
            <Animated.View style={{ transform: [{ scale: pulseAnim }, { translateX: shakeAnim }], alignItems: 'center' }}>
              <Text style={styles.nextGenTimeDisplay}>{formatTime(timerSeconds)}</Text>
            </Animated.View>
            
            <View style={styles.timerDivider} />
            
            <Text style={styles.nextGenTimerDesc}>
               If the timer expires, an automatic emergency broadcast will be sent to all your contacts.
            </Text>
            
            <TouchableOpacity 
               activeOpacity={0.8}
               style={[styles.nextGenSafeBtn, { shadowColor: '#34C759' }]} 
               onPress={() => handleSafetyToggle(false)}
            >
              <Ionicons name="shield-checkmark" size={20} color="white" />
              <Text style={styles.nextGenSafeBtnText} adjustsFontSizeToFit numberOfLines={1}>
                I'M SAFE - TERMINATE SESSION
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Risk Factors */}
        {riskData?.risk_factors?.length ? (
          <View style={styles.factorCardBox}>
            {riskData.risk_factors.map((f, i) => (
              <View key={i} style={styles.factorLine}>
                <Ionicons name="alert-circle" size={14} color="#FFCC00" />
                <Text style={styles.factorLineText}>{f}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <LocationDisplay address={location.address} isLoading={location.isLoading} />

        <SOSButton onSOSConfirmed={() => handleSOSConfirmed(false)} isSending={isSendingSOS} />

        <Text style={styles.sosSmallText}>Triple tap or hold for manual emergency SOS</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleText}>Trusted Circles</Text>
          <QuickContactsBar contacts={contacts} onAddPress={() => setShowAddContact(true)} />
        </View>
      </ScrollView>

      <AddContactModal visible={showAddContact} onClose={() => setShowAddContact(false)} onSave={addContact} currentCount={contacts.length} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000000' },
  scroll: { flex: 1 },
  content: { paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 24,
  },
  greetingHeader: { color: '#8E8E93', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  userNameHeader: { color: 'white', fontSize: 26, fontWeight: '900', marginTop: 4 },
  modernSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
    borderRadius: 30,
    borderWidth: 1.5,
    height: 50,
  },
  modernSwitchActive: { backgroundColor: 'rgba(52, 199, 89, 0.05)', borderColor: '#34C759' },
  modernSwitchInactive: { backgroundColor: '#1C1C1E', borderColor: '#3A3A3C' },
  modernSwitchText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  // NEXT-GEN TIMER BOX STYLES
  nextGenTimer: {
    backgroundColor: '#0A0A0A',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  timerBackGlow: {
    position: 'absolute',
    top: -50,
    width: '120%',
    height: 100,
    opacity: 0.1,
    borderRadius: 100,
  },
  timerTopBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  timerDot: { width: 6, height: 6, borderRadius: 3 },
  timerLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2.5 },
  nextGenTimeDisplay: { 
     fontSize: 76, 
     fontWeight: '900', 
     color: 'white',
     fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
     letterSpacing: -4,
     textShadowColor: 'rgba(255, 255, 255, 0.1)',
     textShadowOffset: { width: 0, height: 0 },
     textShadowRadius: 10,
  },
  timerDivider: { width: 40, height: 2, backgroundColor: '#3A3A3C', marginVertical: 16, borderRadius: 1 },
  nextGenTimerDesc: { color: '#8E8E93', fontSize: 12, textAlign: 'center', marginBottom: 24, lineHeight: 18, paddingHorizontal: 10 },
  nextGenSafeBtn: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  nextGenSafeBtnText: { color: 'white', fontWeight: '900', fontSize: 12, letterSpacing: 1.2 },

  factorCardBox: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#1C1C1E', borderRadius: 20, padding: 18, gap: 10 },
  factorLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factorLineText: { color: '#E5E5EA', fontSize: 13, flex: 1 },
  sosSmallText: { textAlign: 'center', color: '#8E8E93', fontSize: 12, marginTop: 24 },
  sectionHeader: { marginTop: 40 },
  sectionTitleText: { color: 'white', fontWeight: '900', fontSize: 20, paddingHorizontal: 20, marginBottom: 14 },
});
