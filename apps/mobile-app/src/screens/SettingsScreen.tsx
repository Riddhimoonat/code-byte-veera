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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, STORAGE_KEYS, SOS_HOLD_DURATION_MS } from '../constants';
import { RootStackParamList } from '../types';
import { toggleVolunteerMode, updateVolunteerLocation } from '../services/api';
import { useLocation } from '../hooks/useLocation';

const SOS_DURATIONS = [1000, 2000, 3000, 4000, 5000];

export default function SettingsScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList> }) {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [volunteerEnabled, setVolunteerEnabled] = useState(false);
  const [sosDuration, setSosDuration] = useState(SOS_HOLD_DURATION_MS);
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const [n, phone, duration, vol] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PHONE),
        AsyncStorage.getItem(STORAGE_KEYS.SOS_SENSITIVITY),
        AsyncStorage.getItem(STORAGE_KEYS.VOLUNTEER_ENABLED),
      ]);
      if (n) setUserName(n);
      if (phone) setUserPhone(phone);
      if (duration) setSosDuration(parseInt(duration, 10));
      if (vol) setVolunteerEnabled(vol === 'true');
    })();
  }, []);

  const handleToggleVolunteer = async (val: boolean) => {
    try {
      setVolunteerEnabled(val);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.VOLUNTEER_ENABLED, val.toString()),
        toggleVolunteerMode(val)
      ]);
      
      if (val && location.latitude) {
        updateVolunteerLocation(location.latitude, location.longitude!);
      }

      Alert.alert(
        val ? 'Volunteer Mode On' : 'Volunteer Mode Off',
        val 
          ? 'You will now receive alerts for nearby SOS events. Your location is periodically synced securely.' 
          : 'You will no longer receive nearby community alerts.'
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to change responder status.');
      setVolunteerEnabled(!val);
    }
  };

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
    Alert.alert('Log Out', 'Are you sure you want to log out from Veera?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          // Clear all Auth and project data
          const keys = Object.values(STORAGE_KEYS);
          await AsyncStorage.multiRemove(keys);
          
          // Reset navigation to Onboarding
          navigation.getParent()?.navigate('Onboarding');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* ── Profile Section ─────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>MY ACCOUNT</Text>
        <View style={styles.card}>
          <View style={styles.profileInfo}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarTxt}>{userName[0] || 'V'}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{userName || 'Veera User'}</Text>
              <Text style={styles.profilePhone}>Locked to {userPhone || 'Unlinked'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
            <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save Changes'}</Text>
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

        {/* ── Community Responder ─────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>COMMUNITY RESPONDER</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="people-circle-outline" size={24} color={COLORS.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Volunteer Safety Mode</Text>
              <Text style={styles.sublabel}>
                Receive SOS alerts from nearby users (within 5km). Help keep your community safe.
              </Text>
            </View>
            <Switch
              value={volunteerEnabled}
              onValueChange={handleToggleVolunteer}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor="#fff"
            />
          </View>
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
              <Text style={styles.sublabel}>Version 1.0.0 — TIC 2K26 Edition</Text>
            </View>
          </View>
        </View>

        {/* ── Danger Zone ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>SESSION</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out of Veera</Text>
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
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarTxt: { color: COLORS.primary, fontSize: 24, fontWeight: '800' },
  profileName: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  profilePhone: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
    opacity: 0.5,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.sm,
  },
  logoutText: { color: COLORS.danger, fontWeight: '800', fontSize: 15 },
});
