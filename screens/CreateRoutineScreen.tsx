import { useState } from 'react';
import { ArrowLeft, ChevronRight, Clock3, GripVertical, Plus, Trash2 } from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { styles } from '../design/styles/createRoutineStyles';
import { colors } from '../design/theme';
import { isValidTime, weekdays } from '../lib/dates';
import { supabase } from '../lib/supabase';
import type { Routine } from '../types';

type Props = {
  onCancel: () => void;
  onSaved: () => void;
  routine?: Routine;
  userId: string;
};

type HabitDraft = { id?: string; title: string };

export function CreateRoutineScreen({ onCancel, onSaved, routine, userId }: Props) {
  const [routineName, setRoutineName] = useState(routine?.name ?? '');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly'>(routine?.schedule_type ?? 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(routine?.selected_days ?? []);
  const [habitDrafts, setHabitDrafts] = useState<HabitDraft[]>(() =>
    routine ? routine.habits.map(({ id, title }) => ({ id, title })) : [{ title: '' }],
  );
  const [scheduledTime, setScheduledTime] = useState(routine?.scheduled_time?.slice(0, 5) ?? '');
  const [isSaving, setIsSaving] = useState(false);

  function updateHabitName(index: number, title: string) {
    setHabitDrafts(habitDrafts.map((habit, itemIndex) =>
      itemIndex === index ? { ...habit, title } : habit,
    ));
  }

  function removeHabit(index: number) {
    setHabitDrafts(habitDrafts.filter((_, itemIndex) => itemIndex !== index));
  }

  async function updateExistingHabits() {
    if (!routine) return false;

    const savedHabits = habitDrafts.filter((habit): habit is HabitDraft & { id: string } => Boolean(habit.id));
    const newHabits = habitDrafts.filter((habit) => !habit.id).map((habit) => ({
      routine_id: routine.id,
      title: habit.title.trim(),
    }));
    const removedIds = routine.habits
      .filter((habit) => !habitDrafts.some((draft) => draft.id === habit.id))
      .map((habit) => habit.id);

    // Update the saved rows first, then add new rows and remove deleted ones.
    for (const habit of savedHabits) {
      const { error } = await supabase!.from('habits')
        .update({ title: habit.title.trim() })
        .eq('id', habit.id)
        .eq('routine_id', routine.id);
      if (error) {
        Alert.alert('Could not update habit', error.message);
        return false;
      }
    }

    if (newHabits.length > 0) {
      const { error } = await supabase!.from('habits').insert(newHabits);
      if (error) {
        Alert.alert('Could not add habits', error.message);
        return false;
      }
    }

    if (removedIds.length > 0) {
      const { error } = await supabase!.from('habits').delete()
        .in('id', removedIds)
        .eq('routine_id', routine.id);
      if (error) {
        Alert.alert('Could not remove habits', error.message);
        return false;
      }
    }

    return true;
  }

  function toggleDay(day: number) {
    setSelectedDays(
      selectedDays.includes(day)
        ? selectedDays.filter((selectedDay) => selectedDay !== day)
        : [...selectedDays, day],
    );
  }

  async function saveRoutine() {
    const cleanRoutineName = routineName.trim();
    const cleanHabits = habitDrafts.map((habit) => ({ ...habit, title: habit.title.trim() }));
    const cleanTime = scheduledTime.trim();

    if (!cleanRoutineName) {
      Alert.alert('Missing details', 'Enter a routine name.');
      return;
    }

    if (cleanHabits.length === 0 || cleanHabits.some((habit) => !habit.title)) {
      Alert.alert('Check the habits', 'Keep at least one habit and enter a name for each one.');
      return;
    }

    if (scheduleType === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Choose a day', 'Select at least one weekday for this routine.');
      return;
    }

    if (cleanTime && !isValidTime(cleanTime)) {
      Alert.alert('Invalid time', 'Use HH:MM in 24-hour format, such as 09:00, or leave the time blank.');
      return;
    }

    setIsSaving(true);

    const routineDetails = {
      name: cleanRoutineName,
      schedule_type: scheduleType,
      selected_days: scheduleType === 'weekly' ? selectedDays : [],
      scheduled_time: cleanTime || null,
    };

    // Editing keeps the same routine ID and changes its schedule details.
    if (routine) {
      const { error } = await supabase!
        .from('routines')
        .update(routineDetails)
        .eq('id', routine.id)
        .eq('user_id', userId)
        .select('id')
        .single();

      if (error) {
        setIsSaving(false);
        Alert.alert('Could not update routine', error.message);
        return;
      }

      const habitsSaved = await updateExistingHabits();
      setIsSaving(false);
      if (habitsSaved) onSaved();
      return;
    }

    // Create the parent routine and return its generated ID.
    const { data: newRoutine, error: routineError } = await supabase!
      .from('routines')
      .insert({
        ...routineDetails,
        user_id: userId,
      })
      .select('id')
      .single();

    if (routineError) {
      setIsSaving(false);
      Alert.alert('Could not save routine', routineError.message);
      return;
    }

    // Each child habit uses the new routine ID as its foreign key.
    const newHabits = cleanHabits.map(({ title }) => ({
      routine_id: newRoutine.id,
      title,
    }));

    const { error: habitsError } = await supabase!.from('habits').insert(newHabits);

    if (habitsError) {
      // Remove the empty parent routine if its habits failed to save.
      await supabase!.from('routines').delete().eq('id', newRoutine.id);
      setIsSaving(false);
      Alert.alert('Could not save habits', habitsError.message);
      return;
    }

    setIsSaving(false);
    onSaved();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable accessibilityLabel="Go back" accessibilityRole="button" disabled={isSaving} onPress={onCancel} style={styles.backButton}>
              <ArrowLeft color={colors.text} size={22} />
            </Pressable>
            <Text style={styles.title}>{routine ? 'Edit Routine' : 'Create Routine'}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.label}>Routine name</Text>
          <TextInput
            accessibilityLabel="Routine name"
            autoFocus
            editable={!isSaving}
            maxLength={80}
            onChangeText={setRoutineName}
            placeholder="For example: Morning Routine"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            value={routineName}
          />

          <View style={styles.frequencySection}>
            <Text style={styles.label}>Repeat</Text>
            <View style={styles.scheduleOptions}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: scheduleType === 'daily' }}
                disabled={isSaving}
                onPress={() => setScheduleType('daily')}
                style={[styles.scheduleOption, scheduleType === 'daily' && styles.selectedScheduleOption]}
              >
                <Text style={[styles.scheduleText, scheduleType === 'daily' && styles.selectedScheduleText]}>
                  Daily
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: scheduleType === 'weekly' }}
                disabled={isSaving}
                onPress={() => setScheduleType('weekly')}
                style={[styles.scheduleOption, scheduleType === 'weekly' && styles.selectedScheduleOption]}
              >
                <Text style={[styles.scheduleText, scheduleType === 'weekly' && styles.selectedScheduleText]}>
                  Weekly
                </Text>
              </Pressable>
            </View>
            {scheduleType === 'weekly' && (
              <View style={styles.weekdays}>
                {weekdays.map((day) => {
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <Pressable
                      key={day.value}
                      accessibilityLabel={day.name}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      disabled={isSaving}
                      onPress={() => toggleDay(day.value)}
                      style={[styles.dayButton, isSelected && styles.selectedDayButton]}
                    >
                      <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                        {day.name[0]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habits</Text>
            <Text style={styles.habitCount}>{habitDrafts.length}</Text>
          </View>

          {habitDrafts.map((habit, index) => (
            <View key={habit.id ?? `new-${index}`} style={styles.habitRow}>
              <GripVertical color="#A5ADBA" size={20} />
              <TextInput
                accessibilityLabel={`Habit ${index + 1}`}
                editable={!isSaving}
                maxLength={120}
                onChangeText={(value) => updateHabitName(index, value)}
                placeholder={`Habit ${index + 1}`}
                placeholderTextColor={colors.placeholder}
                style={styles.habitInput}
                value={habit.title}
              />
              {habitDrafts.length > 1 && (
                <Pressable accessibilityLabel={`Remove habit ${index + 1}`} accessibilityRole="button" disabled={isSaving} onPress={() => removeHabit(index)}>
                  <Trash2 color="#D15C5C" size={20} />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable accessibilityRole="button" disabled={isSaving} onPress={() => setHabitDrafts([...habitDrafts, { title: '' }])} style={styles.addHabitButton}>
            <Plus color={colors.primary} size={19} />
            <Text style={styles.addHabitText}>Add habit</Text>
          </Pressable>

          <View style={styles.timeRow}>
            <View style={styles.timeIcon}>
              <Clock3 color={colors.primary} size={18} />
            </View>
            <View style={styles.timeDetails}>
              <Text style={styles.timeTitle}>Routine time</Text>
              <Text style={styles.timeHint}>Optional · 24-hour time</Text>
            </View>
            <TextInput
              accessibilityHint="Enter a time such as 09:00, or leave blank."
              accessibilityLabel="Routine time (optional)"
              autoCorrect={false}
              clearButtonMode="while-editing"
              editable={!isSaving}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              onChangeText={setScheduledTime}
              placeholder="HH:MM"
              placeholderTextColor={colors.placeholder}
              style={styles.timeInput}
              value={scheduledTime}
            />
            <ChevronRight color={colors.placeholder} size={16} />
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={isSaving} onPress={saveRoutine} style={styles.saveButton}>
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>{routine ? 'Save Changes' : 'Save Routine'}</Text>
              )}
            </Pressable>
            <Pressable accessibilityRole="button" disabled={isSaving} onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
