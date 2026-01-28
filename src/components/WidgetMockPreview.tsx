import { StyleSheet, Text, View } from 'react-native';

type Size = 'small' | 'medium';

type Props = {
  size: Size;
  percent: number;
  label: string;
  accentColor: string;
};

const sizeMap: Record<Size, { width: number; height: number; percentSize: number; padding: number }> = {
  small: { width: 150, height: 150, percentSize: 28, padding: 12 },
  medium: { width: 260, height: 150, percentSize: 36, padding: 16 },
};

export const WidgetMockPreview = ({ size, percent, label, accentColor }: Props) => {
  const sizing = sizeMap[size];
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={[styles.card, { width: sizing.width, height: sizing.height, padding: sizing.padding }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.percent, { fontSize: sizing.percentSize }]}>{clamped}%</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: accentColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0000001A',
    backgroundColor: '#FFFFFF',
    gap: 8,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#888888',
  },
  percent: {
    fontWeight: '700',
    color: '#111111',
  },
  progressTrack: {
    height: 6,
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#00000014',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
