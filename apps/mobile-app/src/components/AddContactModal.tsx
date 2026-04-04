import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, MAX_CONTACTS, STORAGE_KEYS } from '../constants';
import type { EmergencyContact } from '../types';

const RELATIONSHIPS = ['Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Partner', 'Other'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  currentCount: number;
}

const isValidIndianPhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
};

export default function AddContactModal({ visible, onClose, onSave, currentCount }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userOwnPhone, setUserOwnPhone] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await AsyncStorage.getItem(STORAGE_KEYS.USER_PHONE);
      if (p) setUserOwnPhone(p.replace(/\D/g, ''));
    })();
  }, []);

  const reset = useCallback(() => {
    setName('');
    setPhone('');
    setRelationship('');
    setPhoneError(null);
    setIsSaving(false);
  }, []);

  const handleModalClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    const digits = phone.replace(/\D/g, '');
    
    if (!isValidIndianPhone(digits)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number (starts with 6-9).');
      return;
    }

    if (userOwnPhone && digits === userOwnPhone) {
      setPhoneError("You cannot add your own number as an emergency contact.");
      return;
    }

    if (!relationship) return;

    setIsSaving(true);
    try {
      await onSave({ name: trimmedName, phone: digits, relationship });
      reset();
      onClose();
    } catch (e: any) {
      setPhoneError(e.message ?? 'Failed to save contact.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleModalClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Emergency Contact</Text>
            <Text style={styles.capacity}>
              {currentCount}/{MAX_CONTACTS} contacts
            </Text>
          </View>

          {/* Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Priya Sharma"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Phone */}
          <Text style={styles.label}>Phone Number (India)</Text>
          <TextInput
            style={[styles.input, phoneError ? styles.inputError : null]}
            placeholder="e.g. 9876543210"
            placeholderTextColor={COLORS.textMuted}
            value={phone}
            onChangeText={(t) => {
              setPhone(t.replace(/\D/g, '').slice(0, 10));
              if (phoneError) setPhoneError(null);
            }}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}

          {/* Relationship picker */}
          <Text style={styles.label}>Relationship</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {RELATIONSHIPS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, relationship === r && styles.chipActive]}
                onPress={() => setRelationship(r)}
              >
                <Text style={[styles.chipText, relationship === r && styles.chipTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleModalClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!name || !phone || !relationship) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving || !name || !phone || !relationship}
            >
              <Text style={styles.saveText}>{isSaving ? 'Saving…' : 'Save Contact'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  capacity: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textPrimary,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  chipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
