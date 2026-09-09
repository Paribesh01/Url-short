import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { ThemePreferenceProvider, useThemePreference } from '@/context/theme-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    // Keep the native splash screen up instead of flashing a blank frame
    // while we check for a stored token.
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}

function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  // Drives React Navigation's own theme (header/tab bar chrome) off the
  // same resolved preference (system/light/dark) our components use,
  // rather than the raw system scheme — so a manual override actually
  // affects native chrome too, not just our own screens.
  const { colorScheme } = useThemePreference();

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <AuthProvider>
        <NavigationThemeWrapper>
          <RootNavigator />
        </NavigationThemeWrapper>
      </AuthProvider>
    </ThemePreferenceProvider>
  );
}
