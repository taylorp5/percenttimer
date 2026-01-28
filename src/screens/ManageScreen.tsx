import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

import { RootStackParamList } from '../AppNavigator';
import { accentColorMap, getThemeColors } from '../theme';
import { setState, useAppState } from '../storage/state';
import { refreshWidgets } from '../storage/sharedStateBridge';
import { AccentColor, ThemeMode } from '../types';
import { minutesToTime } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Manage'>;

const themeOptions: ThemeMode[] = ['system', 'light', 'dark'];
const accentOptions: AccentColor[] = ['blue', 'green', 'orange', 'purple', 'pink', 'teal'];

export const ManageScreen = (_props: Props) => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);
  const [showPicker, setShowPicker] = useState(false);
  const [dayStartDate, setDayStartDate] = useState(() => {
    const date = new Date();
    date.setHours(
      Math.floor(state.settings.dayStartMinutes / 60),
      state.settings.dayStartMinutes % 60,
      0,
      0
    );
    return date;
  });

  useEffect(() => {
    const date = new Date();
    date.setHours(
      Math.floor(state.settings.dayStartMinutes / 60),
      state.settings.dayStartMinutes % 60,
      0,
      0
    );
    setDayStartDate(date);
  }, [state.settings.dayStartMinutes]);

  const updateSettings = (partial: Partial<typeof state.settings>) => {
    void setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...partial,
      },
    }));
  };

  const updateMetricEnabled = (key: keyof typeof state.settings.enabledMetrics, value: boolean) => {
    void setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        enabledMetrics: {
          ...prev.settings.enabledMetrics,
          [key]: value,
        },
      },
    }));
  };

  const handleDayStartChange = (event: { type?: string }, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') return;
    const nextDate = selectedDate ?? dayStartDate;
    setDayStartDate(nextDate);
    const minutes = nextDate.getHours() * 60 + nextDate.getMinutes();
    updateSettings({ dayStartMinutes: minutes });
    void refreshWidgets();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Widgets</Text>
      <Pressable
        onPress={() => void refreshWidgets()}
        style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
      >
        <Text style={styles.primaryButtonText}>Refresh Widgets</Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Metrics</Text>
      <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]}>Day</Text>
        <Switch
          value={state.settings.enabledMetrics.day}
          onValueChange={(value) => updateMetricEnabled('day', value)}
        />
      </View>
      <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]}>Week</Text>
        <Switch
          value={state.settings.enabledMetrics.week}
          onValueChange={(value) => updateMetricEnabled('week', value)}
        />
      </View>
      <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]}>Month</Text>
        <Switch
          value={state.settings.enabledMetrics.month}
          onValueChange={(value) => updateMetricEnabled('month', value)}
        />
      </View>
      <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]}>Year</Text>
        <Switch
          value={state.settings.enabledMetrics.year}
          onValueChange={(value) => updateMetricEnabled('year', value)}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Day Starts At</Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[styles.row, styles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]}>
          {minutesToTime(state.settings.dayStartMinutes)}
        </Text>
      </Pressable>
      {showPicker ? (
        <View style={[styles.pickerCard, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <DateTimePicker
            value={dayStartDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDayStartChange}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setShowPicker(false)} style={styles.pickerDone}>
              <Text style={[styles.optionText, { color: colors.text }]}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <Text style={[styles.helperText, { color: colors.mutedText }]}
      >
        Your “day” runs from this time to the same time the next day.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
      <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]}>Show Label</Text>
        <Switch
          value={state.settings.showLabel}
          onValueChange={(value) => updateSettings({ showLabel: value })}
        />
      </View>

      <Text style={[styles.subTitle, { color: colors.mutedText }]}>Theme</Text>
      <View style={styles.optionRow}>
        {themeOptions.map((option) => {
          const selected = state.settings.theme === option;
          return (
            <Pressable
              key={option}
              onPress={() => updateSettings({ theme: option })}
              style={[
                styles.optionButton,
                {
                  borderColor: selected ? colors.progressFill : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.subTitle, { color: colors.mutedText }]}>Accent</Text>
      <View style={styles.accentRow}>
        {accentOptions.map((option) => {
          const selected = state.settings.accentColor === option;
          return (
            <Pressable
              key={option}
              onPress={() => updateSettings({ accentColor: option })}
              style={[
                styles.accentSwatch,
                {
                  backgroundColor: accentColorMap[option],
                  borderColor: selected ? colors.text : colors.border,
                },
              ]}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6,
  },
  subTitle: {
    fontSize: 13,
    marginTop: 8,
  },
  row: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputRow: {
    justifyContent: 'flex-start',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
  },
  pickerCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 8,
  },
  pickerDone: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  accentRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  accentSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
