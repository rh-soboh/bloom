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

export function CreateRoutineScreen({ onCancel, onSaved, routine, userId }: Props) {
  const [routineName, setRoutineName] = useState(routine?.name ?? '');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly'>(routine?.schedule_type ?? 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(routine?.selected_days ?? []);
  const [habitNames, setHabitNames] = useState(['']);
  const [scheduledTime, setScheduledTime] = useState(routine?.scheduled_time?.slice(0, 5) ?? '');
  const [isSaving, setIsSaving] = useState(false);

  function updateHabitName(index: number, value: string) {
    const updatedNames = [...habitNames];
    updatedNames[index] = value;
    setHabitNames(updatedNames);
  }

  function removeHabit(index: number) {
    setHabitNames(habitNames.filter((_, itemIndex) => itemIndex !== index));
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
    const cleanHabitNames = habitNames.map((name) => name.trim()).filter(Boolean);
    const cleanTime = scheduledTime.trim();

    if (!cleanRoutineName) {
      Alert.alert('Missing details', 'Enter a routine name.');
      return;
    }

    if (!routine && cleanHabitNames.length === 0) {
      Alert.alert('Missing details', 'Enter a routine name and at least one habit.');
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

    // Editing updates the existing row, leaving its habits and completions intact.
    if (routine) {
      const { error } = await supabase!
        .from('routines')
        .update(routineDetails)
        .eq('id', routine.id)
        .eq('user_id', userId)
        .select('id')
        .single();

      setIsSaving(false);
      if (error) Alert.alert('Could not update routine', error.message);
      else onSaved();
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
    const newHabits = cleanHabitNames.map((title) => ({
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
            <Text style={styles.habitCount}>{routine ? routine.habits.length : habitNames.length}</Text>
          </View>

          {routine ? routine.habits.map((habit) => (
            <View key={habit.id} style={styles.habitRow}>
              <Text style={styles.savedHabitTitle}>{habit.title}</Text>
            </View>
          )) : habitNames.map((habitName, index) => (
            <View key={index} style={styles.habitRow}>
              <GripVertical color="#A5ADBA" size={20} />
              <TextInput
                maxLength={120}
                onChangeText={(value) => updateHabitName(index, value)}
                placeholder={`Habit ${index + 1}`}
                placeholderTextColor={colors.placeholder}
                style={styles.habitInput}
                value={habitName}
              />
              {habitNames.length > 1 && (
                <Pressable accessibilityLabel={`Remove habit ${index + 1}`} onPress={() => removeHabit(index)}>
                  <Trash2 color="#D15C5C" size={20} />
                </Pressable>
              )}
            </View>
          ))}

          {!routine && (
            <Pressable onPress={() => setHabitNames([...habitNames, ''])} style={styles.addHabitButton}>
              <Plus color={colors.primary} size={19} />
              <Text style={styles.addHabitText}>Add habit</Text>
            </Pressable>
          )}

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
