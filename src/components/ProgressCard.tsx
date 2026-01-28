import { StyleSheet, Text, View } from 'react-native';

import { ThemeColors } from '../theme';

type ProgressCardProps = {
  label: string;
  percent: number;
  showLabel: boolean;
  colors: ThemeColors;
};

export const ProgressCard = ({ label, percent, showLabel, colors }: ProgressCardProps) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
    {showLabel ? (
      <Text style={[styles.label, { color: colors.mutedText }]}>{label}</Text>
    ) : null}
    <Text style={[styles.percent, { color: colors.text }]}>{percent}%</Text>
    <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${percent}%`, backgroundColor: colors.progressFill },
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  percent: {
    fontSize: 36,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
