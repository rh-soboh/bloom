import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { styles } from '../design/styles/progressStyles';
import { colors } from '../design/theme';
import { getLocalDate } from '../lib/dates';
import { supabase } from '../lib/supabase';

type CompletionEntry = {
  id: string;
  completed_on: string;
  habits: { title: string; routines: { name: string } };
};

type Props = { userId: string };

function getMonthRange(date: Date) {
  const firstDay = getLocalDate(new Date(date.getFullYear(), date.getMonth(), 1));
  const firstDayNextMonth = getLocalDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  return { firstDay, firstDayNextMonth };
}

function formatCompletionDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });
}

export function ProgressScreen({ userId }: Props) {
  const [entries, setEntries] = useState<CompletionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const monthLabel = currentDate.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });

  async function loadCompletions() {
    const date = new Date();
    setCurrentDate(date);
    const { firstDay, firstDayNextMonth } = getMonthRange(date);
    const { data, error } = await supabase!
      .from('habit_completions')
      .select('id, completed_on, habits!inner(title, routines!inner(name))')
      .eq('user_id', userId)
      .gte('completed_on', firstDay)
      .lt('completed_on', firstDayNextMonth)
      .order('completed_on', { ascending: false });

    setErrorMessage(error ? error.message : '');
    if (!error) setEntries((data ?? []) as unknown as CompletionEntry[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadCompletions();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadCompletions();
    });
    return () => subscription.remove();
  }, [userId]);

  const groupedEntries = entries.reduce<Record<string, CompletionEntry[]>>((groups, entry) => {
    groups[entry.completed_on] = [...(groups[entry.completed_on] ?? []), entry];
    return groups;
  }, {});
  const dates = Object.keys(groupedEntries).sort((first, second) => second.localeCompare(first));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Your completed habits this month</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{entries.length}</Text>
          <View>
            <Text style={styles.summaryLabel}>completed habits</Text>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator accessibilityLabel="Loading progress" color={colors.primary} size="large" />
        ) : errorMessage ? (
          <View style={styles.message}>
            <Text style={styles.emptyTitle}>Could not load progress</Text>
            <Text accessibilityRole="alert" style={styles.emptyText}>{errorMessage}</Text>
            <Pressable accessibilityRole="button" onPress={loadCompletions} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : dates.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No completed habits yet</Text>
            <Text style={styles.emptyText}>When you complete a habit, it will appear here by date.</Text>
          </View>
        ) : (
          dates.map((date) => (
            <View key={date} style={styles.dayGroup}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{formatCompletionDate(date)}</Text>
                <Text style={styles.dayCount}>{groupedEntries[date].length}</Text>
              </View>
              {groupedEntries[date].map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.checkMark}><Text style={styles.checkText}>✓</Text></View>
                  <View style={styles.entryDetails}>
                    <Text style={styles.habitTitle}>{entry.habits.title}</Text>
                    <Text style={styles.routineName}>{entry.habits.routines.name}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
