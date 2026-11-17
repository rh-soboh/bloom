import { AppState, type AppStateStatus } from 'react-native';
import { act, render, screen, userEvent } from '@testing-library/react-native';

import { supabase } from '../lib/supabase';
import { HomeScreen } from '../screens/HomeScreen';
import type { Routine } from '../types';

jest.mock('../lib/supabase', () => ({ supabase: { from: jest.fn() } }));

const routines: Routine[] = [
  {
    id: 'daily', name: 'Morning', schedule_type: 'daily', selected_days: [], scheduled_time: null,
    habits: [{ id: 'daily-habit', title: 'Daily reading', habit_completions: [
      { id: 'completion-1', completed_on: '2026-11-09' },
    ] }],
  },
  {
    id: 'monday', name: 'Monday study', schedule_type: 'weekly', selected_days: [1], scheduled_time: null,
    habits: [{ id: 'monday-habit', title: 'Monday revision', habit_completions: [] }],
  },
  {
    id: 'tuesday', name: 'Tuesday study', schedule_type: 'weekly', selected_days: [2], scheduled_time: null,
    habits: [{ id: 'tuesday-habit', title: 'Tuesday exercise', habit_completions: [] }],
  },
];

const order = jest.fn();
const insertCompletion = jest.fn();
let onAppStateChange: (state: AppStateStatus) => void;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 9, 12) });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    onAppStateChange = listener;
    return { remove: jest.fn() };
  });
  order.mockResolvedValue({ data: routines, error: null });
  insertCompletion.mockResolvedValue({ error: null });
  (supabase!.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'habit_completions') return { insert: insertCompletion };
    return { select: () => ({ eq: () => ({ order }) }) };
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('shows daily and selected weekly habits and counts only those habits', async () => {
  await render(<HomeScreen onCreateRoutine={jest.fn()} userId="user-1" />);

  expect(screen.getByRole('checkbox', { name: 'Daily reading', checked: true })).toBeOnTheScreen();
  expect(screen.getByRole('checkbox', { name: 'Monday revision' })).toBeOnTheScreen();
  expect(screen.queryByText('Tuesday exercise')).toBeNull();
  expect(screen.getByText('1/2')).toBeOnTheScreen();
});

test('distinguishes no routines from routines not scheduled today', async () => {
  order.mockResolvedValue({ data: [routines[2]], error: null });
  await render(<HomeScreen onCreateRoutine={jest.fn()} userId="user-1" />);

  expect(screen.getByText('No habits scheduled today')).toBeOnTheScreen();
  expect(screen.queryByText('Your fresh start begins here')).toBeNull();
});

test('saves the local completion date and user for a visible habit', async () => {
  const user = userEvent.setup();
  await render(<HomeScreen onCreateRoutine={jest.fn()} userId="user-1" />);
  await user.press(screen.getByRole('checkbox', { name: 'Monday revision' }));

  expect(insertCompletion).toHaveBeenCalledWith({
    habit_id: 'monday-habit', user_id: 'user-1', completed_on: '2026-11-09',
  });
});

test('refreshes scheduled habits when the app returns on the next day', async () => {
  await render(<HomeScreen onCreateRoutine={jest.fn()} userId="user-1" />);
  jest.setSystemTime(new Date(2026, 10, 10, 12));
  await act(async () => onAppStateChange('active'));

  expect(screen.queryByText('Monday revision')).toBeNull();
  expect(screen.getByRole('checkbox', { name: 'Tuesday exercise' })).toBeOnTheScreen();
  expect(screen.getByText('0/2')).toBeOnTheScreen();
});
