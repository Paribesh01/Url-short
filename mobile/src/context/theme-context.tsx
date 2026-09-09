import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import {
  getThemePreference,
  setThemePreference as persistThemePreference,
  type ThemePreference,
} from '@/lib/theme-storage';

interface ThemePreferenceContextValue {
  preference: ThemePreference;
  colorScheme: 'light' | 'dark';
  setPreference: (preference: ThemePreference) => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await getThemePreference();
      if (!cancelled) setPreferenceState(stored);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    persistThemePreference(next);
  }

  const colorScheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  return (
    <ThemePreferenceContext.Provider value={{ preference, colorScheme, setPreference }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceContextValue {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference must be used within a ThemePreferenceProvider');
  }
  return context;
}
