import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider } from '../contexts/theme/ThemeContext';
import { WorkerDataProvider } from '../contexts/worker/WorkerDataContext';
import { useNotifications } from '../hooks/useNotifications';

function AppWrapper({ children }: { children: React.ReactNode }) {
  // Initialize notifications
  useNotifications();
  
  return <>{children}</>;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <WorkerDataProvider>
        <AppWrapper>
          <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
            </Stack>
            <StatusBar style="auto" />
          </NavigationThemeProvider>
        </AppWrapper>
      </WorkerDataProvider>
    </ThemeProvider>
  );
}
