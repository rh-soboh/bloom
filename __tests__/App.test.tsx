import { AppState } from 'react-native';
import { act, render, screen, userEvent } from '@testing-library/react-native';

import App from '../App';
import { supabase } from '../lib/supabase';
import type { Routine } from '../types';

jest.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: jest.fn(),
    auth: { getSession: jest.fn(), onAuthStateChange: jest.fn() },
  },
}));

// These signed-in tests do not need the welcome screen's illustration.
jest.mock('../screens/WelcomeScreen', () => ({ WelcomeScreen: () => null }));

let savedRoutine: Routine;
const order = jest.fn();
const progressOrder = jest.fn();
const updateRoutine = jest.fn();
const signedInSession = { user: { id: 'user-1', user_metadata: { full_name: 'Shadrach Oboh' } } };

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 17, 12) });
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  (supabase!.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: signedInSession },
  });
  (supabase!.auth.onAuthStateChange as jest.Mock).mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
  savedRoutine = {
    id: 'routine-1', name: 'Study', schedule_type: 'daily', selected_days: [], scheduled_time: null, is_archived: false,
    habits: [{ id: 'habit-1', title: 'Read notes', habit_completions: [] }],
  };
  order.mockImplementation(async () => ({ data: [savedRoutine], error: null }));
  const routineQuery = { eq: () => routineQuery, order };
  const progressQuery = {
    eq: () => progressQuery,
    gte: () => progressQuery,
    lt: () => progressQuery,
    order: progressOrder,
  };
  progressOrder.mockResolvedValue({ data: [], error: null });
  updateRoutine.mockImplementation((details) => {
    const query = {
      eq: () => query,
      select: () => ({ single: async () => {
        savedRoutine = { ...savedRoutine, ...details };
        return { data: { id: savedRoutine.id }, error: null };
      } }),
    };
    return query;
  });
  (supabase!.from as jest.Mock).mockImplementation((table: string) => ({
    select: () => table === 'habit_completions' ? progressQuery : routineQuery,
    update: updateRoutine,
  }));
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('restores the session and returns to the tab where creation was opened', async () => {
  const user = userEvent.setup();
  await render(<App />);
  expect(screen.getByText('Welcome, Shadrach!')).toBeOnTheScreen();

  for (const tab of ['Today', 'Routines']) {
    await user.press(screen.getByRole('tab', { name: tab }));
    await user.press(screen.getByLabelText('Create routine'));
    expect(screen.getByRole('button', { name: 'Save Routine' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('tab', { name: tab, selected: true })).toBeOnTheScreen();
  }
});

test('opens the Progress screen from the bottom navigation', async () => {
  const user = userEvent.setup();
  await render(<App />);
  await user.press(screen.getByRole('tab', { name: 'Progress' }));

  expect(screen.getByRole('tab', { name: 'Progress', selected: true })).toBeOnTheScreen();
  expect(screen.getByText('No completed habits yet')).toBeOnTheScreen();
});

test('saves an edit and reloads the changed routine in Routines and Today', async () => {
  const user = userEvent.setup();
  await render(<App />);
  await user.press(screen.getByRole('tab', { name: 'Routines' }));
  await user.press(screen.getByRole('button', { name: 'Edit Study' }));
  await user.clear(screen.getByLabelText('Routine name'));
  await user.type(screen.getByLabelText('Routine name'), 'Evening study');
  await user.press(screen.getByRole('button', { name: 'Save Changes' }));

  expect(screen.getByRole('tab', { name: 'Routines', selected: true })).toBeOnTheScreen();
  expect(screen.getByText('Evening study')).toBeOnTheScreen();
  await user.press(screen.getByRole('tab', { name: 'Today' }));
  expect(screen.getByText('Evening study')).toBeOnTheScreen();
  expect(screen.getByRole('checkbox', { name: 'Read notes' })).toBeOnTheScreen();
});

test('cancels an edit and opens a blank form when creating the next routine', async () => {
  const user = userEvent.setup();
  await render(<App />);
  await user.press(screen.getByRole('tab', { name: 'Routines' }));
  await user.press(screen.getByRole('button', { name: 'Edit Study' }));
  await user.clear(screen.getByLabelText('Routine name'));
  await user.type(screen.getByLabelText('Routine name'), 'Unsaved edit');
  await user.press(screen.getByRole('button', { name: 'Cancel' }));

  expect(screen.getByText('Study')).toBeOnTheScreen();
  expect(updateRoutine).not.toHaveBeenCalled();
  await user.press(screen.getByLabelText('Create routine'));
  expect(screen.getByLabelText('Routine name')).toHaveDisplayValue('');
  expect(screen.getByPlaceholderText('Habit 1')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Save Routine' })).toBeOnTheScreen();
});

test('keeps unsaved routine details open when Supabase refreshes the session', async () => {
  const user = userEvent.setup();
  await render(<App />);
  await user.press(screen.getByRole('tab', { name: 'Routines' }));
  await user.press(screen.getByRole('button', { name: 'Edit Study' }));
  await user.clear(screen.getByLabelText('Routine name'));
  await user.type(screen.getByLabelText('Routine name'), 'Still editing');
  const onAuthStateChange = (supabase!.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];

  for (const event of ['TOKEN_REFRESHED', 'SIGNED_IN']) {
    await act(async () => onAuthStateChange(event, signedInSession));
    expect(screen.getByText('Edit Routine')).toBeOnTheScreen();
    expect(screen.getByLabelText('Routine name')).toHaveDisplayValue('Still editing');
  }
});
