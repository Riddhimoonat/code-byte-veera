import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SOS_HOLD_DURATION_MS, SOS_CANCEL_WINDOW_SECONDS, SPACING } from '../constants';

interface SOSButtonProps {
  onSOSConfirmed: () => Promise<void>;
  isSending: boolean;
}

/**
 * WHY THIS ARCHITECTURE:
 * The prototype used a plain TouchableOpacity with onPress — single tap = SOS.
 * This is dangerous: a user could accidentally trigger SOS by brushing the screen.
 *
 * The spec requires:
 *   1. Press AND HOLD for 3 seconds to arm  (delayLongPress equivalent)
 *   2. Then a 5-second cancel window before the API call fires
 *   3. Haptic feedback during hold so user knows it's working
 *
 * Implementation:
 *   - We use Pressable with onLongPress (delayLongPress={3000})
 *   - During hold, an animated ring fills (visual progress)
 *   - On long press success: modal opens with 5-second countdown
 *   - User can cancel; if no cancel, triggerSOS() is called at T=0
 */
export default function SOSButton({ onSOSConfirmed, isSending }: SOSButtonProps) {
  const [isArmed, setIsArmed] = useState(false);
  const [countdown, setCountdown] = useState(SOS_CANCEL_WINDOW_SECONDS);
  const [isHolding, setIsHolding] = useState(false);

  const ringAnim = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdAnim = useRef<Animated.CompositeAnimation | null>(null);

  // ── Start hold animation + haptics ─────────────────────────────────────────
  const handlePressIn = useCallback(() => {
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    holdAnim.current = Animated.timing(ringAnim, {
      toValue: 1,
      duration: SOS_HOLD_DURATION_MS,
      useNativeDriver: false,
    });
    holdAnim.current.start();
  }, [ringAnim]);

  // ── Cancel hold (released before 3s) ───────────────────────────────────────
  const handlePressOut = useCallback(() => {
    setIsHolding(false);
    holdAnim.current?.stop();
    Animated.timing(ringAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [ringAnim]);

  // ── 3-second hold completed: arm the SOS ───────────────────────────────────
  const handleLongPress = useCallback(() => {
    setIsHolding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsArmed(true);
    setCountdown(SOS_CANCEL_WINDOW_SECONDS);

    let remaining = SOS_CANCEL_WINDOW_SECONDS;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        setIsArmed(false);
        ringAnim.setValue(0);
        // Fire the actual SOS
        onSOSConfirmed();
      }
    }, 1000);
  }, [onSOSConfirmed, ringAnim]);

  // ── Cancel during countdown window ─────────────────────────────────────────
  const handleCancel = useCallback(() => {
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
      {/* ── SOS BUTTON ─────────────────────────────────────────────────────── */}
      <View style={styles.wrapper}>
        {/* Animated ring that fills as user holds */}
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
          delayLongPress={SOS_HOLD_DURATION_MS}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Text style={styles.label}>SOS</Text>
              <Text style={styles.hint}>Hold 3s</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* ── 5-SECOND CANCEL MODAL ──────────────────────────────────────────── */}
      <Modal
        visible={isArmed}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🚨 SOS Arming</Text>
            <Text style={styles.modalCountdown}>{countdown}</Text>
            <Text style={styles.modalBody}>
              SOS will be sent in {countdown} second{countdown !== 1 ? 's' : ''}.{'\n'}
              Emergency contacts and nearest police will be notified.
            </Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>✕  Cancel SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  ring: {
    position: 'absolute',
    borderWidth: 4,
    opacity: 0.6,
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  buttonPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.96 }],
  },
  label: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 4,
  },
  hint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 20,
    padding: SPACING.xl,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.critical,
  },
  modalTitle: {
    color: COLORS.critical,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  modalCountdown: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 80,
  },
  modalBody: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  cancelBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  cancelText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
