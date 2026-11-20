import { Alert } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';

import { supabase } from '../lib/supabase';
import { CreateRoutineScreen } from '../screens/CreateRoutineScreen';
import type { Routine } from '../types';

jest.mock('../lib/supabase', () => ({ supabase: { from: jest.fn() } }));

const insertRoutine = jest.fn();
const insertHabits = jest.fn();
const habitInsert = insertHabits;
const updateRoutine = jest.fn();
const updateFilter = jest.fn();
const updateSingle = jest.fn();
const habitUpdate = jest.fn();
const habitDelete = jest.fn();
const onSaved = jest.fn();

const existingRoutine: Routine = {
  id: 'existing-routine', name: 'Study', schedule_type: 'weekly', selected_days: [1, 3],
  scheduled_time: '09:30:00',
  habits: [{ id: 'existing-habit', title: 'Read notes', habit_completions: [
    { id: 'completion-1', completed_on: '2026-11-09' },
  ] }],
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  insertRoutine.mockReturnValue({
    select: () => ({ single: async () => ({ data: { id: 'new-routine' }, error: null }) }),
  });
  insertHabits.mockResolvedValue({ error: null });
  updateSingle.mockResolvedValue({ data: { id: existingRoutine.id }, error: null });
  updateFilter.mockReturnValue({ eq: updateFilter, select: () => ({ single: updateSingle }) });
  updateRoutine.mockReturnValue({ eq: updateFilter });
  habitUpdate.mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }) });
  habitDelete.mockReturnValue({ in: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }) });
  habitInsert.mockResolvedValue({ error: null });
  (supabase!.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'routines') return { insert: insertRoutine, update: updateRoutine };
    if (table === 'habits') return { insert: habitInsert, update: habitUpdate, delete: habitDelete };
    throw new Error(`Unexpected table: ${table}`);
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('creates a daily routine without an optional time', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} userId="user-1" />);
  await user.type(screen.getByPlaceholderText('For example: Morning Routine'), 'Morning');
  await user.type(screen.getByPlaceholderText('Habit 1'), 'Read a chapter');
  expect(screen.queryByRole('checkbox', { name: 'Monday' })).toBeNull();
  await user.press(screen.getByRole('button', { name: 'Save Routine' }));

  expect(insertRoutine).toHaveBeenCalledWith({
    name: 'Morning', user_id: 'user-1', schedule_type: 'daily',
    selected_days: [], scheduled_time: null,
  });
  expect(insertHabits).toHaveBeenCalledWith([{ routine_id: 'new-routine', title: 'Read a chapter' }]);
  expect(onSaved).toHaveBeenCalledTimes(1);
});

test('rejects a weekly routine until a weekday is selected', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} userId="user-1" />);
  await user.type(screen.getByPlaceholderText('For example: Morning Routine'), 'Study');
  await user.type(screen.getByPlaceholderText('Habit 1'), 'Revise notes');
  await user.press(screen.getByRole('radio', { name: 'Weekly' }));
  await user.press(screen.getByRole('button', { name: 'Save Routine' }));

  expect(Alert.alert).toHaveBeenCalledWith('Choose a day', expect.any(String));
  expect(supabase!.from).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});

test('saves selected weekdays and supports deselection and Sunday', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} userId="user-1" />);
  await user.type(screen.getByPlaceholderText('For example: Morning Routine'), 'Weekend');
  await user.type(screen.getByPlaceholderText('Habit 1'), 'Read');
  await user.press(screen.getByRole('radio', { name: 'Weekly' }));
  await user.press(screen.getByRole('checkbox', { name: 'Monday' }));
  await user.press(screen.getByRole('checkbox', { name: 'Sunday' }));
  await user.press(screen.getByRole('checkbox', { name: 'Monday' }));
  await user.type(screen.getByLabelText('Routine time (optional)'), '09:30');
  await user.press(screen.getByRole('button', { name: 'Save Routine' }));

  expect(insertRoutine).toHaveBeenCalledWith(expect.objectContaining({
    schedule_type: 'weekly', selected_days: [0], scheduled_time: '09:30',
  }));
  expect(onSaved).toHaveBeenCalledTimes(1);
});

test('does not save weekly day selections after switching back to Daily', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} userId="user-1" />);
  await user.type(screen.getByPlaceholderText('For example: Morning Routine'), 'Daily study');
  await user.type(screen.getByPlaceholderText('Habit 1'), 'Read');
  await user.press(screen.getByRole('radio', { name: 'Weekly' }));
  await user.press(screen.getByRole('checkbox', { name: 'Monday' }));
  await user.press(screen.getByRole('radio', { name: 'Daily' }));
  await user.press(screen.getByRole('button', { name: 'Save Routine' }));

  expect(insertRoutine).toHaveBeenCalledWith(expect.objectContaining({
    schedule_type: 'daily', selected_days: [],
  }));
});

test('fills the edit form with existing habit names', async () => {
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);

  expect(screen.getByText('Edit Routine')).toBeOnTheScreen();
  expect(screen.getByLabelText('Routine name')).toHaveDisplayValue('Study');
  expect(screen.getByLabelText('Routine time (optional)')).toHaveDisplayValue('09:30');
  expect(screen.getByRole('radio', { name: 'Weekly', checked: true })).toBeOnTheScreen();
  expect(screen.getByRole('checkbox', { name: 'Monday', checked: true })).toBeOnTheScreen();
  expect(screen.getByRole('checkbox', { name: 'Wednesday', checked: true })).toBeOnTheScreen();
  expect(screen.getByLabelText('Habit 1')).toHaveDisplayValue('Read notes');
  expect(screen.getByRole('button', { name: 'Add habit' })).toBeOnTheScreen();
});

