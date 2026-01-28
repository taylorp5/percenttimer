import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { ProgressCard } from '../components/ProgressCard';
import { RootStackParamList } from '../AppNavigator';
import { getThemeColors } from '../theme';
import { useAppState } from '../storage/state';
import { computeProgress } from '../utils/computeProgress';
import { DebugPanel } from '../components/DebugPanel';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);
  const enableDebug = __DEV__;
  const [debugVisible, setDebugVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleTitleTap = () => {
    if (!enableDebug) {
      return;
    }
    const next = tapCount + 1;
    if (next >= 7) {
      setTapCount(0);
      setDebugVisible(true);
      return;
    }
    setTapCount(next);
  };

  const metrics = [
    { key: 'day', label: 'Day', type: 'day' as const, enabled: state.settings.enabledMetrics.day },
    { key: 'week', label: 'Week', type: 'week' as const, enabled: state.settings.enabledMetrics.week },
    { key: 'month', label: 'Month', type: 'month' as const, enabled: state.settings.enabledMetrics.month },
    { key: 'year', label: 'Year', type: 'year' as const, enabled: state.settings.enabledMetrics.year },
  ];

  const customRanges = state.customRanges
    .filter((item) => item.enabled)
    .map((item) => ({
      key: `range-${item.id}`,
      type: { type: 'customRange' as const, id: item.id },
      label: item.name,
      selection: { kind: 'customRange' as const, id: item.id },
    }));

  const customDaily = state.customDailyWindows
    .filter((item) => item.enabled)
    .map((item) => ({
      key: `daily-${item.id}`,
      type: { type: 'customDaily' as const, id: item.id },
      label: item.name,
      selection: { kind: 'customDaily' as const, id: item.id },
    }));

  const builtInEnabled = metrics.filter((item) => item.enabled);
  const builtInItems = builtInEnabled.map((item) => ({
    ...item,
    selection: { kind: item.type },
  }));

  const customItems = [...customRanges, ...customDaily];
  const items = [...builtInItems, ...customItems];

  const showEmpty = builtInItems.length === 0 && customItems.length === 0;

  const displayItems = useMemo(() => items, [items]);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <Pressable onPress={handleTitleTap} style={styles.titleWrap}>
        <Text style={[styles.title, { color: colors.text }]}>PercentTime</Text>
      </Pressable>

      <View style={styles.topRow}>
        <Pressable
          onPress={() => navigation.navigate('Manage')}
          style={[styles.topButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.topButtonText, { color: colors.text }]}>Manage</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Custom')}
          style={[styles.topButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.topButtonText, { color: colors.text }]}>Custom</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('WidgetGallery')}
          style={[styles.topButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.topButtonText, { color: colors.text }]}>Widgets</Text>
        </Pressable>
      </View>

      {showEmpty ? (
        <View style={[styles.emptyCard, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing enabled</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedText }]}
          >
            Turn on day, week, month, or year to see progress.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Manage')}
            style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
          >
            <Text style={styles.primaryButtonText}>Enable metrics</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.cardList}>
          {displayItems.map((item) => {
            const result = computeProgress(item.type, state, new Date(now));
            const label = 'label' in item ? item.label : result.label;
            return (
              <Pressable
                key={item.key}
                onPress={() => navigation.navigate('Timer', { metric: item.selection })}
              >
                <ProgressCard
                  label={label}
                  percent={result.percentInt}
                  showLabel={state.settings.showLabel}
                  colors={colors}
                />
              </Pressable>
            );
          })}
        </View>
      )}

      {enableDebug && (
        <DebugPanel
          visible={debugVisible}
          onClose={() => setDebugVisible(false)}
          colors={colors}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  titleWrap: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  topButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  topButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardList: {
    gap: 16,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});



