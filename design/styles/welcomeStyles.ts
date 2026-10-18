import { StyleSheet } from 'react-native';

import { colors } from '../theme';

export const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  page: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  illustration: {
    backgroundColor: colors.lavender,
    borderRadius: 28,
    height: 292,
    width: '100%',
  },
  promise: { alignItems: 'center', gap: 14, width: '100%' },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.greenSoft,
    borderRadius: 100,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: colors.green, fontSize: 11, fontWeight: '700' },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 35,
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: { gap: 10, width: '100%' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryButtonText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  note: { color: colors.muted, fontSize: 11, textAlign: 'center' },
});
