import { StyleSheet } from 'react-native';

import { colors } from '../theme';

export const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  page: { flexGrow: 1, padding: 20, paddingBottom: 36 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  title: { color: colors.text, flex: 1, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 22, marginTop: 6 },
  addButton: {
    alignItems: 'center', backgroundColor: colors.lavender, borderRadius: 14,
    height: 40, justifyContent: 'center', width: 40,
  },
  createButton: {
    alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14,
    flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 22, minHeight: 50,
  },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
});
