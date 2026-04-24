import { colors as lightColors, darkColors, fontSize, spacing, borderRadius, shadows, screenPadding } from '../constants/token';
import { StyleSheet } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';

export const useStyles = () => {
  const { isDarkMode } = useSettingsStore();
  const colors = isDarkMode ? darkColors : lightColors;

  const layoutStyles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollContent: {
      padding: 16,
      paddingTop: 0,
      paddingBottom: 80, // Tab bar padding
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

  const textStyles = StyleSheet.create({
    h1: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.text,
    },
    h2: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    h3: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    body: {
      fontSize: fontSize.md,
      color: colors.text,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: colors.inactiveText,
    },
  });

  const cardStyles = StyleSheet.create({
    base: {
      borderRadius: borderRadius.xl,
      padding: spacing.xxl,
      ...shadows.md,
    },
    listContainer: {
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderBottomColor: colors.border,
    },
  });

  return { layoutStyles, textStyles, cardStyles, colors };
};