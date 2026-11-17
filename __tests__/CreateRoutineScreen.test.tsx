import { Alert } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';

import { supabase } from '../lib/supabase';
import { CreateRoutineScreen } from '../screens/CreateRoutineScreen';

jest.mock('../lib/supabase', () => ({ supabase: { from: jest.fn() } }));

const insertRoutine = jest.fn();
const insertHabits = jest.fn();
const onSaved = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  insertRoutine.mockReturnValue({
    select: () => ({ single: async () => ({ data: { id: 'new-routine' }, error: null }) }),
  });
  insertHabits.mockResolvedValue({ error: null });
  (supabase!.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'routines') return { insert: insertRoutine };
    if (table === 'habits') return { insert: insertHabits };
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
