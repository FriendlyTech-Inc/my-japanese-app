import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// 日本語フォント設定
const japaneseFont = Platform.select({
  ios: {
    fontFamily: 'Hiragino Sans',
    fontWeight: '400' as const,
  },
  android: {
    fontFamily: 'Noto Sans JP',
  },
  default: {
    fontFamily: 'System',
  },
});

const japaneseFontBold = Platform.select({
  ios: {
    fontFamily: 'Hiragino Sans',
    fontWeight: '700' as const,
  },
  android: {
    fontFamily: 'Noto Sans JP Bold',
  },
  default: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
});

const japaneseFontMedium = Platform.select({
  ios: {
    fontFamily: 'Hiragino Sans',
    fontWeight: '500' as const,
  },
  android: {
    fontFamily: 'Noto Sans JP Medium',
  },
  default: {
    fontFamily: 'System',
    fontWeight: '500' as const,
  },
});

const japaneseFontLight = Platform.select({
  ios: {
    fontFamily: 'Hiragino Sans',
    fontWeight: '300' as const,
  },
  android: {
    fontFamily: 'Noto Sans JP Light',
  },
  default: {
    fontFamily: 'System',
    fontWeight: '300' as const,
  },
});

// フォント設定
const fontConfig = {
  displayLarge: {
    ...japaneseFontBold,
    fontSize: 32,
    letterSpacing: 0.15,
    lineHeight: 40,
  },
  displayMedium: {
    ...japaneseFontBold,
    fontSize: 28,
    letterSpacing: 0.15,
    lineHeight: 36,
  },
  displaySmall: {
    ...japaneseFontMedium,
    fontSize: 24,
    letterSpacing: 0.15,
    lineHeight: 32,
  },
  headlineLarge: {
    ...japaneseFontMedium,
    fontSize: 20,
    letterSpacing: 0.15,
    lineHeight: 28,
  },
  bodyLarge: {
    ...japaneseFont,
    fontSize: 16,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    ...japaneseFont,
    fontSize: 14,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
};

// カラーパレット
const colors = {
  primary: '#7C4DFF', // メインカラー：上品な紫
  primaryLight: '#B39DDB', // 薄い紫
  secondary: '#FF6B6B', // アクセント：柔らかい赤
  secondaryLight: '#FFB2B2', // 薄い赤
  success: '#4CAF50', // 成功：緑
  error: '#FF5252', // エラー：赤
  warning: '#FFC107', // 警告：黄色
  info: '#2196F3', // 情報：青
  background: '#F8F9FF', // 背景：薄い青みのグレー
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  disabled: '#BDBDBD',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

// アニメーション設定
export const animations = {
  scale: {
    pressed: 0.95,
    normal: 1,
  },
  duration: {
    short: 150,
    medium: 250,
    long: 350,
  },
};

// スペーシング設定
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// シャドウ設定
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

// ボーダーラディウス設定
export const borderRadius = {
  small: 8,
  medium: 16,
  large: 24,
  round: 999,
};

// メインテーマ
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
  roundness: borderRadius.medium,
  fonts: configureFonts({
    config: fontConfig,
  }),
  animation: {
    scale: 1.0,
  },
};

export type AppTheme = typeof theme; 