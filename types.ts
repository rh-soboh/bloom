// DATA TYPES: Shapes returned by the nested Supabase queries.
export type DayCode = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type Completion = {
  id: string;
  completed_on: string;
};

export type Habit = {
  archived_at: string | null;
  id: string;
  title: string;
  habit_completions: Completion[];
};

export type Routine = {
  archived_at: string | null;
  id: string;
  name: string;
  schedule_days: DayCode[];
  scheduled_time: string | null;
  habits: Habit[];
};
