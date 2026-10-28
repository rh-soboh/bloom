import { useEffect, useState } from 'react';
import { CalendarDays, Pencil, Plus, Sprout, Sun, Trash2 } from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AppTab, BottomNavigation } from '../components/BottomNavigation';
import { styles } from '../design/styles/routinesStyles';
import { colors } from '../design/theme';
import { getDateKey, getScheduleLabel } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { Routine } from '../types';

type Props = {
  onCreateRoutine: () => void;
  onEditRoutine: (routine: Routine) => void;
  onNavigate: (tab: AppTab) => void;
  userId: string;
};

export function RoutinesScreen({ onCreateRoutine, onEditRoutine, onNavigate, userId }: Props) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const today = getDateKey();

  async function loadRoutines() {
    const { data, error } = await supabase!
      .from('routines')
      .select(
        'id, name, schedule_days, scheduled_time, archived_at, habits(id, title, archived_at, habit_completions(id, completed_on))',
      )
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('created_at', { ascending: true });

    if (error) Alert.alert('Could not load routines', error.message);
    else {
      const activeRoutines = ((data ?? []) as Routine[]).map((routine) => ({
        ...routine,
        habits: routine.habits.filter((habit) => !habit.archived_at),
      }));
      setRoutines(activeRoutines);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadRoutines();
  }, [userId]);

  async function deleteRoutine() {
    if (!routineToDelete) return;

    const { error } = await supabase!
      .from('routines')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', routineToDelete.id);

    if (error) Alert.alert('Could not delete routine', error.message);
    else setRoutines((current) => current.filter((routine) => routine.id !== routineToDelete.id));
    setRoutineToDelete(null);
  }

  function renderRoutine(routine: Routine) {
    const completedCount = routine.habits.filter((habit) =>
      habit.habit_completions.some((completion) => completion.completed_on === today),
    ).length;
    const total = routine.habits.length;
    const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);
    const Icon = routine.schedule_days.length === 7 ? Sun : CalendarDays;

    return (
      <View key={routine.id} style={styles.routineCard}>
        <View style={styles.routineSummary}>
          <View style={styles.routineIcon}>
            <Icon color={colors.primary} size={20} />
          </View>
          <View style={styles.routineDetails}>
            <Text style={styles.routineName}>{routine.name}</Text>
            <Text style={styles.schedule}>{getScheduleLabel(routine.schedule_days, routine.scheduled_time)}</Text>
          </View>
          <Pressable accessibilityLabel={`Edit ${routine.name}`} onPress={() => onEditRoutine(routine)} style={styles.iconButton}>
            <Pencil color={colors.primary} size={17} />
          </Pressable>
          <Pressable
            accessibilityLabel={`Delete ${routine.name}`}
            onPress={() => setRoutineToDelete(routine)}
            style={styles.iconButton}
          >
            <Trash2 color={colors.muted} size={17} />
          </Pressable>
        </View>
        <View style={styles.completionRow}>
          <Text style={styles.habitTotal}>{total} {total === 1 ? 'habit' : 'habits'}</Text>
          <Text style={[styles.completionText, completedCount === total && total > 0 && styles.completionDone]}>
            {completedCount}/{total} complete
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` as `${number}%` }]} />
        </View>
      </View>
    );
  }

  const dailyRoutines = routines.filter((routine) => routine.schedule_days.length === 7);
  const weeklyRoutines = routines.filter((routine) => routine.schedule_days.length < 7);

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <View style={styles.loadingPage}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.page}>
          <View style={styles.headingRow}>
            <View style={styles.headingText}>
              <Text style={styles.title}>My Routines</Text>
              <Text style={styles.subtitle}>A little structure. A lot more possibility.</Text>
            </View>
            <Pressable accessibilityLabel="Create routine" onPress={onCreateRoutine} style={styles.addButton}>
              <Plus color={colors.primary} size={22} />
            </Pressable>
          </View>

          {routines.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Sprout color={colors.primary} size={28} />
              </View>
              <Text style={styles.emptyTitle}>Create your first routine</Text>
              <Text style={styles.emptyText}>Choose the days, add your habits and begin when you are ready.</Text>
            </View>
          ) : (
            <>
              {dailyRoutines.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeading}>
                    <Text style={styles.sectionTitle}>Daily</Text>
                    <Text style={styles.sectionCount}>{dailyRoutines.length} routines</Text>
                  </View>
                  {dailyRoutines.map(renderRoutine)}
                </View>
              )}
              {weeklyRoutines.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeading}>
                    <Text style={styles.sectionTitle}>Weekly</Text>
                    <Text style={styles.sectionCount}>{weeklyRoutines.length} routines</Text>
                  </View>
                  {weeklyRoutines.map(renderRoutine)}
                </View>
              )}
            </>
          )}

          <Pressable onPress={onCreateRoutine} style={styles.createButton}>
            <Plus color={colors.white} size={18} />
            <Text style={styles.createButtonText}>Create Routine</Text>
          </Pressable>
        </ScrollView>
      )}

      <BottomNavigation activeTab="routines" onChange={onNavigate} />

      <Modal animationType="fade" transparent visible={Boolean(routineToDelete)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <View style={styles.deleteIcon}>
              <Trash2 color="#E33546" size={25} />
            </View>
            <Text style={styles.modalTitle}>Delete {routineToDelete?.name}?</Text>
            <Text style={styles.modalText}>
              This removes the routine from your active list. Your completed habit history will stay.
            </Text>
            <Pressable onPress={deleteRoutine} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete Routine</Text>
            </Pressable>
            <Pressable onPress={() => setRoutineToDelete(null)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
