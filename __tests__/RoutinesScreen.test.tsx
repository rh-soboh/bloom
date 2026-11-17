import { AppState, type AppStateStatus } from 'react-native';
import { act, render, screen, userEvent } from '@testing-library/react-native';

import { supabase } from '../lib/supabase';
import { RoutinesScreen } from '../screens/RoutinesScreen';
import type { Routine } from '../types';

jest.mock('../lib/supabase', () => ({ supabase: { from: jest.fn() } }));

const routines: Routine[] = [
  {
    id: 'daily', name: 'Morning', schedule_type: 'daily', selected_days: [], scheduled_time: '09:30:00',
    habits: [{ id: 'habit-1', title: 'Read', habit_completions: [
      { id: 'completion-1', completed_on: '2026-11-09' },
    ] }],
  },
  {
    id: 'weekly', name: 'Study', schedule_type: 'weekly', selected_days: [0, 2], scheduled_time: null,
    habits: [
      { id: 'habit-2', title: 'Revise', habit_completions: [] },
      { id: 'habit-3', title: 'Practise', habit_completions: [] },
    ],
  },
];

const order = jest.fn();
const filterByUser = jest.fn();
let onAppStateChange: (state: AppStateStatus) => void;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 9, 12) });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    onAppStateChange = listener;
    return { remove: jest.fn() };
  });
  order.mockResolvedValue({ data: routines, error: null });
  filterByUser.mockReturnValue({ order });
  (supabase!.from as jest.Mock).mockReturnValue({ select: () => ({ eq: filterByUser }) });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('shows all routines, including those not due today, with their schedule and habit counts', async () => {
  await render(<RoutinesScreen onCreateRoutine={jest.fn()} userId="user-1" />);

  expect(filterByUser).toHaveBeenCalledWith('user_id', 'user-1');
  expect(screen.getByText('Morning')).toBeOnTheScreen();
  expect(screen.getByText('Study')).toBeOnTheScreen();
  expect(screen.getByText('Every day · 09:30')).toBeOnTheScreen();
  expect(screen.getByText('Tue, Sun')).toBeOnTheScreen();
  expect(screen.getByText('1 habit')).toBeOnTheScreen();
  expect(screen.getByText('2 habits')).toBeOnTheScreen();
  expect(screen.getByText('1/1 done today')).toBeOnTheScreen();
  expect(screen.getByText('Not scheduled today')).toBeOnTheScreen();
  expect(screen.getByRole('progressbar', { name: "Today's progress for Morning" }))
    .toHaveAccessibilityValue({ min: 0, max: 1, now: 1 });
});

test('offers routine creation when the user has no routines', async () => {
  order.mockResolvedValue({ data: [], error: null });
  const onCreateRoutine = jest.fn();
  const user = userEvent.setup();
  await render(<RoutinesScreen onCreateRoutine={onCreateRoutine} userId="user-1" />);
  await user.press(screen.getByRole('button', { name: 'Create your first routine' }));

  expect(screen.getByText('Your next chapter starts here.')).toBeOnTheScreen();
  expect(onCreateRoutine).toHaveBeenCalledTimes(1);
});

test('shows a loading error instead of an empty state and allows a retry', async () => {
  order.mockResolvedValueOnce({ data: null, error: { message: 'Connection unavailable' } });
  const user = userEvent.setup();
  await render(<RoutinesScreen onCreateRoutine={jest.fn()} userId="user-1" />);

  expect(screen.getByRole('alert')).toHaveTextContent('Connection unavailable');
  expect(screen.queryByText('Your next chapter starts here.')).toBeNull();
  await user.press(screen.getByRole('button', { name: 'Try again' }));

  expect(screen.getByText('Morning')).toBeOnTheScreen();
  expect(screen.queryByRole('alert')).toBeNull();
});

test('refreshes progress and the scheduled day when the app returns', async () => {
  await render(<RoutinesScreen onCreateRoutine={jest.fn()} userId="user-1" />);
  jest.setSystemTime(new Date(2026, 10, 10, 12));
  await act(async () => onAppStateChange('active'));

  expect(screen.getByText('0/1 done today')).toBeOnTheScreen();
  expect(screen.getByText('0/2 done today')).toBeOnTheScreen();
  expect(screen.queryByText('Not scheduled today')).toBeNull();
});
