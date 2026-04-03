import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  RefreshControl,
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
import { fetchRiskScore, triggerSOS } from '../services/api';
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

  const [userName, setUserName] = useState<string>('User');
  const [isSafetyActive, setIsSafetyActive] = useState(false);
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  // Load userName from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.USER_NAME).then((n) => {
      if (n) setUserName(n);
    });
    configureNotifications();
  }, []);

  // ── Poll risk score every 30s when in foreground (spec requirement) ─────────
  // Background polling is handled by the background task (60s interval).
  // This foreground poll updates the UI badge when the app is visible.
  useEffect(() => {
    if (!isSafetyActive || !location.latitude) return;

    const poll = async () => {
      try {
        const result = await fetchRiskScore({
          latitude: location.latitude!,
          longitude: location.longitude!,
          timestamp: new Date().toISOString(),
        });
        setRiskData(result);
      } catch (_) {
        // Silent fail — badge simply stays at last known value
      }
    };

    poll(); // immediate on activate
    const interval = setInterval(poll, 30_000); // then every 30s
    return () => clearInterval(interval);
  }, [isSafetyActive, location.latitude, location.longitude]);

  // ── Safety Mode toggle ───────────────────────────────────────────────────────
  const handleSafetyToggle = useCallback(async () => {
    try {
      if (!isSafetyActive) {
        await startBackgroundLocationTracking();
        setIsSafetyActive(true);
      } else {
        await stopBackgroundLocationTracking();
        setIsSafetyActive(false);
        setRiskData(null);
      }
    } catch (e: any) {
      Alert.alert('Permission Required', e.message);
    }
  }, [isSafetyActive]);

  // ── SOS confirmed (fires after 5-second cancel window in SOSButton) ──────────
  /**
   * WHY: No native SMS here. We POST to backend; backend dispatches Twilio SMS
   * to all contacts AND nearest police station, inserts sos_events row,
   * and emits socket.io event to the admin dashboard.
   */
  const handleSOSConfirmed = useCallback(async () => {
    if (!location.latitude || !location.longitude) {
      Alert.alert('Location Unavailable', 'Cannot send SOS without location fix.');
      return;
    }
    setIsSendingSOS(true);
    try {
      const result = await triggerSOS({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      Alert.alert(
        '🚨 SOS Sent',
        `${result.contacts_notified} contact(s) notified.\nNearest station: ${result.police_station_notified}`,
        [{ text: 'OK' }]
      );
    } catch (e: any) {
      Alert.alert('SOS Failed', e.message ?? 'Could not reach backend. Please call 100.');
    } finally {
      setIsSendingSOS(false);
    }
  }, [location.latitude, location.longitude]);

  // ── Pull-to-refresh ──────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (!location.latitude) return;
    setIsRefreshing(true);
    try {
      const result = await fetchRiskScore({
        latitude: location.latitude,
        longitude: location.longitude!,
        timestamp: new Date().toISOString(),
      });
      setRiskData(result);
    } catch (_) {}
    setIsRefreshing(false);
  }, [location.latitude, location.longitude]);

  const riskCategory: RiskCategory =
    (riskData?.risk_category as RiskCategory) ?? 'Unknown';

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{userName} 👋</Text>
          </View>
          {/* Safety mode toggle pill */}
          <View
            style={[styles.modePill, isSafetyActive ? styles.modeActive : styles.modeInactive]}
          >
            <Ionicons
              name={isSafetyActive ? 'shield-checkmark' : 'shield-outline'}
              size={16}
              color={isSafetyActive ? COLORS.success : COLORS.textMuted}
            />
            <Text
              style={[
                styles.modeText,
                { color: isSafetyActive ? COLORS.success : COLORS.textMuted },
              ]}
              onPress={handleSafetyToggle}
            >
              {isSafetyActive ? 'Safety ON' : 'Safety OFF'}
            </Text>
          </View>
        </View>

        {/* ── Risk Badge ──────────────────────────────────────────────────── */}
        <RiskLevelBadge category={riskCategory} score={riskData?.risk_level} />

        {/* ── Risk Factors ────────────────────────────────────────────────── */}
        {riskData?.risk_factors?.length ? (
          <View style={styles.factorsCard}>
            {riskData.risk_factors.map((f, i) => (
              <View key={i} style={styles.factorRow}>
                <Ionicons name="warning-outline" size={14} color={COLORS.warning} />
                <Text style={styles.factorText}>{f}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Location ────────────────────────────────────────────────────── */}
        <LocationDisplay address={location.address} isLoading={location.isLoading} />

        {/* ── SOS BUTTON ──────────────────────────────────────────────────── */}
        <SOSButton onSOSConfirmed={handleSOSConfirmed} isSending={isSendingSOS} />

        <Text style={styles.sosHint}>
          Hold the button for 3 seconds to trigger SOS
        </Text>

        {/* ── Quick Contacts ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <QuickContactsBar contacts={contacts} onAddPress={() => setShowAddContact(true)} />
        </View>
      </ScrollView>

      <AddContactModal
        visible={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSave={addContact}
        currentCount={contacts.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  greeting: { color: COLORS.textSecondary, fontSize: 14 },
  userName: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 2 },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeActive: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderColor: COLORS.success,
  },
  modeInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  modeText: { fontSize: 12, fontWeight: '700' },
  factorsCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  factorText: { color: COLORS.textSecondary, fontSize: 13, flex: 1 },
  sosHint: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SPACING.md,
  },
  section: { marginTop: SPACING.xl },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
});
