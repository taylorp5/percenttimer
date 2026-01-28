import { AppState, MetricType } from '../types';

export interface ProgressResult {
  percentInt: number;
  percentFloat: number;
  label: string;
  startISO: string;
  endISO: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const percentFromRange = (
  label: string,
  start: Date,
  end: Date,
  now: Date
): ProgressResult => {
  const duration = end.getTime() - start.getTime();
  const ratio = duration <= 0 ? 0 : (now.getTime() - start.getTime()) / duration;
  const percentFloat = clamp(ratio, 0, 1);
  return {
    percentFloat,
    percentInt: Math.round(percentFloat * 100),
    label,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  };
};

const getDayRange = (now: Date) => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const getWeekRange = (now: Date) => {
  const { start } = getDayRange(now);
  const day = start.getDay();
  const diff = (day + 6) % 7; // Monday start
  start.setDate(start.getDate() - diff);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
};

const getMonthRange = (now: Date) => {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

const getYearRange = (now: Date) => {
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  return { start, end };
};

const getDailyWindowRange = (
  now: Date,
  startMinute: number,
  endMinute: number
) => {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const overnight = endMinute <= startMinute;

  let start = new Date(midnight);
  let end = new Date(midnight);

  if (!overnight) {
    start.setMinutes(startMinute, 0, 0);
    end.setMinutes(endMinute, 0, 0);
    return { start, end };
  }

  if (minutesNow >= startMinute) {
    start.setMinutes(startMinute, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setMinutes(endMinute, 0, 0);
    return { start, end };
  }

  start.setDate(start.getDate() - 1);
  start.setMinutes(startMinute, 0, 0);
  end.setMinutes(endMinute, 0, 0);
  return { start, end };
};

export const computeProgress = (
  metricType: MetricType,
  state: AppState,
  now: Date
): ProgressResult => {
  if (metricType === 'day') {
    const { start, end } = getDayRange(now);
    return percentFromRange('Day', start, end, now);
  }

  if (metricType === 'week') {
    const { start, end } = getWeekRange(now);
    return percentFromRange('Week', start, end, now);
  }

  if (metricType === 'month') {
    const { start, end } = getMonthRange(now);
    return percentFromRange('Month', start, end, now);
  }

  if (metricType === 'year') {
    const { start, end } = getYearRange(now);
    return percentFromRange('Year', start, end, now);
  }

  if (metricType.type === 'customRange') {
    const range = state.customRanges.find((item) => item.id === metricType.id);
    if (!range) {
      const { start, end } = getDayRange(now);
      return percentFromRange('Custom Range', start, end, now);
    }
    const start = new Date(range.startISO);
    const end = new Date(range.endISO);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      const { start: fallbackStart, end: fallbackEnd } = getDayRange(now);
      return percentFromRange(range.name, fallbackStart, fallbackEnd, now);
    }
    return percentFromRange(range.name, start, end, now);
  }

  const window = state.customDailyWindows.find(
    (item) => item.id === metricType.id
  );
  if (!window) {
    const { start, end } = getDayRange(now);
    return percentFromRange('Custom Window', start, end, now);
  }
  const { start, end } = getDailyWindowRange(
    now,
    window.startMinute,
    window.endMinute
  );
  return percentFromRange(window.name, start, end, now);
};
