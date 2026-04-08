import { colors, fontSize, spacing, borderRadius, shadows, screenPadding } from '../constants/token';
import { StyleSheet } from 'react-native';

export const layoutStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: screenPadding.horizontal,
    paddingBottom: 120, // Tab bar padding
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButtonBg: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const textStyles = StyleSheet.create({
  h1: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  h2: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  h3: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: fontSize.base,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.inactiveText,
  },
});

export const cardStyles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    ...shadows.md,
  },
  listContainer: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'transparent',
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(101, 68, 69, 0.08)',
  },
});