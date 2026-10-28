import { DayCode } from '../types';

export const DAY_OPTIONS: { code: DayCode; label: string; name: string }[] = [
  { code: 'mon', label: 'M', name: 'Mon' },
  { code: 'tue', label: 'T', name: 'Tue' },
  { code: 'wed', label: 'W', name: 'Wed' },
  { code: 'thu', label: 'T', name: 'Thu' },
  { code: 'fri', label: 'F', name: 'Fri' },
  { code: 'sat', label: 'S', name: 'Sat' },
  { code: 'sun', label: 'S', name: 'Sun' },
];

const JS_DAY_CODES: DayCode[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Supabase date columns use the YYYY-MM-DD format.
export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayCode(date = new Date()): DayCode {
  return JS_DAY_CODES[date.getDay()];
}

export function formatTime(value: string | null): string {
  if (!value) return 'No time';

  const [hourText, minute = '00'] = value.split(':');
  const hour = Number(hourText);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

export function getScheduleLabel(days: DayCode[], time: string | null): string {
  const dayLabel =
    days.length === 7
      ? 'Every day'
      : DAY_OPTIONS.filter((day) => days.includes(day.code))
          .map((day) => day.name)
          .join(' · ');

  return time ? `${dayLabel} · ${formatTime(time)}` : dayLabel;
}
