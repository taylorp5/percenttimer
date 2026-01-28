export type ValidationResult = {
  valid: boolean;
  message?: string;
  warning?: string;
};

export const parseISODate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const parseTimeToMinutes = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number) => {
  const safe = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const validateCustomRange = (
  startISO: string,
  endISO: string,
  now: Date
): ValidationResult => {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (!start || !end) {
    return { valid: false, message: 'Use a valid ISO datetime for start/end.' };
  }
  if (end <= start) {
    return { valid: false, message: 'End must be after start.' };
  }
  if (end <= now) {
    return { valid: true, warning: 'This range already ended and will be disabled.' };
  }
  return { valid: true };
};

export const validateDailyWindow = (
  startTime: string,
  endTime: string
): ValidationResult & { startMinute?: number; endMinute?: number } => {
  const startMinute = parseTimeToMinutes(startTime);
  const endMinute = parseTimeToMinutes(endTime);
  if (startMinute === null || endMinute === null) {
    return { valid: false, message: 'Use HH:MM 24h format for start/end.' };
  }
  if (startMinute === endMinute) {
    return { valid: false, message: 'Start and end cannot be the same.' };
  }
  return { valid: true, startMinute, endMinute };
};

export const isRangeExpired = (endISO: string, now: Date) => {
  const end = parseISODate(endISO);
  if (!end) return false;
  return end <= now;
};
