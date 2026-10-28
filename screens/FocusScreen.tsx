import { Timer } from 'lucide-react-native';
import { SafeAreaView, Text, View } from 'react-native';

import { AppTab, BottomNavigation } from '../components/BottomNavigation';
import { styles } from '../design/styles/focusStyles';
import { colors } from '../design/theme';

type Props = {
  onNavigate: (tab: AppTab) => void;
};

export function FocusScreen({ onNavigate }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.icon}>
          <Timer color={colors.primary} size={32} />
        </View>
        <Text style={styles.title}>Focus Sessions</Text>
        <Text style={styles.description}>
          Focus sessions are planned for Iteration 3. The tab is included now so the main navigation stays consistent.
        </Text>
      </View>
      <BottomNavigation activeTab="focus" onChange={onNavigate} />
    </SafeAreaView>
  );
}
