import { computeProgress } from '../src/utils/computeProgress';
import { AppState } from '../src/types';

const baseState: AppState = {
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
    hasOnboarded: true,
  },
  customRanges: [],
  customDailyWindows: [],
};

describe('computeProgress', () => {
  it('starts week on Monday', () => {
    const now = new Date(2024, 0, 3, 12); // Wed, Jan 3 2024
    const result = computeProgress('week', baseState, now);
    const start = new Date(result.startISO);
    expect(start.getDay()).toBe(1);
  });

  it('handles leap year month length', () => {
    const now = new Date(2024, 1, 15, 12); // Feb 15 2024
    const result = computeProgress('month', baseState, now);
    const end = new Date(result.endISO);
    expect(end.getMonth()).toBe(2); // March
  });

  it('handles year length for leap year', () => {
    const now = new Date(2024, 5, 30, 12); // Jun 30 2024
    const result = computeProgress('year', baseState, now);
    const start = new Date(result.startISO);
    const end = new Date(result.endISO);
    const days = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    expect(days).toBe(366);
  });

  it('handles DST day length changes', () => {
    const now = new Date(2024, 2, 10, 12); // Mar 10 2024 in America/New_York
    const result = computeProgress('day', baseState, now);
    const start = new Date(result.startISO);
    const end = new Date(result.endISO);
    const hours = (end.getTime() - start.getTime()) / (60 * 60 * 1000);
    expect([23, 24, 25]).toContain(hours);
  });

  it('handles overnight daily windows', () => {
    const state: AppState = {
      ...baseState,
      customDailyWindows: [
        {
          id: 'overnight',
          name: 'Overnight',
          startMinute: 22 * 60,
          endMinute: 2 * 60,
          enabled: true,
        },
      ],
    };
    const now = new Date(2024, 6, 1, 23, 0);
    const result = computeProgress(
      { type: 'customDaily', id: 'overnight' },
      state,
      now
    );
    const start = new Date(result.startISO);
    const end = new Date(result.endISO);
    expect(end.getDate() === start.getDate() + 1 || end > start).toBe(true);
  });
});
