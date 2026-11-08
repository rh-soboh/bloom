# Bloom — Habit & Routine Builder

Bloom is a mobile app for creating routines, completing daily habits and tracking progress. It is a four-iteration final-year project built with Expo, React Native, TypeScript and Supabase.

## Iteration 1

The first iteration provides one complete working flow:

1. Create an account or log in.
2. Create a routine containing one or more habits.
3. View the habits on the Today screen.
4. Mark a habit complete or incomplete.
5. Save the information in Supabase.

The Figma frames used as references for this iteration are stored in [`docs/figma/iteration-1`](docs/figma/iteration-1). Some of those frames also show final-product elements—such as bottom navigation, points and Focus—that are deliberately planned for later iterations and are not yet implemented.

## Iteration 2 progress

Day 1: added `schedule_type`, `selected_days` and optional `scheduled_time` to the SQL schema. A read-only check has confirmed that all three columns are available in Supabase.

Day 2: added the matching fields to the `Routine` type in `types.ts`. These describe the schedule data without changing the app's behaviour.

Day 3: added `lib/dates.ts` to format local dates, get weekdays and check whether a routine is scheduled for a date. These helpers will be connected to the screens in later tasks.

Day 4: added ten automated tests for date formatting, weekday numbers and daily or weekly schedules.

Day 5: added an optional routine time in `HH:MM` format. Valid times are saved in `scheduled_time`; leaving the field blank saves `null`. The form layout follows the Figma time row, and three additional tests check time validation.

The daily tasks are in [ITERATION_2_PLAN.md](ITERATION_2_PLAN.md).

## Technology

- **Expo and React Native:** build and run the mobile app.
- **TypeScript:** application code.
- **Supabase Authentication:** registration, login and logout.
- **Supabase Database:** routines, habits and completion records.

## Setup

1. Install the packages:

```bash
npm install
```

2. Create a `.env` file using `.env.example` and add your Supabase details:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

3. Run `supabase-schema.sql` in the Supabase SQL Editor.

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

Run the helper tests with:

```bash
npm test
```

## Code to understand and explain

These are the important logic files:

| File | What it does |
| --- | --- |
| `App.tsx` | Restores the login session and decides which screen to display. |
| `lib/supabase.ts` | Reads the environment variables and creates the Supabase connection. |
| `screens/AuthScreen.tsx` | Logs in with an email and password. |
| `screens/CreateAccountScreen.tsx` | Creates a Supabase account and saves the user's name. |
| `screens/CreateRoutineScreen.tsx` | Stores a routine first, then stores its habits using the routine ID. |
| `screens/HomeScreen.tsx` | Loads routines and habits and adds or removes completion records. |
| `types.ts` | Describes the shape of the data used by TypeScript. |
| `lib/dates.ts` | Formats local dates and checks daily or weekly schedules. |
| `__tests__/dates.test.ts` | Checks the date and schedule helpers using fixed example dates. |
| `supabase-schema.sql` | Creates the three tables, their relationships and security rules. |

`WelcomeScreen.tsx`, `BloomLogo.tsx`, `design/theme.ts` and the files in `design/styles` mainly control appearance. You should know their general purpose, but you do not need to memorise every style value.

Generated or configuration files such as `package-lock.json`, `node_modules`, `.expo`, `dist`, `tsconfig.json` and `app.json` do not contain the main application logic.

## Database

The database has three application tables:

```text
routines → habits → habit_completions
```

- One user can have many routines.
- One routine can have many habits.
- A completion row records that a habit was completed on a particular date.
- Row Level Security ensures users can access only their own information.

## Four-iteration plan

| Iteration | Main result |
| --- | --- |
| **1 — Working core** | Authentication, create a routine, view habits and mark them complete. |
| **2 — Management** | Edit, delete and schedule routines, plus completion history and bottom navigation. |
| **3 — Motivation** | Streaks, points, levels, Focus Sessions and weekly progress. |
| **4 — Final product** | Notifications, templates, profile, settings, testing, accessibility and final polish. |

Each iteration will have its own implemented Figma designs in `docs/figma/iteration-N`.

## Licence

Bloom is released under the MIT licence. The `LICENSE` file contains copyright notices for Shadrach Oboh and the original Expo starter project.
