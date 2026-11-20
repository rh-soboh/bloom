import { StyleSheet } from 'react-native';

import { colors } from '../theme';

export const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  page: { flexGrow: 1, padding: 20, paddingBottom: 36 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 13, marginBottom: 20, marginTop: 6 },
  summaryCard: {
    alignItems: 'center', backgroundColor: colors.lavender, borderRadius: 18,
    flexDirection: 'row', gap: 14, marginBottom: 24, padding: 18,
  },
  summaryNumber: { color: colors.primary, fontSize: 32, fontWeight: '700' },
  summaryLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  monthLabel: { color: colors.muted, fontSize: 12, marginTop: 4 },
  dayGroup: { gap: 10, marginBottom: 20 },
  dayHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  dayTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  dayCount: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  entryCard: {
    alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border,
    borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 13,
  },
  checkMark: {
    alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: 10,
    height: 34, justifyContent: 'center', width: 34,
  },
  checkText: { color: colors.green, fontSize: 18, fontWeight: '700' },
  entryDetails: { flex: 1, gap: 3 },
  habitTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  routineName: { color: colors.muted, fontSize: 11 },
  emptyCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 18, gap: 8, padding: 24 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  message: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  retryButton: { backgroundColor: colors.lavender, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  retryText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
