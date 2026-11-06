# Iteration 2: 15-Day Plan

## Goal

Iteration 2 will make routines easier to manage. At the end of the iteration, a user will be able to schedule, view, edit and archive routines, move between the main app sections and review a simple completion history.

Complete one day at a time. Only commit the work after it runs correctly and you understand what changed. Use the real date on which the work was completed.

## Daily plan

### Day 1: Add schedule fields to the database

- Add `schedule_type`, `selected_days` and `scheduled_time` to the `routines` table.
- Run the updated SQL in Supabase.
- Confirm that existing routines still work with the default values.
- Suggested commit: `feat: add routine schedule fields`

### Day 2: Describe schedule data in TypeScript

- Add the new routine fields to `types.ts`.
- Keep the types small and use names that match the database columns.
- Run `npm run typecheck`.
- Suggested commit: `feat: add routine schedule types`

### Day 3: Add reusable date helpers

- Create `lib/dates.ts`.
- Add small functions for the local date, weekday and routine schedule check.
- Do not change a screen yet.
- Suggested commit: `feat: add date and schedule helpers`

### Day 4: Test the date helpers

- Add the test dependency and test command.
- Test daily schedules, selected weekly days and unselected days.
- Run `npm test` and `npm run typecheck`.
- Suggested commit: `test: add schedule helper tests`

### Day 5: Add an optional routine time

- Add a time input to the create-routine form.
- Save the value in `scheduled_time`.
- Check that a routine can still be saved without a time.
- Suggested commit: `feat: add optional routine time`

### Day 6: Add daily and weekly schedule choices

- Add simple Daily and Weekly buttons to the form.
- Store the selected option in component state.
- Save it in `schedule_type`.
- Suggested commit: `feat: add routine schedule choice`

### Day 7: Add weekday selection

- Show weekday buttons when Weekly is selected.
- Save the chosen days in `selected_days`.
- Require at least one selected day for a weekly routine.
- Suggested commit: `feat: add weekly day selection`

### Day 8: Show only today's scheduled habits

- Load the schedule fields in `HomeScreen.tsx`.
- Use the helper from `lib/dates.ts` to filter routines.
- Manually check a daily routine and a weekly routine.
- Suggested commit: `feat: filter habits by routine schedule`

### Day 9: Add basic bottom navigation

- Create a small `BottomNavigation` component.
- Add Today and Routines tabs first.
- Keep the selected tab in `App.tsx`.
- Suggested commit: `feat: add main app navigation`

### Day 10: Add the routines list

- Create `RoutinesScreen.tsx`.
- Load and display the signed-in user's active routines.
- Show each routine's name and schedule summary.
- Suggested commit: `feat: add routines list screen`

### Day 11: Edit routine details

- Open the routine form with an existing routine.
- Fill the form with its current name, schedule and time.
- Update those routine fields in Supabase.
- Suggested commit: `feat: edit routine details`

### Day 12: Edit routine habits

- Load the existing habits into the edit form.
- Allow habit names to be changed, added or removed.
- Test editing without creating a duplicate routine.
- Suggested commit: `feat: edit habits in a routine`

### Day 13: Archive routines

- Add an `is_archived` field to routines and habits.
- Add an Archive action to the routines list.
- Hide archived items from Today and Routines while keeping their completion history.
- Suggested commit: `feat: archive routines and habits`

### Day 14: Add simple progress history

- Create `ProgressScreen.tsx`.
- Load the user's completion records for the current month.
- Display completed habits grouped by date.
- Add Progress to the bottom navigation.
- Suggested commit: `feat: add monthly progress history`

### Day 15: Review and finish Iteration 2

- Test account login, routine creation, scheduling, editing, archiving and history.
- Fix only problems found during the review.
- Update the README and app version to `0.2.0`.
- Run `npm test`, `npm run typecheck` and `npx expo-doctor`.
- Suggested commit: `docs: complete iteration 2`

## End-of-day routine

At the end of each day:

1. Run the app and test the feature changed that day.
2. Run `npm run typecheck`.
3. Run `npm test` after tests are introduced on Day 4.
4. Read the changed logic and make sure you can explain it.
5. Check the changed files with `git status` and `git diff`.
6. Commit only that day's completed work using the suggested message or a clearer equivalent.
