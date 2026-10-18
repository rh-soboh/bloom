import { StyleSheet } from 'react-native';

import { colors } from '../theme';

export const styles = StyleSheet.create({
  app: { backgroundColor: colors.background, flex: 1 },
  messageContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 12 },
  message: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
});
