import { StyleSheet } from 'react-native';

import { colors } from '../theme';

export const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  page: { flexGrow: 1, padding: 20, paddingBottom: 36 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  title: { color: colors.text, flex: 1, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 22, marginTop: 6 },
  archiveToggle: { alignSelf: 'flex-end', marginBottom: 16, marginTop: -12, paddingVertical: 8 },
  archiveToggleText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  addButton: {
    alignItems: 'center', backgroundColor: colors.lavender, borderRadius: 14,
    height: 40, justifyContent: 'center', width: 40,
  },
  createButton: {
    alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14,
    alignSelf: 'stretch', flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 50,
  },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  group: { gap: 12, marginBottom: 22 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  detail: { color: colors.muted, fontSize: 11 },
  card: {
    backgroundColor: colors.white, borderRadius: 20, gap: 10, padding: 14,
    shadowColor: '#252050', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.03, shadowRadius: 12,
  },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  routineIcon: {
    alignItems: 'center', backgroundColor: colors.lavender, borderRadius: 12,
    height: 36, justifyContent: 'center', width: 36,
  },
  routineDetails: { flex: 1, gap: 4 },
  editButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 24 },
  routineName: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  schedule: { color: colors.muted, fontSize: 10, lineHeight: 14 },
  progressText: { color: colors.green },
  progressBar: { backgroundColor: colors.lavender, borderRadius: 100, height: 6, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.primary, height: 6 },
  emptyState: { alignItems: 'center', flex: 1, gap: 22, justifyContent: 'center', paddingVertical: 16 },
  emptyImage: { borderRadius: 28, height: 240, resizeMode: 'cover', width: 270 },
  emptyCopy: { gap: 10 },
  emptyTitle: { color: colors.text, fontSize: 25, fontWeight: '700', textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  suggestion: {
    alignItems: 'center', backgroundColor: colors.lavender, borderRadius: 20,
    flexDirection: 'row', gap: 12, marginTop: 22, padding: 16,
  },
  suggestionText: { color: '#6453AC', flex: 1, fontSize: 13, lineHeight: 18 },
  message: { gap: 16, paddingVertical: 24 },
});
