import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import type { RiskCategory } from '../types';

interface Props {
  category: RiskCategory;
  score?: number;
}

const CONFIG: Record<RiskCategory, { color: string; bg: string; icon: string }> = {
  Low:      { color: COLORS.riskLow,     bg: 'rgba(34,197,94,0.15)',    icon: '🟢' },
  Medium:   { color: COLORS.riskMedium,  bg: 'rgba(245,158,11,0.15)',   icon: '🟡' },
  High:     { color: COLORS.riskHigh,    bg: 'rgba(239,68,68,0.15)',    icon: '🔴' },
  Critical: { color: COLORS.riskCritical,bg: 'rgba(220,38,38,0.2)',     icon: '🚨' },
  Unknown:  { color: COLORS.riskUnknown, bg: 'rgba(85,85,106,0.15)',    icon: '⬛' },
};

export default function RiskLevelBadge({ category, score }: Props) {
  const cfg = CONFIG[category] ?? CONFIG.Unknown;

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
      <Text style={styles.icon}>{cfg.icon}</Text>
      <Text style={[styles.label, { color: cfg.color }]}>{category}</Text>
      {score !== undefined && (
        <Text style={[styles.score, { color: cfg.color }]}>{score}/100</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
  },
  icon: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  score: { fontSize: 12, fontWeight: '600', opacity: 0.8 },
});
