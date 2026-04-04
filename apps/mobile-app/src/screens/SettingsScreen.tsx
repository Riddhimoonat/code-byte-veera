import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, STORAGE_KEYS, SOS_HOLD_DURATION_MS } from '../constants';

const SOS_DURATIONS = [1000, 2000, 3000, 4000, 5000];

export default function SettingsScreen() {
  const [userName, setUserName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sosDuration, setSosDuration] = useState(SOS_HOLD_DURATION_MS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [n, duration] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.SOS_SENSITIVITY)
      ]);
      if (n) setUserName(n);
      if (duration) setSosDuration(parseInt(duration, 10));
    })();
  }, []);

  const handleSave = async () => {
    if (!userName.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, userName.trim()),
        AsyncStorage.setItem(STORAGE_KEYS.SOS_SENSITIVITY, sosDuration.toString())
      ]);
      Alert.alert('Saved', 'Your settings have been saved.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    Alert.alert('Clear Data', 'This will remove your name and contacts from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
          setUserName('');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* ── Profile Section ─────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>PROFILE</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
            <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save Profile'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── SOS Sensitivity ─────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>SOS SENSITIVITY</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Hold Duration to Trigger SOS</Text>
          <Text style={styles.sublabel}>
            Current: {sosDuration / 1000}s — Longer = safer against accidental triggers
          </Text>
          <View style={styles.durationRow}>
            {SOS_DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, sosDuration === d && styles.durationChipActive]}
                onPress={() => setSosDuration(d)}
              >
                <Text
                  style={[
                    styles.durationText,
                    sosDuration === d && styles.durationTextActive,
                  ]}
                >
                  {d / 1000}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.noteText}>
            Note: Changes take effect on next app restart.
          </Text>
        </View>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Risk Alert Notifications</Text>
              <Text style={styles.sublabel}>
                Receive a push alert when your risk score exceeds 75/100
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ── About ───────────────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="shield" size={20} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Veera Safety</Text>
              <Text style={styles.sublabel}>Version 1.0.0 — Built for TIC 2K26</Text>
            </View>
          </View>
          <View style={[styles.row, { marginTop: SPACING.sm }]}>
            <Ionicons name="server-outline" size={20} color={COLORS.textMuted} />
            <Text style={[styles.sublabel, { flex: 1 }]}>
              Backend: {process.env.EXPO_PUBLIC_API_BASE_URL ?? 'Not configured'}
            </Text>
          </View>
        </View>

        {/* ── Danger Zone ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>DANGER ZONE</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleLogout}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          <Text style={styles.dangerText}>Clear All Local Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.sm },
  pageTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  label: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  sublabel: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textPrimary,
    padding: SPACING.sm,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  durationChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  durationChipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  durationText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  durationTextActive: { color: COLORS.primary },
  noteText: { color: COLORS.textMuted, fontSize: 11, marginTop: SPACING.xs },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: SPACING.md,
    borderRadius: 12,
  },
  dangerText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
});
