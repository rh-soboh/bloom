import { getLocalDate, getWeekday, isRoutineScheduled } from '../lib/dates';
import type { Routine } from '../types';

const routine: Routine = {
  id: 'routine-1',
  name: 'Study routine',
  schedule_type: 'daily',
  selected_days: [],
  scheduled_time: null,
  habits: [],
};

describe('getLocalDate', () => {
  test('pads single-digit months and days', () => {
    expect(getLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  test('keeps the local date just after midnight', () => {
    expect(getLocalDate(new Date(2026, 10, 7, 0, 15))).toBe('2026-11-07');
  });

  test('keeps the local date just before midnight', () => {
    expect(getLocalDate(new Date(2026, 10, 7, 23, 45))).toBe('2026-11-07');
  });

  test('formats a leap day', () => {
    expect(getLocalDate(new Date(2028, 1, 29))).toBe('2028-02-29');
  });
});

describe('getWeekday', () => {
  test('returns 0 for Sunday', () => {
    expect(getWeekday(new Date(2026, 10, 8))).toBe(0);
  });

  test('returns 6 for Saturday', () => {
    expect(getWeekday(new Date(2026, 10, 7))).toBe(6);
  });
});

describe('isRoutineScheduled', () => {
  test('a daily routine runs even when no weekdays are selected', () => {
    expect(isRoutineScheduled(routine, new Date(2026, 10, 9))).toBe(true);
  });

  test('a weekly routine runs on a selected day', () => {
    const weeklyRoutine: Routine = {
      ...routine,
      schedule_type: 'weekly',
      selected_days: [1, 3, 5],
    };

    expect(isRoutineScheduled(weeklyRoutine, new Date(2026, 10, 9))).toBe(true);
  });

  test('a weekly routine does not run on an unselected day', () => {
    const weeklyRoutine: Routine = {
      ...routine,
      schedule_type: 'weekly',
      selected_days: [1, 3, 5],
    };

    expect(isRoutineScheduled(weeklyRoutine, new Date(2026, 10, 10))).toBe(false);
  });

  test('a weekly routine with no selected days does not run', () => {
    const weeklyRoutine: Routine = { ...routine, schedule_type: 'weekly' };

    expect(isRoutineScheduled(weeklyRoutine, new Date(2026, 10, 9))).toBe(false);
  });
});
