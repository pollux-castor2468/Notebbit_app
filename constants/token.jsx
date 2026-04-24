export const colors = {
  text: '#6C5E4F',           // 邊框與文字顏色 (咖啡)
  inactiveText: 'rgba(108, 94, 79, 0.6)', 
  onPrimary: '#6C5E4F',      // Icon/Text colors
  surface: '#FFFFF9',        // 背景顏色 (淺黃)
  secondary: '#FFF1E3',      // 建立日記 (粉橘)
  tertiary: '#FFFAE3',       // 開啟文件 (淺黃)
  container: '#FFD1D0',      // 建立文件 (粉紅)
  surfaceVariant: '#FFFAE3', // 開啟文件 (淺黃)
  recentSection: '#FFFEEE',  // 最近開啟區 (淺黃)
  recentHeader: '#FFE9B9',   // 最近開啟頭 (橘黃)
  fab: '#FFED64',            // fab按鍵 (黃色)
  border: '#6C5E4F',         // 邊框顏色 (咖啡)
  canva: '#8B3DFF',          // purple
  errow: '#B00020',          // 警告文字(深紅)
}

export const darkColors = {
  text: '#FFFFFF',           // 文字與Icon (白)
  inactiveText: 'rgba(255, 255, 255, 0.6)', 
  onPrimary: '#FFFFFF',      //
  surface: '#6C5E4F',        // 背景顏色: 深咖
  secondary: '#89AD89',      // 建立日記: 綠色
  tertiary: '#8A896B',       // 開啟文件: 枯綠 (used for list item background)
  container: '#B78D85',      // 建立文件: 桃紅
  surfaceVariant: '#8A896B', //
  recentSection: '#8B8979',  // 最近開啟區: 深咖 (different shade)
  recentHeader: '#AD967D',   // 最近開啟頭: 中咖
  fab: '#FFED64',            // fab按鍵: 黃色
  border: '#FFFFFF',         // 邊框顏色: 白色
  canva: '#8B3DFF',          // 
  errow: '#FF5252',          // darker red maybe lighter for dark mode?
}

export const defaultTabBarStyle = {
  position: 'absolute',
  bottom: 35,
  height: 80,
  width: '95%',
  marginLeft: 8,
  backgroundColor: colors.recentSection, // 淺黃背景
  borderRadius: 40,
  borderTopWidth: 1, // Need border top
  elevation: 0,
  shadowOpacity: 0,
  paddingBottom: 8, // Adjust label spacing
  paddingTop: 8,
  borderWidth: 1,
  borderColor: colors.border,
};

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