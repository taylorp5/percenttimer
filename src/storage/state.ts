import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { AppState } from '../types';
import { getSharedState, setSharedState } from './sharedStateBridge';

const STORAGE_KEY = 'percenttime_state_v1';
const WRITE_DEBOUNCE_MS = 500;

export const defaultState: AppState = {
  settings: {
    enabledMetrics: {
      day: true,
      week: true,
      month: true,
      year: true,
    },
    showLabel: true,
    theme: 'system',
    accentColor: 'blue',
    hasOnboarded: false,
    dayStartMinutes: 0,
    hasAddedWidget: false,
  },
  customRanges: [],
  customDailyWindows: [],
};

let currentState: AppState = defaultState;
let hydrated = false;
let hydratePromise: Promise<void> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let pendingState: AppState | null = null;
const listeners = new Set<(state: AppState) => void>();

const mergeState = (base: AppState, incoming?: Partial<AppState>): AppState => ({
  settings: {
    ...base.settings,
    ...(incoming?.settings ?? {}),
    enabledMetrics: {
      ...base.settings.enabledMetrics,
      ...(incoming?.settings?.enabledMetrics ?? {}),
    },
  },
  customRanges: incoming?.customRanges ?? base.customRanges,
  customDailyWindows: incoming?.customDailyWindows ?? base.customDailyWindows,
});

const hydrate = async () => {
  if (hydrated) return;
  if (hydratePromise) {
    await hydratePromise;
    return;
  }
  hydratePromise = (async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        currentState = mergeState(defaultState, JSON.parse(stored) as AppState);
        hydrated = true;
        return;
      } catch {
        // Fall through to shared state lookup.
      }
    }

    const shared = await getSharedState();
    if (shared) {
      try {
        currentState = mergeState(defaultState, JSON.parse(shared) as AppState);
        hydrated = true;
        return;
      } catch {
        // Fall through to default state.
      }
    }

    currentState = defaultState;
    hydrated = true;
  })();
  await hydratePromise;
};

export const getState = async (): Promise<AppState> => {
  await hydrate();
  return currentState;
};

const persistState = async (state: AppState) => {
  const json = JSON.stringify(state);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch {
    // Ignore write failures to avoid blocking UI updates.
  }
  try {
    await setSharedState(json);
  } catch {
    // Ignore widget storage failures; we'll try again on next write.
  }
};

export const clearState = async () => {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  pendingState = null;
  currentState = defaultState;
  hydrated = true;
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore cleanup errors.
  }
  try {
    await setSharedState('');
  } catch {
    // Ignore widget storage failures.
  }
  listeners.forEach((listener) => listener(currentState));
};

const schedulePersist = (state: AppState) => {
  pendingState = state;
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  persistTimer = setTimeout(() => {
    const next = pendingState;
    pendingState = null;
    persistTimer = null;
    if (next) {
      void persistState(next);
    }
  }, WRITE_DEBOUNCE_MS);
};

export const setState = async (
  next: AppState | ((prev: AppState) => AppState)
): Promise<void> => {
  await hydrate();
  const updated = typeof next === 'function' ? next(currentState) : next;
  currentState = updated;
  schedulePersist(updated);
  listeners.forEach((listener) => listener(currentState));
};

export const subscribe = (listener: (state: AppState) => void) => {
  listeners.add(listener);
  void getState().then((state) => listener(state));
  return () => {
    listeners.delete(listener);
  };
};

export const useAppState = (): AppState => {
  const [state, setStateLocal] = useState<AppState>(currentState);

  useEffect(() => {
    let mounted = true;
    void getState().then((stateValue) => {
      if (mounted) setStateLocal(stateValue);
    });
    const unsubscribe = subscribe((stateValue) => {
      if (mounted) setStateLocal(stateValue);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return state;
};
