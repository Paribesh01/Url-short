import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'snip_theme_preference';
const isWeb = Platform.OS === 'web';

export type ThemePreference = 'system' | 'light' | 'dark';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export async function getThemePreference(): Promise<ThemePreference> {
  try {
    const stored = isWeb
      ? window.localStorage.getItem(THEME_KEY)
      : await SecureStore.getItemAsync(THEME_KEY);
    return isThemePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export async function setThemePreference(preference: ThemePreference): Promise<void> {
  try {
    if (isWeb) {
      window.localStorage.setItem(THEME_KEY, preference);
      return;
    }
    await SecureStore.setItemAsync(THEME_KEY, preference);
  } catch {
    // Preference just won't persist across restarts — not worth surfacing.
  }
}
