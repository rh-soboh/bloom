// DATA TYPES: Routines, their habits and daily completion records.
export type Completion = {
  id: string;
  completed_on: string;
};

export type Habit = {
  id: string;
  title: string;

  habit_completions: Completion[];
};

export type Routine = {
  id: string;
  name: string;
  schedule_type: 'daily' | 'weekly';
  selected_days: number[]; // 0 = Sunday, 6 = Saturday.
  scheduled_time: string | null;

  habits: Habit[];
};
