import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants';

interface Props {
  address: string | null;
  isLoading: boolean;
}

export default function LocationDisplay({ address, isLoading }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.textSecondary} />
      ) : (
        <Text style={styles.text} numberOfLines={2}>
          {address ?? 'Location unavailable'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginTop: SPACING.md,
  },
  text: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
