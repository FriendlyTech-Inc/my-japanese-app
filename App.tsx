import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppContextProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme';

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