test('updates the existing routine details without inserting or replacing habits', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);
  await user.clear(screen.getByLabelText('Routine name'));
  await user.type(screen.getByLabelText('Routine name'), 'Evening study');
  await user.clear(screen.getByLabelText('Routine time (optional)'));
  await user.type(screen.getByLabelText('Routine time (optional)'), '18:45');
  await user.press(screen.getByRole('checkbox', { name: 'Monday' }));
  await user.press(screen.getByRole('checkbox', { name: 'Friday' }));
  await user.press(screen.getByRole('button', { name: 'Save Changes' }));

  expect(updateRoutine).toHaveBeenCalledWith({
    name: 'Evening study', schedule_type: 'weekly', selected_days: [3, 5], scheduled_time: '18:45',
  });
  expect(updateFilter).toHaveBeenNthCalledWith(1, 'id', existingRoutine.id);
  expect(updateFilter).toHaveBeenNthCalledWith(2, 'user_id', 'user-1');
  expect(insertRoutine).not.toHaveBeenCalled();
  expect(habitUpdate).toHaveBeenCalledWith({ title: 'Read notes' });
  expect(habitInsert).not.toHaveBeenCalled();
  expect(habitDelete).not.toHaveBeenCalled();
  expect(supabase!.from).toHaveBeenNthCalledWith(1, 'routines');
  expect(supabase!.from).toHaveBeenNthCalledWith(2, 'habits');
  expect(onSaved).toHaveBeenCalledTimes(1);
});

test('can change a weekly routine to daily and remove its optional time', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);
  await user.press(screen.getByRole('radio', { name: 'Daily' }));
  await user.clear(screen.getByLabelText('Routine time (optional)'));
  await user.press(screen.getByRole('button', { name: 'Save Changes' }));

  expect(updateRoutine).toHaveBeenCalledWith({
    name: 'Study', schedule_type: 'daily', selected_days: [], scheduled_time: null,
  });
});

test('rejects a weekly edit if all weekdays are deselected', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);
  await user.press(screen.getByRole('checkbox', { name: 'Monday' }));
  await user.press(screen.getByRole('checkbox', { name: 'Wednesday' }));
  await user.press(screen.getByRole('button', { name: 'Save Changes' }));

  expect(Alert.alert).toHaveBeenCalledWith('Choose a day', expect.any(String));
  expect(updateRoutine).not.toHaveBeenCalled();
});

test('rejects an invalid time before updating a routine', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);
  await user.clear(screen.getByLabelText('Routine time (optional)'));
  await user.type(screen.getByLabelText('Routine time (optional)'), '24:00');
  await user.press(screen.getByRole('button', { name: 'Save Changes' }));

  expect(Alert.alert).toHaveBeenCalledWith('Invalid time', expect.any(String));
  expect(updateRoutine).not.toHaveBeenCalled();
});

test('keeps the form open if updating fails', async () => {
  updateSingle.mockResolvedValueOnce({ data: null, error: { message: 'Update unavailable' } });
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);
  await user.press(screen.getByRole('button', { name: 'Save Changes' }));

  expect(Alert.alert).toHaveBeenCalledWith('Could not update routine', 'Update unavailable');
  expect(onSaved).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
});

test('cancels an edit without writing changes', async () => {
  const onCancel = jest.fn();
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={onCancel} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);
  await user.clear(screen.getByLabelText('Routine name'));
  await user.type(screen.getByLabelText('Routine name'), 'Unsaved changes');
  await user.press(screen.getByRole('button', { name: 'Cancel' }));

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(supabase!.from).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});

test('renames, adds and removes existing habits on the same routine', async () => {
  const user = userEvent.setup();
  const routineWithTwoHabits: Routine = {
    ...existingRoutine,
    habits: [
      existingRoutine.habits[0],
      { id: 'habit-to-remove', title: 'Stretch', habit_completions: [] },
    ],
  };
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={routineWithTwoHabits} userId="user-1" />);
  await user.clear(screen.getByLabelText('Habit 1'));
  await user.type(screen.getByLabelText('Habit 1'), 'Read a chapter');
  await user.press(screen.getByRole('button', { name: 'Add habit' }));
  await user.type(screen.getByLabelText('Habit 3'), 'Drink water');
  await user.press(screen.getByRole('button', { name: 'Remove habit 2' }));
  await user.press(screen.getByRole('button', { name: 'Save Changes' }));

  expect(habitUpdate).toHaveBeenCalledWith({ title: 'Read a chapter' });
  expect(habitInsert).toHaveBeenCalledWith([{ routine_id: existingRoutine.id, title: 'Drink water' }]);
  expect(habitDelete).toHaveBeenCalledTimes(1);
  expect(onSaved).toHaveBeenCalledTimes(1);
  expect(insertRoutine).not.toHaveBeenCalled();
});

test('does not save when a habit name is blank', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);
  await user.clear(screen.getByLabelText('Habit 1'));
  await user.press(screen.getByRole('button', { name: 'Save Changes' }));

  expect(Alert.alert).toHaveBeenCalledWith('Check the habits', expect.any(String));
  expect(updateRoutine).not.toHaveBeenCalled();
});

test('does not remove the final remaining habit', async () => {
  const user = userEvent.setup();
  await render(<CreateRoutineScreen onCancel={jest.fn()} onSaved={onSaved} routine={existingRoutine} userId="user-1" />);
  expect(screen.queryByRole('button', { name: 'Remove habit 1' })).toBeNull();
  await user.press(screen.getByRole('button', { name: 'Add habit' }));
  await user.press(screen.getByRole('button', { name: 'Remove habit 1' }));
  expect(screen.getByLabelText('Habit 1')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Habit 2')).toBeNull();
});
