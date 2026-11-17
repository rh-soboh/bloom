import { StyleSheet } from 'react-native';

import { colors } from '../theme';

export const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 12 },
  tab: { alignItems: 'center', flex: 1, gap: 3, justifyContent: 'center', minHeight: 54 },
  icon: { alignItems: 'center', borderRadius: 100, height: 27, justifyContent: 'center', width: 48 },
  selectedIcon: { backgroundColor: colors.lavender },
  label: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  selectedLabel: { color: colors.primary, fontWeight: '600' },
});
