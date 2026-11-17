import { Plus } from 'lucide-react-native';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { styles } from '../design/styles/routinesStyles';
import { colors } from '../design/theme';

type Props = {
  onCreateRoutine: () => void;
  userId: string;
};

export function RoutinesScreen({ onCreateRoutine }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>My Routines</Text>
          <Pressable accessibilityLabel="Create routine" accessibilityRole="button" onPress={onCreateRoutine} style={styles.addButton}>
            <Plus color={colors.primary} size={22} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>A little structure. A lot more possibility.</Text>
        <Pressable accessibilityRole="button" onPress={onCreateRoutine} style={styles.createButton}>
          <Plus color={colors.white} size={18} />
          <Text style={styles.buttonText}>Create Routine</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
