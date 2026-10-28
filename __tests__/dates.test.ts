import { formatTime, getDateKey, getDayCode, getScheduleLabel } from '../lib/dates';

describe('date helpers', () => {
  it('formats a date for Supabase', () => {
    expect(getDateKey(new Date(2026, 9, 28))).toBe('2026-10-28');
  });

  it('finds the weekday code used by a schedule', () => {
    expect(getDayCode(new Date(2026, 9, 28))).toBe('wed');
  });

  it('formats a stored time for the screen', () => {
    expect(formatTime('07:05:00')).toBe('7:05 AM');
    expect(formatTime('15:30')).toBe('3:30 PM');
  });

  it('creates labels for daily and weekly routines', () => {
    expect(
      getScheduleLabel(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], '07:00'),
    ).toBe('Every day · 7:00 AM');
    expect(getScheduleLabel(['mon', 'wed', 'fri'], null)).toBe('Mon · Wed · Fri');
  });
});
