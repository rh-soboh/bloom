import { CircleCheck, Layers } from 'lucide-react-native';
import { Pressable, SafeAreaView, Text, View } from 'react-native';

import { styles } from '../design/styles/bottomNavigationStyles';
import { colors } from '../design/theme';

export type MainTab = 'today' | 'routines';

type Props = {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
};

export function BottomNavigation({ activeTab, onTabChange }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tabs}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'today' }}
          onPress={() => onTabChange('today')}
          style={styles.tab}
        >
          <View style={[styles.icon, activeTab === 'today' && styles.selectedIcon]}>
            <CircleCheck color={activeTab === 'today' ? colors.primary : colors.muted} size={20} />
          </View>
          <Text style={[styles.label, activeTab === 'today' && styles.selectedLabel]}>Today</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'routines' }}
          onPress={() => onTabChange('routines')}
          style={styles.tab}
        >
          <View style={[styles.icon, activeTab === 'routines' && styles.selectedIcon]}>
            <Layers color={activeTab === 'routines' ? colors.primary : colors.muted} size={20} />
          </View>
          <Text style={[styles.label, activeTab === 'routines' && styles.selectedLabel]}>Routines</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
