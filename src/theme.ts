import { AccentColor, ThemeMode } from './types';

export const accentColorMap: Record<AccentColor, string> = {
  blue: '#3B82F6',
  green: '#22C55E',
  orange: '#F97316',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
};

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  mutedText: string;
  border: string;
  progressTrack: string;
  progressFill: string;
  warning: string;
};

export const resolveTheme = (
  mode: ThemeMode,
  systemScheme: 'light' | 'dark' | null | undefined
): 'light' | 'dark' => {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
};

export const getThemeColors = (
  mode: ThemeMode,
  systemScheme: 'light' | 'dark' | null | undefined,
  accentColor: AccentColor
): ThemeColors => {
  const resolved = resolveTheme(mode, systemScheme);
  const accent = accentColorMap[accentColor];

  if (resolved === 'dark') {
    return {
      background: '#0B0D10',
      card: '#151922',
      text: '#F9FAFB',
      mutedText: '#9CA3AF',
      border: '#2C3440',
      progressTrack: '#273142',
      progressFill: accent,
      warning: '#F59E0B',
    };
  }

  return {
    background: '#F7F7F8',
    card: '#FFFFFF',
    text: '#111827',
    mutedText: '#6B7280',
    border: '#E5E7EB',
    progressTrack: '#E5E7EB',
    progressFill: accent,
    warning: '#D97706',
  };
};
