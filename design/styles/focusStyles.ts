import { StyleSheet } from 'react-native';

import { colors } from '../theme';

export const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  page: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 32 },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: 30,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 18 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: 'center' },
});
