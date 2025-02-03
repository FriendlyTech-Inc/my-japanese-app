import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3LightTheme, configureFonts } from 'react-native-paper';
import { AppContextProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

// カスタムテーマの定義
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#7C4DFF', // メインカラー：上品な紫
    secondary: '#B39DDB', // セカンダリ：薄い紫
    tertiary: '#FF6B6B', // アクセント：柔らかい赤
    background: '#F8F9FF', // 背景：薄い青みのグレー
    surface: '#FFFFFF',
    error: '#FF5252',
    success: '#4CAF50',
    text: '#1A1A1A',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF6B6B',
  },
  roundness: 16,
  fonts: configureFonts({
    config: {
      fontFamily: 'System',
    },
  }),
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AppContextProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AppContextProvider>
    </PaperProvider>
  );
}
