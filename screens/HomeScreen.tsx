import { useEffect, useState } from 'react';
import { Check, LogOut, Plus, Sprout } from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { styles } from '../design/styles/homeStyles';
import { colors } from '../design/theme';
import { getLocalDate, isRoutineScheduled } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { Habit, Routine } from '../types';

type Props = {
  fullName?: string;
  onCreateRoutine: () => void;
  userId: string;
};

function getCompletionForDate(habit: Habit, date: string) {
  return habit.habit_completions.find((completion) => completion.completed_on === date);
}

export function HomeScreen({ fullName, onCreateRoutine, userId }: Props) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const today = getLocalDate(currentDate);

  async function loadRoutines() {
    setCurrentDate(new Date());
    const { data, error } = await supabase!
      .from('routines')
      .select(`
        id, name, schedule_type, selected_days, scheduled_time, is_archived,
        habits(id, title, habit_completions(id, completed_on))
      `)
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) Alert.alert('Could not load routines', error.message);
    else setRoutines((data ?? []) as Routine[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadRoutines();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadRoutines();
    });
    return () => subscription.remove();
  }, [userId]);

  async function toggleHabit(habit: Habit) {
    const todaysCompletion = getCompletionForDate(habit, today);

    // Delete an existing completion or insert a new one for today.
    const result = todaysCompletion
      ? await supabase!.from('habit_completions').delete().eq('id', todaysCompletion.id)
      : await supabase!.from('habit_completions').insert({
        completed_on: today,
        habit_id: habit.id,
        user_id: userId,
      });

    if (result.error) Alert.alert('Could not update habit', result.error.message);
    else loadRoutines();
  }

  if (isLoading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Only routines due today contribute habits or progress to this screen.
  const scheduledRoutines = routines.filter((routine) => isRoutineScheduled(routine, currentDate));
  const habits = scheduledRoutines.flatMap((routine) =>
    routine.habits.map((habit) => ({ habit, routineName: routine.name })),
  );

  const completedCount = habits.filter(({ habit }) =>
    Boolean(getCompletionForDate(habit, today)),
  ).length;

  const firstName = fullName?.trim().split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Welcome, {firstName}!</Text>
            <Text style={styles.date}>
              {currentDate.toLocaleDateString('en-IE', {
                day: 'numeric',
                month: 'long',
                weekday: 'long',
              })}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Create routine" onPress={onCreateRoutine} style={styles.addIcon}>
              <Plus color={colors.white} size={22} />
            </Pressable>
            <Pressable
              accessibilityLabel="Log out"
              onPress={() => supabase!.auth.signOut()}
              style={styles.logoutIcon}
            >
              <LogOut color={colors.muted} size={20} />
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressNumber}>{completedCount}/{habits.length}</Text>
            <Text style={styles.progressLabel}>done</Text>
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>Today’s progress</Text>
            <Text style={styles.summaryDescription}>
              {habits.length === 0
                ? routines.length === 0
                  ? 'Create your first routine to begin.'
                  : 'Nothing is scheduled for today.'
                : completedCount === habits.length
                  ? 'Everything is complete. Well done!'
                  : 'Small steps still count. Keep going!'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's habits</Text>
          <Text style={styles.sectionCount}>{completedCount} of {habits.length}</Text>
        </View>

        {habits.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Sprout color={colors.primary} size={28} />
            </View>
            <Text style={styles.emptyTitle}>
              {routines.length === 0 ? 'Your fresh start begins here' : 'No habits scheduled today'}
            </Text>
            <Text style={styles.emptyText}>
              {routines.length === 0
                ? 'Create a routine and add the small habits you want to complete each day.'
                : 'Your routines will appear here on their scheduled days.'}
            </Text>
          </View>
        ) : (
          habits.map(({ habit, routineName }) => {
            const isComplete = Boolean(getCompletionForDate(habit, today));

            return (
              <Pressable
                key={habit.id}
                accessibilityLabel={habit.title}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isComplete }}
                onPress={() => toggleHabit(habit)}
                style={styles.habitCard}
              >
                <View style={styles.habitIcon}>
                  <Sprout color={colors.primary} size={22} />
                </View>
                <View style={styles.habitText}>
                  <Text style={[styles.habitTitle, isComplete && styles.completedTitle]}>
                    {habit.title}
                  </Text>
                  <Text style={styles.routineName}>{routineName}</Text>
                </View>
                <View style={[styles.checkbox, isComplete && styles.checkboxComplete]}>
                  {isComplete && <Check color={colors.white} size={18} strokeWidth={3} />}
                </View>
              </Pressable>
            );
          })
        )}

        <Pressable onPress={onCreateRoutine} style={styles.createButton}>
          <Plus color={colors.primary} size={20} />
          <Text style={styles.createButtonText}>Add Routine</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

