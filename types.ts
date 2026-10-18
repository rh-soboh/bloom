// DATA TYPES: Shapes returned by the nested query in HomeScreen.
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

  habits: Habit[];
};
