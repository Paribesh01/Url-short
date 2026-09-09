import { Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

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
            <Pressable onPress={logout} hitSlop={8}>
              <Feather name="log-out" size={20} color={theme.text} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="[code]" options={{ title: 'Link analytics' }} />
    </Stack>
  );
}
