import { useEffect, useState } from 'react';
import { CalendarDays, Lightbulb, Plus, Sun } from 'lucide-react-native';
import { ActivityIndicator, AppState, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { styles } from '../design/styles/routinesStyles';
import { colors } from '../design/theme';
import { getLocalDate, getScheduleLabel, isRoutineScheduled } from '../lib/dates';
import { supabase } from '../lib/supabase';
import type { Routine } from '../types';

type Props = {
  onCreateRoutine: () => void;
  userId: string;
};

export function RoutinesScreen({ onCreateRoutine, userId }: Props) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const today = getLocalDate(currentDate);

  async function loadRoutines() {
    setCurrentDate(new Date());
    const { data, error } = await supabase!
      .from('routines')
      .select(`
        id, name, schedule_type, selected_days, scheduled_time,
        habits(id, title, habit_completions(id, completed_on))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    setErrorMessage(error ? error.message : '');
    if (!error) setRoutines((data ?? []) as Routine[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadRoutines();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadRoutines();
    });
    return () => subscription.remove();
  }, [userId]);

  const isEmpty = !isLoading && !errorMessage && routines.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>My Routines</Text>
          {!isEmpty && (
            <Pressable accessibilityLabel="Create routine" accessibilityRole="button" onPress={onCreateRoutine} style={styles.addButton}>
              <Plus color={colors.primary} size={22} />
            </Pressable>
          )}
        </View>
        <Text style={styles.subtitle}>
          {isEmpty ? 'Your space for small, meaningful steps.' : 'A little structure. A lot more possibility.'}
        </Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" />
        ) : errorMessage ? (
          <View style={styles.message}>
            <Text style={styles.emptyTitle}>Could not load routines</Text>
            <Text accessibilityRole="alert" style={styles.emptyText}>{errorMessage}</Text>
            <Pressable accessibilityRole="button" onPress={loadRoutines} style={styles.createButton}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        ) : isEmpty ? (
          <>
            <View style={styles.emptyState}>
              <Image source={require('../assets/routines-empty.png')} style={styles.emptyImage} />
              <View style={styles.emptyCopy}>
                <Text style={styles.emptyTitle}>Your next chapter starts here.</Text>
                <Text style={styles.emptyText}>
                  No routines yet. Turn a few simple habits into a rhythm that works for you.
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={onCreateRoutine} style={styles.createButton}>
                <Plus color={colors.white} size={18} />
                <Text style={styles.buttonText}>Create your first routine</Text>
              </Pressable>
            </View>
            <View style={styles.suggestion}>
              <Lightbulb color="#6453AC" size={22} />
              <Text style={styles.suggestionText}>
                Try a morning routine with just two habits. Start small, grow naturally.
              </Text>
            </View>
          </>
        ) : (
          <>
            {(['daily', 'weekly'] as const).map((scheduleType) => {
              const group = routines.filter((routine) => routine.schedule_type === scheduleType);
              if (group.length === 0) return null;

              return (
                <View key={scheduleType} style={styles.group}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{scheduleType === 'daily' ? 'Daily' : 'Weekly'}</Text>
                    <Text style={styles.detail}>{group.length} {group.length === 1 ? 'routine' : 'routines'}</Text>
                  </View>
                  {group.map((routine) => {
                    const isDue = isRoutineScheduled(routine, currentDate);
                    const completedCount = isDue ? routine.habits.filter((habit) =>
                      habit.habit_completions.some((completion) => completion.completed_on === today),
                    ).length : 0;
                    const habitCount = routine.habits.length;

                    return (
                      <View key={routine.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                          <View style={styles.routineIcon}>
                            {scheduleType === 'daily'
                              ? <Sun color={colors.primary} size={20} />
                              : <CalendarDays color={colors.primary} size={20} />}
                          </View>
                          <View style={styles.routineDetails}>
                            <Text style={styles.routineName}>{routine.name}</Text>
                            <Text style={styles.schedule}>{getScheduleLabel(routine)}</Text>
                          </View>
                        </View>
                        <View style={styles.sectionHeader}>
                          <Text style={styles.detail}>{habitCount} {habitCount === 1 ? 'habit' : 'habits'}</Text>
                          <Text style={[styles.detail, isDue && styles.progressText]}>
                            {isDue ? `${completedCount}/${habitCount} done today` : 'Not scheduled today'}
                          </Text>
                        </View>
                        <View
                          accessible
                          accessibilityLabel={`Today's progress for ${routine.name}`}
                          accessibilityRole="progressbar"
                          accessibilityValue={{ min: 0, max: habitCount || 1, now: completedCount }}
                          style={styles.progressBar}
                        >
                          <View style={[styles.progressFill, { width: `${habitCount ? completedCount / habitCount * 100 : 0}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
            <Pressable accessibilityRole="button" onPress={onCreateRoutine} style={styles.createButton}>
              <Plus color={colors.white} size={18} />
              <Text style={styles.buttonText}>Create Routine</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
