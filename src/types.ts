export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentColor =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'teal';

export type BuiltInMetric = 'day' | 'week' | 'month' | 'year';

export type MetricType =
  | BuiltInMetric
  | { type: 'customRange'; id: string }
  | { type: 'customDaily'; id: string };

export interface CustomRange {
  id: string;
  name: string;
  startISO: string;
  endISO: string;
  enabled: boolean;
}

export interface CustomDailyWindow {
  id: string;
  name: string;
  startMinute: number;
  endMinute: number;
  enabled: boolean;
}

export interface Settings {
  enabledMetrics: Record<BuiltInMetric, boolean>;
  showLabel: boolean;
  theme: ThemeMode;
  accentColor: AccentColor;
  hasOnboarded: boolean;
}

export interface AppState {
  settings: Settings;
  customRanges: CustomRange[];
  customDailyWindows: CustomDailyWindow[];
}
export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'teal';

export type BuiltInMetric = 'day' | 'week' | 'month' | 'year';

export interface CustomRange {
  id: string;
  name: string;
  startISO: string;
  endISO: string;
  enabled: boolean;
}

export interface CustomDailyWindow {
  id: string;
  name: string;
  startMinute: number;
  endMinute: number;
  enabled: boolean;
}

export interface Settings {
  enabledMetrics: Record<BuiltInMetric, boolean>;
  showLabel: boolean;
  theme: ThemeMode;
  accentColor: AccentColor;
}

export interface AppState {
  settings: Settings;
  customRanges: CustomRange[];
  customDailyWindows: CustomDailyWindow[];
}
export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'teal';

export type BuiltInMetric = 'day' | 'week' | 'month' | 'year';

export type MetricType =
  | BuiltInMetric
  | { type: 'customRange'; id: string }
  | { type: 'customDaily'; id: string };

export interface CustomRange {
  id: string;
  name: string;
  startISO: string;
  endISO: string;
  enabled: boolean;
}

export interface CustomDailyWindow {
  id: string;
  name: string;
  startMinute: number;
  endMinute: number;
  enabled: boolean;
}

export interface Settings {
  enabledMetrics: Record<BuiltInMetric, boolean>;
  showLabel: boolean;
  theme: ThemeMode;
  accentColor: AccentColor;
}

export interface AppState {
  settings: Settings;
  customRanges: CustomRange[];
  customDailyWindows: CustomDailyWindow[];
}
