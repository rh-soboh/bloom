import { useState } from 'react';
import { ArrowLeft, GripVertical, Plus, Trash2 } from 'lucide-react-native';
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
import { supabase } from '../lib/supabase';

type Props = {
  onCancel: () => void;
  onSaved: () => void;
  userId: string;
};

export function CreateRoutineScreen({ onCancel, onSaved, userId }: Props) {
  const [routineName, setRoutineName] = useState('');
  const [habitNames, setHabitNames] = useState(['']);
  const [isSaving, setIsSaving] = useState(false);

  function updateHabitName(index: number, value: string) {
    const updatedNames = [...habitNames];
    updatedNames[index] = value;
    setHabitNames(updatedNames);
  }

  function removeHabit(index: number) {
    setHabitNames(habitNames.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveRoutine() {
    const cleanRoutineName = routineName.trim();
    const cleanHabitNames = habitNames.map((name) => name.trim()).filter(Boolean);

    if (!cleanRoutineName || cleanHabitNames.length === 0) {
      Alert.alert('Missing details', 'Enter a routine name and at least one habit.');
      return;
    }

    setIsSaving(true);

    // Create the parent routine and return its generated ID.
    const { data: routine, error: routineError } = await supabase!
      .from('routines')
      .insert({ name: cleanRoutineName, user_id: userId })
      .select('id')
      .single();

    if (routineError) {
      setIsSaving(false);
      Alert.alert('Could not save routine', routineError.message);
      return;
    }

    // Each child habit uses the new routine ID as its foreign key.
    const newHabits = cleanHabitNames.map((title) => ({
      routine_id: routine.id,
      title,
    }));

    const { error: habitsError } = await supabase!.from('habits').insert(newHabits);

    if (habitsError) {
      // Remove the empty parent routine if its habits failed to save.
      await supabase!.from('routines').delete().eq('id', routine.id);
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
            <Pressable accessibilityLabel="Go back" onPress={onCancel} style={styles.backButton}>
              <ArrowLeft color={colors.text} size={22} />
            </Pressable>
            <Text style={styles.title}>Create Routine</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.dailyNotice}>
            <Text style={styles.dailyNoticeTitle}>Daily routine</Text>
            <Text style={styles.dailyNoticeText}>Weekly schedules will be added in Iteration 2.</Text>
          </View>

          <Text style={styles.label}>Routine name</Text>
          <TextInput
            autoFocus
            maxLength={80}
            onChangeText={setRoutineName}
            placeholder="For example: Morning Routine"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            value={routineName}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habits</Text>
            <Text style={styles.habitCount}>{habitNames.length}</Text>
          </View>

          {habitNames.map((habitName, index) => (
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

          <Pressable onPress={() => setHabitNames([...habitNames, ''])} style={styles.addHabitButton}>
            <Plus color={colors.primary} size={19} />
            <Text style={styles.addHabitText}>Add habit</Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable disabled={isSaving} onPress={saveRoutine} style={styles.saveButton}>
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Routine</Text>
              )}
            </Pressable>
            <Pressable disabled={isSaving} onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

