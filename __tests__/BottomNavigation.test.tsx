import { render, screen, userEvent } from '@testing-library/react-native';

import { BottomNavigation } from '../components/BottomNavigation';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('announces the selected tab and sends the tab chosen by the user', async () => {
  const user = userEvent.setup();
  const onTabChange = jest.fn();
  await render(<BottomNavigation activeTab="today" onTabChange={onTabChange} />);

  expect(screen.getByRole('tab', { name: 'Today', selected: true })).toBeOnTheScreen();
  await user.press(screen.getByRole('tab', { name: 'Routines' }));
  expect(onTabChange).toHaveBeenCalledWith('routines');

  await screen.rerender(<BottomNavigation activeTab="routines" onTabChange={onTabChange} />);
  expect(screen.getByRole('tab', { name: 'Routines', selected: true })).toBeOnTheScreen();
  await user.press(screen.getByRole('tab', { name: 'Progress' }));
  expect(onTabChange).toHaveBeenLastCalledWith('progress');

  await screen.rerender(<BottomNavigation activeTab="progress" onTabChange={onTabChange} />);
  expect(screen.getByRole('tab', { name: 'Progress', selected: true })).toBeOnTheScreen();
});
