import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SOS_HOLD_DURATION_MS, SOS_CANCEL_WINDOW_SECONDS, STORAGE_KEYS } from '../constants';

export default function SOSButton({ onSOSConfirmed, isSending }: { onSOSConfirmed: () => Promise<void>, isSending: boolean }) {
  const [isArmed, setIsArmed] = React.useState(false);
  const [countdown, setCountdown] = React.useState(SOS_CANCEL_WINDOW_SECONDS);
  const [isHolding, setIsHolding] = React.useState(false);
  const [activeHoldDuration, setActiveHoldDuration] = React.useState(SOS_HOLD_DURATION_MS);

  const ringAnim = React.useRef(new Animated.Value(0)).current;
  const countdownRef = React.useRef<any>(null);
  const holdAnim = React.useRef<Animated.CompositeAnimation | null>(null);

  // ── Load sensitivity on mount ──────────────────────────────────────────────
  React.useEffect(() => {
    const loadSensitivity = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SOS_SENSITIVITY);
        if (stored) {
          setActiveHoldDuration(parseInt(stored, 10));
        }
      } catch (e) {
        console.log("Error loading SOS sensitivity", e);
      }
    };
    loadSensitivity();
  }, []);

  // ── Start hold animation + haptics ─────────────────────────────────────────
  const handlePressIn = React.useCallback(() => {
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    holdAnim.current = Animated.timing(ringAnim, {
      toValue: 1,
      duration: activeHoldDuration || 3000,
      useNativeDriver: false,
    });
    holdAnim.current.start();
  }, [ringAnim, activeHoldDuration]);

  // ── Cancel hold ─────────────────────────────────────────────────────────────
  const handlePressOut = React.useCallback(() => {
    setIsHolding(false);
    holdAnim.current?.stop();
    Animated.timing(ringAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [ringAnim]);

  // ── Arm the SOS ─────────────────────────────────────────────────────────────
  const handleLongPress = React.useCallback(() => {
    setIsHolding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsArmed(true);
    setCountdown(SOS_CANCEL_WINDOW_SECONDS);

    let remaining = SOS_CANCEL_WINDOW_SECONDS;
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setIsArmed(false);
        ringAnim.setValue(0);
        onSOSConfirmed();
      }
    }, 1000);
  }, [onSOSConfirmed, ringAnim]);

  const handleCancel = React.useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIsArmed(false);
    setCountdown(SOS_CANCEL_WINDOW_SECONDS);
    ringAnim.setValue(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [ringAnim]);

  const ringColor = ringAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.primary, COLORS.warning, COLORS.critical],
  });

  const ringSize = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 240],
  });

  return (
    <>
      <View style={styles.wrapper}>
        {isHolding && (
          <Animated.View
            style={[
              styles.ring,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: 120,
                borderColor: ringColor,
              },
            ]}
          />
        )}

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          delayLongPress={activeHoldDuration || 3000}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Text style={styles.label}>SOS</Text>
              <Text style={styles.hint}>Hold {(activeHoldDuration || 3000) / 1000}s</Text>
            </>
          )}
        </Pressable>
      </View>

      <Modal visible={isArmed} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🚨 SOS Alerting</Text>
            <Text style={styles.modalCountdown}>{countdown}</Text>
            <Text style={styles.modalBody}>
              Sending emergency alerts in {countdown}s...
            </Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>✕  CANCEL SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  ring: { position: 'absolute', borderWidth: 4, opacity: 0.6 },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  buttonPressed: { backgroundColor: COLORS.primaryDark, transform: [{ scale: 0.96 }] },
  label: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: 4 },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  modalCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.critical,
  },
  modalTitle: { color: COLORS.critical, fontSize: 24, fontWeight: '900', marginBottom: 16 },
  modalCountdown: { color: 'white', fontSize: 80, fontWeight: '900' },
  modalBody: { color: '#9191a8', textAlign: 'center', marginVertical: 20, fontSize: 16 },
  cancelBtn: { backgroundColor: '#2e2e3e', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  cancelText: { color: 'white', fontSize: 16, fontWeight: '800' },
});
