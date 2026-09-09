import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { useThemePreference } from '@/context/theme-context';
import type { ThemePreference } from '@/lib/theme-storage';

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const ICON: Record<ThemePreference, React.ComponentProps<typeof Feather>['name']> = {
  system: 'smartphone',
  light: 'sun',
  dark: 'moon',
};

export function ThemeToggleButton() {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();

  return (
    <Pressable
      onPress={() => setPreference(NEXT[preference])}
      hitSlop={8}
      accessibilityLabel={`Theme: ${preference}. Tap to change.`}
    >
      <Feather name={ICON[preference]} size={20} color={theme.text} />
    </Pressable>
  );
}
