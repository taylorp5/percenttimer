import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { RootStackParamList } from '../AppNavigator';
import { getThemeColors } from '../theme';
import { setState, useAppState } from '../storage/state';
import { CustomDailyWindow, CustomRange } from '../types';
import { minutesToTime, validateCustomRange, validateDailyWindow } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Custom'>;

type Selection =
  | { kind: 'customRange'; id: string; label: string }
  | { kind: 'customDaily'; id: string; label: string };

type CreateMode = 'range' | 'daily' | null;

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildDate = (base: Date) => new Date(base.getTime());

export const CustomScreen = ({ navigation }: Props) => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [editingRangeId, setEditingRangeId] = useState<string | null>(null);
  const [editingWindowId, setEditingWindowId] = useState<string | null>(null);

  const [rangeName, setRangeName] = useState('');
  const [rangeStart, setRangeStart] = useState(new Date());
  const [rangeEnd, setRangeEnd] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [showRangeStartPicker, setShowRangeStartPicker] = useState(false);
  const [showRangeEndPicker, setShowRangeEndPicker] = useState(false);
  const [showRangeStartTimePicker, setShowRangeStartTimePicker] = useState(false);
  const [showRangeEndTimePicker, setShowRangeEndTimePicker] = useState(false);

  const [windowName, setWindowName] = useState('');
  const [windowStart, setWindowStart] = useState(new Date());
  const [windowEnd, setWindowEnd] = useState(new Date());
  const [showWindowStartPicker, setShowWindowStartPicker] = useState(false);
  const [showWindowEndPicker, setShowWindowEndPicker] = useState(false);

  const options = useMemo<Selection[]>(() => {
    const ranges = state.customRanges.map((item) => ({
      kind: 'customRange' as const,
      id: item.id,
      label: `${item.name} • Date range`,
    }));
    const daily = state.customDailyWindows.map((item) => ({
      kind: 'customDaily' as const,
      id: item.id,
      label: `${item.name} • Daily window`,
    }));
    return [...ranges, ...daily];
  }, [state.customRanges, state.customDailyWindows]);

  const handleOpenTimer = () => {
    if (!selected) {
      Alert.alert('Select a timer', 'Choose a custom timer first.');
      return;
    }
    navigation.navigate('Timer', { metric: { kind: selected.kind, id: selected.id } });
  };

  const handleEditSelected = () => {
    if (!selected) {
      Alert.alert('Select a timer', 'Choose a custom timer first.');
      return;
    }
    if (selected.kind === 'customRange') {
      const item = state.customRanges.find((range) => range.id === selected.id);
      if (!item) return;
      setCreateMode('range');
      setEditingRangeId(item.id);
      setEditingWindowId(null);
      setRangeName(item.name);
      setRangeStart(new Date(item.startISO));
      setRangeEnd(new Date(item.endISO));
      return;
    }
    const item = state.customDailyWindows.find((window) => window.id === selected.id);
    if (!item) return;
    const start = new Date();
    start.setHours(Math.floor(item.startMinute / 60), item.startMinute % 60, 0, 0);
    const end = new Date();
    end.setHours(Math.floor(item.endMinute / 60), item.endMinute % 60, 0, 0);
    setCreateMode('daily');
    setEditingWindowId(item.id);
    setEditingRangeId(null);
    setWindowName(item.name);
    setWindowStart(start);
    setWindowEnd(end);
  };

  const handleCreateRange = () => {
    if (!rangeName.trim()) {
      Alert.alert('Name required', 'Please enter a name.');
      return;
    }
    const validation = validateCustomRange(rangeStart.toISOString(), rangeEnd.toISOString(), new Date());
    if (!validation.valid) {
      Alert.alert('Invalid range', validation.message ?? 'Check the range.');
      return;
    }

    if (editingRangeId) {
      void setState((prev) => ({
        ...prev,
        customRanges: prev.customRanges.map((item) =>
          item.id === editingRangeId
            ? {
                ...item,
                name: rangeName.trim(),
                startISO: rangeStart.toISOString(),
                endISO: rangeEnd.toISOString(),
              }
            : item
        ),
      }));
    } else {
      const nextItem: CustomRange = {
        id: createId(),
        name: rangeName.trim(),
        startISO: rangeStart.toISOString(),
        endISO: rangeEnd.toISOString(),
        enabled: true,
      };
      void setState((prev) => ({
        ...prev,
        customRanges: [...prev.customRanges, nextItem],
      }));
    }

    setRangeName('');
    setEditingRangeId(null);
    setCreateMode(null);
  };

  const handleCreateWindow = () => {
    if (!windowName.trim()) {
      Alert.alert('Name required', 'Please enter a name.');
      return;
    }
    const startMinute = windowStart.getHours() * 60 + windowStart.getMinutes();
    const endMinute = windowEnd.getHours() * 60 + windowEnd.getMinutes();
    const validation = validateDailyWindow(minutesToTime(startMinute), minutesToTime(endMinute));
    if (!validation.valid) {
      Alert.alert('Invalid time', validation.message ?? 'Check the window.');
      return;
    }

    if (editingWindowId) {
      void setState((prev) => ({
        ...prev,
        customDailyWindows: prev.customDailyWindows.map((item) =>
          item.id === editingWindowId
            ? {
                ...item,
                name: windowName.trim(),
                startMinute: startMinute,
                endMinute: endMinute,
              }
            : item
        ),
      }));
    } else {
      const nextItem: CustomDailyWindow = {
        id: createId(),
        name: windowName.trim(),
        startMinute: startMinute,
        endMinute: endMinute,
        enabled: true,
      };
      void setState((prev) => ({
        ...prev,
        customDailyWindows: [...prev.customDailyWindows, nextItem],
      }));
    }

    setWindowName('');
    setEditingWindowId(null);
    setCreateMode(null);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Use a custom timer</Text>
      {options.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedText }]}>No custom timers yet.</Text>
      ) : (
        <View style={styles.useSection}>
          <Text style={[styles.label, { color: colors.mutedText }]}>Select a custom timer</Text>
          <Pressable
            onPress={() => setSelectorOpen(true)}
            style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}
            >
              {selected ? selected.label : 'Choose...'}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleOpenTimer}
            style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
          >
            <Text style={styles.primaryButtonText}>Open Timer</Text>
          </Pressable>
          <Pressable
            onPress={handleEditSelected}
            style={[styles.secondaryButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Edit selected</Text>
          </Pressable>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Create a custom timer</Text>
      <View style={[styles.emptyCard, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Create a custom timer</Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedText }]}
        >
          Track a semester, trip, goal, or workday.
        </Text>
        <View style={styles.emptyActions}>
          <Pressable
            onPress={() => {
              setCreateMode('range');
              setEditingRangeId(null);
              setRangeName('');
              setRangeStart(new Date());
              setRangeEnd(new Date(Date.now() + 60 * 60 * 1000));
            }}
            style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
          >
            <Text style={styles.primaryButtonText}>New date range</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setCreateMode('daily');
              setEditingWindowId(null);
              setWindowName('');
              setWindowStart(new Date());
              setWindowEnd(new Date());
            }}
            style={[styles.secondaryButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}
            >
              New daily window
            </Text>
          </Pressable>
        </View>
      </View>

      {createMode === 'range' ? (
        <View style={[styles.formCard, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.formTitle, { color: colors.text }]}>New date range</Text>
          <Text style={[styles.helperText, { color: colors.mutedText }]}
          >
            Choose start and end date/time.
          </Text>
          <Text style={[styles.label, { color: colors.mutedText }]}>Name</Text>
          <TextInput
            value={rangeName}
            onChangeText={setRangeName}
            placeholder="Name"
            placeholderTextColor={colors.mutedText}
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
          />
          <Pressable
            onPress={() => setShowRangeStartPicker(true)}
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}
            >
              Start: {rangeStart.toLocaleString()}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowRangeEndPicker(true)}
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}
            >
              End: {rangeEnd.toLocaleString()}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleCreateRange}
            style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
          >
            <Text style={styles.primaryButtonText}>
              {editingRangeId ? 'Save changes' : 'Save range'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {createMode === 'daily' ? (
        <View style={[styles.formCard, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.formTitle, { color: colors.text }]}>New daily window</Text>
          <Text style={[styles.helperText, { color: colors.mutedText }]}
          >
            Overnight windows allowed (end earlier than start).
          </Text>
          <Text style={[styles.label, { color: colors.mutedText }]}>Name</Text>
          <TextInput
            value={windowName}
            onChangeText={setWindowName}
            placeholder="Name"
            placeholderTextColor={colors.mutedText}
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
          />
          <Pressable
            onPress={() => setShowWindowStartPicker(true)}
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}
            >
              Start: {minutesToTime(windowStart.getHours() * 60 + windowStart.getMinutes())}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowWindowEndPicker(true)}
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}
            >
              End: {minutesToTime(windowEnd.getHours() * 60 + windowEnd.getMinutes())}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleCreateWindow}
            style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
          >
            <Text style={styles.primaryButtonText}>
              {editingWindowId ? 'Save changes' : 'Save daily window'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Modal visible={selectorOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectorOpen(false)}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {options.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => {
                  setSelected(option);
                  setSelectorOpen(false);
                }}
                style={styles.modalRow}
              >
                <Text style={[styles.modalText, { color: colors.text }]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {showRangeStartPicker ? (
        <DateTimePicker
          value={buildDate(rangeStart)}
          mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setShowRangeStartPicker(false);
              return;
            }
            if (Platform.OS !== 'ios') {
              setShowRangeStartPicker(false);
              if (date) {
                const next = new Date(rangeStart);
                next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                setRangeStart(next);
                setShowRangeStartTimePicker(true);
              }
              return;
            }
            if (date) setRangeStart(date);
          }}
        />
      ) : null}

      {showRangeEndPicker ? (
        <DateTimePicker
          value={buildDate(rangeEnd)}
          mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setShowRangeEndPicker(false);
              return;
            }
            if (Platform.OS !== 'ios') {
              setShowRangeEndPicker(false);
              if (date) {
                const next = new Date(rangeEnd);
                next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                setRangeEnd(next);
                setShowRangeEndTimePicker(true);
              }
              return;
            }
            if (date) setRangeEnd(date);
          }}
        />
      ) : null}

      {showRangeStartTimePicker ? (
        <DateTimePicker
          value={buildDate(rangeStart)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setShowRangeStartTimePicker(false);
              return;
            }
            if (date) {
              const next = new Date(rangeStart);
              next.setHours(date.getHours(), date.getMinutes(), 0, 0);
              setRangeStart(next);
            }
            setShowRangeStartTimePicker(false);
          }}
        />
      ) : null}

      {showRangeEndTimePicker ? (
        <DateTimePicker
          value={buildDate(rangeEnd)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setShowRangeEndTimePicker(false);
              return;
            }
            if (date) {
              const next = new Date(rangeEnd);
              next.setHours(date.getHours(), date.getMinutes(), 0, 0);
              setRangeEnd(next);
            }
            setShowRangeEndTimePicker(false);
          }}
        />
      ) : null}

      {showWindowStartPicker ? (
        <DateTimePicker
          value={buildDate(windowStart)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (Platform.OS !== 'ios') {
              setShowWindowStartPicker(false);
            }
            if (event.type === 'dismissed') return;
            if (date) setWindowStart(date);
          }}
        />
      ) : null}

      {showWindowEndPicker ? (
        <DateTimePicker
          value={buildDate(windowEnd)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (Platform.OS !== 'ios') {
              setShowWindowEndPicker(false);
            }
            if (event.type === 'dismissed') return;
            if (date) setWindowEnd(date);
          }}
        />
      ) : null}

      {createMode === 'range' || createMode === 'daily' ? (
        <Pressable
          onPress={() => {
            setCreateMode(null);
            setEditingRangeId(null);
            setEditingWindowId(null);
          }}
        >
          <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  useSection: {
    gap: 10,
  },
  label: {
    fontSize: 12,
  },
  selector: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  selectorText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
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
  emptyActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  modalRow: {
    paddingVertical: 8,
  },
  modalText: {
    fontSize: 14,
  },
});
