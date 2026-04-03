import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants';
import type { EmergencyContact } from '../types';

interface Props {
  contacts: EmergencyContact[];
  onAddPress: () => void;
}

// Maps relationship strings to icons
const RELATION_ICONS: Record<string, string> = {
  Mother: 'heart',
  Father: 'man',
  Sister: 'woman',
  Brother: 'man',
  Friend: 'people',
  Partner: 'heart',
  other: 'person',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export default function QuickContactsBar({ contacts, onAddPress }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {contacts.map((c) => (
        <View key={c.id} style={styles.contactItem}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{getInitials(c.name)}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {c.name.split(' ')[0]}
          </Text>
        </View>
      ))}

      {/* Always show an Add button at the end */}
      <TouchableOpacity style={styles.addItem} onPress={onAddPress}>
        <View style={[styles.avatar, styles.addAvatar]}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>Add</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  contactItem: { alignItems: 'center', gap: 6, width: 56 },
  addItem: { alignItems: 'center', gap: 6, width: 56 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryGlow,
  },
  addAvatar: {
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  initials: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
});
