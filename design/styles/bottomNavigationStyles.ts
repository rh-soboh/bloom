import { StyleSheet } from 'react-native';

import { colors } from '../theme';

export const styles = StyleSheet.create({
  navigation: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 62,
    paddingHorizontal: 12,
  },
  tab: { alignItems: 'center', flex: 1, gap: 2, justifyContent: 'center' },
  iconBackground: {
    alignItems: 'center',
    borderRadius: 20,
    height: 28,
    justifyContent: 'center',
    width: 48,
  },
  iconBackgroundActive: { backgroundColor: colors.lavender },
  label: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  labelActive: { color: colors.primary, fontWeight: '700' },
});
