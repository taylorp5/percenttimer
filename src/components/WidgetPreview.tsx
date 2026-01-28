import { StyleSheet, Text, View } from 'react-native';

import { ThemeColors } from '../theme';

type Props = {
  title: string;
  size: 'small' | 'medium' | 'circular' | 'rectangular';
  colors: ThemeColors;
};

export const WidgetPreview = ({ title, size, colors }: Props) => {
  const containerStyle =
    size === 'small'
      ? styles.small
      : size === 'medium'
      ? styles.medium
      : size === 'circular'
      ? styles.circular
      : styles.rectangular;

  return (
    <View
      style={[
        styles.card,
        containerStyle,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {size === 'circular' ? (
        <View style={[styles.ring, { borderColor: colors.progressFill }]}>
          <Text style={[styles.percent, { color: colors.text }]}>42%</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.percent, { color: colors.text }]}>42%</Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack }]}>
            <View
              style={[styles.progressFill, { backgroundColor: colors.progressFill, width: '42%' }]}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  percent: {
    fontSize: 20,
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
  small: {
    width: 150,
  },
  medium: {
    width: 300,
  },
  circular: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rectangular: {
    width: 220,
  },
  ring: {
    width: 80,
    height: 80,
    borderRadius: 999,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
