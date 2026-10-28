import {
  ChartNoAxesColumnIncreasing,
  CircleCheck,
  Layers,
  Timer,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { styles } from '../design/styles/bottomNavigationStyles';
import { colors } from '../design/theme';

export type AppTab = 'today' | 'routines' | 'focus' | 'progress';

type Props = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

const TABS = [
  { icon: CircleCheck, label: 'Today', value: 'today' },
  { icon: Layers, label: 'Routines', value: 'routines' },
  { icon: Timer, label: 'Focus', value: 'focus' },
  { icon: ChartNoAxesColumnIncreasing, label: 'Progress', value: 'progress' },
] as const;

export function BottomNavigation({ activeTab, onChange }: Props) {
  return (
    <View style={styles.navigation}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        const Icon = tab.icon;

        return (
          <Pressable
            accessibilityLabel={`Open ${tab.label}`}
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={styles.tab}
          >
            <View style={[styles.iconBackground, isActive && styles.iconBackgroundActive]}>
              <Icon color={isActive ? colors.primary : colors.muted} size={20} />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
