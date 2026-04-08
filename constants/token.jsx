export const colors = {
  text: 'rgb(101, 68, 69)',      // 深木色
  inactiveText: 'rgb(96, 96, 96)', // 鼠尾草綠
  onPrimary: '#FFFFFF',
  surface: 'rgb(255, 239, 222)',   // 明亮米色
  secondary: 'rgb(149, 175, 152)',  // 鼠尾草綠
  tertiary: 'rgb(255, 137, 126)',   // 鮭魚粉
  container: 'rgb(231, 207, 206)',  // 淺木色
  surfaceVariant: '#F5EBE0',
  canva: '#8B3DFF', // Canva 紫色
}

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 28,
  full: 999,
}

export const screenPadding = {
  horizontal: spacing.xxl,
}

export const shadows = {
  sm: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
}