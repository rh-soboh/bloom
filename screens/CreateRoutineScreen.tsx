import { useState } from 'react';
import { ArrowLeft, Clock3, GripVertical, Plus, Sprout, X } from 'lucide-react-native';
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
import { DAY_OPTIONS } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { DayCode, Routine } from '../types';

type EditableHabit = {
  id?: string;
  title: string;
};

type Props = {
  onCancel: () => void;
  onDelete?: () => void;
  onSaved: () => void;
  routine?: Routine | null;
  userId: string;
};

const ALL_DAYS = DAY_OPTIONS.map((day) => day.code);
const WEEKDAYS: DayCode[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

export function CreateRoutineScreen({ onCancel, onDelete, onSaved, routine, userId }: Props) {
  const startingDays = routine?.schedule_days ?? ALL_DAYS;
  const startingHabits = routine?.habits
    .filter((habit) => !habit.archived_at)
    .map((habit) => ({ id: habit.id, title: habit.title })) ?? [{ title: '' }];

  const [routineName, setRoutineName] = useState(routine?.name ?? '');
  const [habits, setHabits] = useState<EditableHabit[]>(startingHabits);
  const [repeatMode, setRepeatMode] = useState<'daily' | 'weekly'>(
    startingDays.length === 7 ? 'daily' : 'weekly',
  );
  const [selectedDays, setSelectedDays] = useState<DayCode[]>(startingDays);
  const [scheduledTime, setScheduledTime] = useState(routine?.scheduled_time?.slice(0, 5) ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(routine);

  function changeRepeatMode(mode: 'daily' | 'weekly') {
    setRepeatMode(mode);
    setSelectedDays(mode === 'daily' ? ALL_DAYS : WEEKDAYS);
  }

  function toggleDay(day: DayCode) {
    if (repeatMode === 'daily') return;

    setSelectedDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day],
    );
  }

  function updateHabit(index: number, title: string) {
    const updatedHabits = [...habits];
    updatedHabits[index] = { ...updatedHabits[index], title };
    setHabits(updatedHabits);
  }

  function removeHabit(index: number) {
    setHabits(habits.filter((_, habitIndex) => habitIndex !== index));
  }

  async function createRoutine(cleanName: string, cleanHabits: EditableHabit[]) {
    const { data: newRoutine, error: routineError } = await supabase!
      .from('routines')
      .insert({
        name: cleanName,
        schedule_days: selectedDays,
        scheduled_time: scheduledTime || null,
        user_id: userId,
      })
      .select('id')
      .single();

    if (routineError) return routineError;

    const { error: habitsError } = await supabase!.from('habits').insert(
      cleanHabits.map((habit) => ({ routine_id: newRoutine.id, title: habit.title })),
    );

    if (habitsError) {
      await supabase!.from('routines').delete().eq('id', newRoutine.id);
      return habitsError;
    }

    return null;
  }

  async function updateRoutine(cleanName: string, cleanHabits: EditableHabit[]) {
    const { error: routineError } = await supabase!
      .from('routines')
      .update({
        name: cleanName,
        schedule_days: selectedDays,
        scheduled_time: scheduledTime || null,
      })
      .eq('id', routine!.id);

    if (routineError) return routineError;

    const keptIds = cleanHabits.flatMap((habit) => (habit.id ? [habit.id] : []));
    const removedIds = routine!.habits
      .filter((habit) => !habit.archived_at && !keptIds.includes(habit.id))
      .map((habit) => habit.id);

    if (removedIds.length > 0) {
      const { error } = await supabase!
        .from('habits')
        .update({ archived_at: new Date().toISOString() })
        .in('id', removedIds);
      if (error) return error;
    }

    for (const habit of cleanHabits.filter((item) => item.id)) {
      const { error } = await supabase!
        .from('habits')
        .update({ title: habit.title })
        .eq('id', habit.id!);
      if (error) return error;
    }

    const newHabits = cleanHabits.filter((habit) => !habit.id);
    if (newHabits.length > 0) {
      const { error } = await supabase!.from('habits').insert(
        newHabits.map((habit) => ({ routine_id: routine!.id, title: habit.title })),
      );
      if (error) return error;
    }

    return null;
  }

  async function saveRoutine() {
    const cleanName = routineName.trim();
    const cleanHabits = habits
      .map((habit) => ({ ...habit, title: habit.title.trim() }))
      .filter((habit) => habit.title);

    if (!cleanName || cleanHabits.length === 0) {
      Alert.alert('Missing details', 'Enter a routine name and at least one habit.');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Choose a day', 'Select at least one day for this routine.');
      return;
    }
    if (scheduledTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduledTime)) {
      Alert.alert('Check the time', 'Enter the time using the 24-hour HH:MM format.');
      return;
    }

    setIsSaving(true);
    const error = isEditing
      ? await updateRoutine(cleanName, cleanHabits)
      : await createRoutine(cleanName, cleanHabits);
    setIsSaving(false);

    if (error) Alert.alert('Could not save routine', error.message);
    else onSaved();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable accessibilityLabel="Go back" onPress={onCancel} style={styles.backButton}>
              <ArrowLeft color={colors.text} size={22} />
            </Pressable>
            <Text style={styles.title}>{isEditing ? 'Edit Routine' : 'Create Routine'}</Text>
          </View>
          <Text style={styles.subtitle}>
            {isEditing ? 'Make this routine work for you.' : 'Give your next small step a little structure.'}
          </Text>

          <Text style={styles.label}>Routine name</Text>
          <View style={styles.inputRow}>
            <Sprout color={colors.muted} size={19} />
            <TextInput
              autoFocus={!isEditing}
              maxLength={80}
              onChangeText={setRoutineName}
              placeholder="For example: Morning Routine"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={routineName}
            />
          </View>

          <Text style={styles.sectionTitle}>Repeat</Text>
          <View style={styles.repeatSelector}>
            {(['daily', 'weekly'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => changeRepeatMode(mode)}
                style={[styles.repeatOption, repeatMode === mode && styles.repeatOptionSelected]}
              >
                <Text
                  style={[
                    styles.repeatOptionText,
                    repeatMode === mode && styles.repeatOptionTextSelected,
                  ]}
                >
                  {mode === 'daily' ? 'Daily' : 'Weekly'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.daysRow}>
            {DAY_OPTIONS.map((day) => {
              const isSelected = selectedDays.includes(day.code);
              return (
                <Pressable
                  accessibilityLabel={day.name}
                  key={day.code}
                  onPress={() => toggleDay(day.code)}
                  style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habits</Text>
            <Text style={styles.habitCount}>{habits.length} habits</Text>
          </View>

          {habits.map((habit, index) => (
            <View key={habit.id ?? index} style={styles.habitRow}>
              <GripVertical color={colors.placeholder} size={18} />
              <TextInput
                maxLength={120}
                onChangeText={(value) => updateHabit(index, value)}
                placeholder={`Habit ${index + 1}`}
                placeholderTextColor={colors.placeholder}
                style={styles.habitInput}
                value={habit.title}
              />
              {habits.length > 1 && (
                <Pressable
                  accessibilityLabel={`Remove habit ${index + 1}`}
                  onPress={() => removeHabit(index)}
                >
                  <X color={colors.muted} size={18} />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable
            onPress={() => setHabits([...habits, { title: '' }])}
            style={styles.addHabitButton}
          >
            <Plus color={colors.primary} size={18} />
            <Text style={styles.addHabitText}>Add habit</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.inputRow}>
            <Clock3 color={colors.primary} size={19} />
            <TextInput
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              onChangeText={setScheduledTime}
              placeholder="Optional, for example 07:00"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={scheduledTime}
            />
          </View>
          <Text style={styles.timeHint}>Use the 24-hour HH:MM format.</Text>

          <View style={styles.actions}>
            <Pressable disabled={isSaving} onPress={saveRoutine} style={styles.saveButton}>
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Save Changes' : 'Save Routine'}
                </Text>
              )}
            </Pressable>
            <View style={styles.secondaryActions}>
              <Pressable disabled={isSaving} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              {isEditing && onDelete && (
                <Pressable disabled={isSaving} onPress={onDelete}>
                  <Text style={styles.deleteButtonText}>Delete Routine</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
