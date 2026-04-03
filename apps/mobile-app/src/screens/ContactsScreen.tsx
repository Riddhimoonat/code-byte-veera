import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useContacts } from '../hooks/useContacts';
import AddContactModal from '../components/AddContactModal';
import { COLORS, SPACING, MAX_CONTACTS } from '../constants';
import type { EmergencyContact } from '../types';

export default function ContactsScreen() {
  const { contacts, isLoading, addContact, deleteContact } = useContacts();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = (contact: EmergencyContact) => {
    Alert.alert(
      'Remove Contact',
      `Remove ${contact.name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteContact(contact.id),
        },
      ]
    );
  };

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <View style={styles.contactCard}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.initials}>
          {item.name
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase())
            .join('')}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>+91 {item.phone}</Text>
        <View style={styles.relationChip}>
          <Text style={styles.relationText}>{item.relationship}</Text>
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>
            {contacts.length}/{MAX_CONTACTS} contacts •{' '}
            {contacts.length === 0
              ? 'Add at least one contact'
              : 'Notified automatically via SOS'}
          </Text>
        </View>
        {contacts.length < MAX_CONTACTS && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Warning banner */}
      {contacts.length === 0 && !isLoading && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={16} color={COLORS.warning} />
          <Text style={styles.warningText}>
            No emergency contacts. Add at least one so you can be reached during an SOS.
          </Text>
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={56} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Contacts Yet</Text>
              <Text style={styles.emptyBody}>
                Add up to {MAX_CONTACTS} people who will receive an SMS with your
                location when you trigger SOS.
              </Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowModal(true)}>
                <Text style={styles.emptyAddText}>+ Add First Contact</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Info footer */}
      {contacts.length > 0 && (
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.footerText}>
            Contacts are saved locally and SMS is sent via our secure backend.
          </Text>
        </View>
      )}

      <AddContactModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={addContact}
        currentCount={contacts.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  warningText: { color: COLORS.warning, fontSize: 13, flex: 1 },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.sm },
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
  info: { flex: 1, gap: 4 },
  contactName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  contactPhone: { color: COLORS.textSecondary, fontSize: 13 },
  relationChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  relationText: { color: COLORS.textMuted, fontSize: 11 },
  deleteBtn: {
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '700' },
  emptyBody: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyAddBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  emptyAddText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
});
