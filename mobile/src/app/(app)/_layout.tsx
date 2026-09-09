import { Stack } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function AppLayout() {
  const { logout } = useAuth();
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerShadowVisible: false,
        headerTintColor: theme.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Snip',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.four }}>
              <ThemeToggleButton />
              <Pressable onPress={logout} hitSlop={8}>
                <Feather name="log-out" size={20} color={theme.text} />
              </Pressable>
            </View>
          ),
        }}
      />
      <Stack.Screen name="[code]" options={{ title: 'Link analytics' }} />
    </Stack>
  );
}
