import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Log in failed', err instanceof ApiError ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Snip
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Log in to manage your short links.
            </ThemedText>

            <ThemedView style={styles.form}>
              <TextField
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              <TextField
                label="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />
              <Button label="Log in" onPress={handleSubmit} loading={loading} fullWidth />
            </ThemedView>

            <ThemedView style={styles.footer}>
              <ThemedText type="small" themeColor="textSecondary">
                Don&apos;t have an account?
              </ThemedText>
              <Link href="/register">
                <ThemedText type="smallBold" themeColor="brand">
                  Sign up
                </ThemedText>
              </Link>
            </ThemedView>
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: { textAlign: 'center', fontSize: 34, lineHeight: 40 },
  subtitle: { textAlign: 'center' },
  form: { gap: Spacing.three },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.one },
});
