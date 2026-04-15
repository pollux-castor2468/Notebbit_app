export const colors = {
  text: '#6C5E4F',           // 邊框與文字顏色 (咖啡)
  inactiveText: 'rgba(108, 94, 79, 0.6)', 
  onPrimary: '#6C5E4F',      // Icon/Text colors  (和第一個重複了啦！
  surface: '#FFFFF9',        // 背景顏色 (淺黃)
  secondary: '#FFF1E3',      // 建立日記 (粉橘)
  tertiary: '#FFFAE3',       // 開啟文件 (淺黃)
  container: '#FFD1D0',      // 建立文件 (粉紅)
  surfaceVariant: '#FFFAE3', // 開啟文件 (淺黃)    (和第一個重複了啦！
  recentSection: '#FFFEEE',  // 最近開啟區 (淺黃)
  recentHeader: '#FFE9B9',   // 最近開啟頭 (橘黃)
  fab: '#FFED64',            // fab按鍵 (黃色)
  border: '#6C5E4F',         // 邊框顏色 (咖啡)    (所以說和第一個重複了啦！
  canva: '#8B3DFF',          // 不是說好的不用google紫色嗎
}

export const fontSize = {
  sm: 12,
  md: 16,
  lg: 24,
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