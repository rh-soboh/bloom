import { AppState } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';

import { supabase } from '../lib/supabase';
import { ProgressScreen } from '../screens/ProgressScreen';

jest.mock('../lib/supabase', () => ({ supabase: { from: jest.fn() } }));

const order = jest.fn();
const lt = jest.fn();
const gte = jest.fn();
const eq = jest.fn();
const select = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 20, 12) });
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  order.mockResolvedValue({ data: [
    {
      id: 'completion-1', completed_on: '2026-11-19',
      habits: { title: 'Finish report', routines: { name: 'Study' } },
    },
    {
      id: 'completion-2', completed_on: '2026-11-19',
      habits: { title: 'Record app', routines: { name: 'Project tasks' } },
    },
  ], error: null });
  lt.mockReturnValue({ order });
  gte.mockReturnValue({ lt });
  eq.mockReturnValue({ gte });
  select.mockReturnValue({ eq });
  (supabase!.from as jest.Mock).mockReturnValue({ select });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('loads this month for the signed-in user and groups completed habits by date', async () => {
  await render(<ProgressScreen userId="user-1" />);

  expect(supabase!.from).toHaveBeenCalledWith('habit_completions');
  expect(select).toHaveBeenCalledWith('id, completed_on, habits!inner(title, routines!inner(name))');
  expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
  expect(gte).toHaveBeenCalledWith('completed_on', '2026-11-01');
  expect(lt).toHaveBeenCalledWith('completed_on', '2026-12-01');
  expect(screen.getAllByText('2')).toHaveLength(2);
  expect(screen.getByText('Thursday, 19 November')).toBeOnTheScreen();
  expect(screen.getByText('Finish report')).toBeOnTheScreen();
  expect(screen.getByText('Study')).toBeOnTheScreen();
  expect(screen.getByText('Record app')).toBeOnTheScreen();
});

test('shows an empty state when there are no completion records', async () => {
  order.mockResolvedValue({ data: [], error: null });
  await render(<ProgressScreen userId="user-1" />);

  expect(screen.getByText('No completed habits yet')).toBeOnTheScreen();
});

test('can retry after a database error', async () => {
  order.mockResolvedValueOnce({ data: null, error: { message: 'Connection failed' } });
  const user = userEvent.setup();
  await render(<ProgressScreen userId="user-1" />);

  expect(screen.getByText('Connection failed')).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Try again' }));
  expect(screen.getByText('Finish report')).toBeOnTheScreen();
});
