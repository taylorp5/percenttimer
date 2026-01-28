import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { RootStackParamList } from '../AppNavigator';
import { getThemeColors } from '../theme';
import { useAppState } from '../storage/state';
import { computeProgress } from '../utils/computeProgress';
import { MetricType } from '../types';

type MetricSelection =
  | { kind: 'day' | 'week' | 'month' | 'year' }
  | { kind: 'customRange'; id: string }
  | { kind: 'customDaily'; id: string };

export type TimerScreenParams = {
  metric: MetricSelection;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;

type Segment = {
  key: string;
  label: string;
  selection: MetricSelection;
};

export const TimerScreen = ({ route, navigation }: Props) => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);
  const [selected, setSelected] = useState<MetricSelection>(route.params.metric);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setSelected(route.params.metric);
  }, [route.params.metric]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const metricType: MetricType =
    selected.kind === 'day' ||
    selected.kind === 'week' ||
    selected.kind === 'month' ||
    selected.kind === 'year'
      ? selected.kind
      : { type: selected.kind, id: selected.id };

  const result = useMemo(
    () => computeProgress(metricType, state, new Date(now)),
    [metricType, state, now]
  );

  const hasCustoms =
    state.customRanges.length > 0 || state.customDailyWindows.length > 0;

  const segments = useMemo<Segment[]>(() => {
    const builtIns: Segment[] = [
      { key: 'day', label: 'Day', selection: { kind: 'day' } },
      { key: 'week', label: 'Week', selection: { kind: 'week' } },
      { key: 'month', label: 'Month', selection: { kind: 'month' } },
      { key: 'year', label: 'Year', selection: { kind: 'year' } },
    ];

    if (hasCustoms) {
      builtIns.push({
        key: 'custom',
        label: 'Custom',
        selection: { kind: 'customRange', id: state.customRanges[0]?.id ?? state.customDailyWindows[0]?.id ?? '' },
      });
    }

    return builtIns;
  }, [hasCustoms, state.customRanges, state.customDailyWindows]);

  const selectedKey = useMemo(() => {
    if (selected.kind === 'customRange' || selected.kind === 'customDaily') {
      return 'custom';
    }
    return selected.kind;
  }, [selected]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Timer</Text>
      </View>

      <View style={styles.segmentRow}>
        {segments.map((segment) => {
          const isSelected = selectedKey === segment.key;
          return (
            <Pressable
              key={segment.key}
              onPress={() => setSelected(segment.selection)}
              style={[
                styles.segment,
                {
                  backgroundColor: isSelected ? colors.progressFill : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.segmentText, { color: isSelected ? '#FFFFFF' : colors.text }]}
              >
                {segment.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.content}>
        {state.settings.showLabel ? (
          <Text style={[styles.label, { color: colors.mutedText }]}>{result.label}</Text>
        ) : null}
        <Text style={[styles.percent, { color: colors.text }]}>{result.percentInt}%</Text>
        <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack }]}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${result.percentInt}%`, backgroundColor: colors.progressFill },
            ]}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segment: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
  },
  percent: {
    fontSize: 72,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
