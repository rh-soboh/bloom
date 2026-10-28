# Bloom - Habit & Routine Builder

Bloom is a mobile app for creating routines, completing daily habits and reviewing progress. It is a four-iteration final-year project built with Expo, React Native, TypeScript and Supabase.

Current version: `0.2.0`

## Completed work

### Iteration 1 - Working core

- Create an account and log in.
- Create a routine containing one or more habits.
- View today's habits.
- Mark habits complete or incomplete.
- Save all information in Supabase.

### Iteration 2 - Routine management

- Use bottom navigation to move between the main sections.
- Create daily or weekly routine schedules.
- Add an optional time to a routine.
- Edit routine names, schedules and habits.
- Delete a routine without removing its completion history.
- Review completed habits in a monthly history.

The Focus tab is visible but remains an Iteration 3 feature. The Figma references used for the completed work are stored in [`docs/figma/iteration-1`](docs/figma/iteration-1) and [`docs/figma/iteration-2`](docs/figma/iteration-2).

## Technology

- Expo and React Native for the mobile application.
- TypeScript for the application code.
- Supabase Authentication for registration and login.
- Supabase Database for routines, habits and completion records.

## Setup

1. Install the packages:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add the Supabase details:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

3. Run `supabase-schema.sql` in the Supabase SQL Editor. The complete file can be run again after updating from Iteration 1 because it safely adds the new schedule and archive columns.

4. Start the app:

```bash
npm start
```

Scan the QR code with Expo Go. If the phone cannot connect, use:

```bash
npx expo start --tunnel
```

Check the TypeScript code with:

```bash
npm run typecheck
```

Run the automated helper tests with:

```bash
npm test
```

## Important code

| File | Purpose |
| --- | --- |
| `App.tsx` | Restores the login session and controls the current screen. |
| `components/BottomNavigation.tsx` | Changes between Today, Routines, Focus and Progress. |
| `screens/CreateRoutineScreen.tsx` | Creates or edits a routine and its schedule. |
| `screens/HomeScreen.tsx` | Displays today's scheduled habits and records completions. |
| `screens/RoutinesScreen.tsx` | Lists, edits and deletes routines. |
| `screens/ProgressScreen.tsx` | Displays monthly completion history. |
| `lib/dates.ts` | Formats dates, weekdays, times and schedule labels. |
| `__tests__/dates.test.ts` | Tests the reusable scheduling and date helpers. |
| `lib/supabase.ts` | Creates the Supabase connection. |
| `types.ts` | Describes the application data used by TypeScript. |
| `supabase-schema.sql` | Creates the tables, relationships and security policies. |

The files in `design/styles` mainly control appearance and match the Figma designs.

## Database

The database has three application tables:

```text
routines -> habits -> habit_completions
```

- A user can have many routines.
- A routine can have many habits.
- A routine stores its selected weekdays and optional time.
- A completion records a completed habit and date.
- Deleted routines and habits are archived so their history remains available.
- Row Level Security ensures users can only access their own information.

Supabase Authentication stores the user accounts separately from these tables.

## Four-iteration plan

| Iteration | Main result |
| --- | --- |
| **1 - Working core** | Authentication, create a routine, view habits and mark them complete. |
| **2 - Management** | Edit, delete and schedule routines, completion history and bottom navigation. |
| **3 - Motivation** | Streaks, points, levels, Focus Sessions and weekly progress. |
| **4 - Final product** | Notifications, templates, profile, settings, testing, accessibility and final polish. |

## Licence

Bloom is released under the MIT licence. See `LICENSE` for details.
