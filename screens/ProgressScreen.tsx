import { useEffect, useState } from 'react';
import { Check, Sprout } from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { AppTab, BottomNavigation } from '../components/BottomNavigation';
import { styles } from '../design/styles/progressStyles';
import { colors } from '../design/theme';
import { getDateKey } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { Habit, Routine } from '../types';

type Props = {
  onNavigate: (tab: AppTab) => void;
  userId: string;
};

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getCalendarCells(referenceDate: Date): (number | null)[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstWeekday).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getCompletionForDate(habit: Habit, date: string) {
  return habit.habit_completions.find((completion) => completion.completed_on === date);
}

export function ProgressScreen({ onNavigate, userId }: Props) {
  const today = new Date();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateKey(today));
  const [isLoading, setIsLoading] = useState(true);

  async function loadHistory() {
    const { data, error } = await supabase!
      .from('routines')
      .select(
        'id, name, schedule_days, scheduled_time, archived_at, habits(id, title, archived_at, habit_completions(id, completed_on))',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) Alert.alert('Could not load history', error.message);
    else setRoutines((data ?? []) as Routine[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const year = today.getFullYear();
  const month = today.getMonth();
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthName = today.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });
  const calendarCells = getCalendarCells(today);

  const allHabits = routines.flatMap((routine) =>
    routine.habits.map((habit) => ({ habit, routineName: routine.name })),
  );
  const monthCompletionCount = allHabits.reduce(
    (total, { habit }) =>
      total + habit.habit_completions.filter((completion) => completion.completed_on.startsWith(monthPrefix)).length,
    0,
  );
  const selectedHabits = allHabits.filter(({ habit }) => getCompletionForDate(habit, selectedDate));
  const selectedDateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });

  function selectDay(day: number) {
    setSelectedDate(getDateKey(new Date(year, month, day)));
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingPage}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
        <BottomNavigation activeTab="progress" onChange={onNavigate} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Look back at the small steps you completed.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{monthCompletionCount}</Text>
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>habits completed</Text>
            <Text style={styles.summaryDescription}>during {monthName}</Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <View style={styles.calendarRow}>
            {WEEKDAY_LABELS.map((label, index) => (
              <Text key={`${label}-${index}`} style={styles.weekday}>{label}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarCells.map((day, index) => {
              if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

              const date = getDateKey(new Date(year, month, day));
              const hasCompletion = allHabits.some(({ habit }) => getCompletionForDate(habit, date));
              const isSelected = selectedDate === date;
              const isFuture = new Date(year, month, day) > today;

              return (
                <Pressable
                  accessibilityLabel={`Open ${date}`}
                  disabled={isFuture}
                  key={date}
                  onPress={() => selectDay(day)}
                  style={[
                    styles.dayCell,
                    hasCompletion && styles.completedDay,
                    isSelected && styles.selectedDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isFuture && styles.futureDayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>
                  {hasCompletion && !isSelected && <View style={styles.completionDot} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.historyCard}>
          <View style={styles.historyHeading}>
            <Text style={styles.historyDate}>{selectedDateLabel}</Text>
            <Text style={styles.historyCount}>{selectedHabits.length} complete</Text>
          </View>

          {selectedHabits.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Sprout color={colors.primary} size={25} />
              <Text style={styles.emptyHistoryText}>No completed habits recorded for this day.</Text>
            </View>
          ) : (
            selectedHabits.map(({ habit, routineName }) => (
              <View key={habit.id} style={styles.historyRow}>
                <View style={styles.checkIcon}>
                  <Check color={colors.green} size={14} strokeWidth={3} />
                </View>
                <View style={styles.habitText}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.routineName}>{routineName}</Text>
                </View>
                <Text style={styles.doneText}>Done</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <BottomNavigation activeTab="progress" onChange={onNavigate} />
    </SafeAreaView>
  );
}
