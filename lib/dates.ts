import type { Routine } from '../types';

// Keep the phone's local date instead of converting it to UTC.
export function getLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Matches selected_days in the database: Sunday is 0, Saturday is 6.
export function getWeekday(date: Date = new Date()): number {
  return date.getDay();
}

export function isRoutineScheduled(routine: Routine, date: Date = new Date()): boolean {
  if (routine.schedule_type === 'daily') {
    return true;
  }

  return routine.selected_days.includes(getWeekday(date));
}

// A two-digit hour (00–23), a colon and two-digit minutes (00–59).
export function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}
