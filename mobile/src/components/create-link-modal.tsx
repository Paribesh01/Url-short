import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { createShortUrl, ApiError } from '@/lib/api';
import type { ShortUrl } from '@/types';

interface CreateLinkModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (url: ShortUrl) => void;
}

export function CreateLinkModal({ visible, onClose, onCreated }: CreateLinkModalProps) {
  const theme = useTheme();
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setUrl('');
    setCustomCode('');
    setTitle('');
  }

  async function handleCreate() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const shortUrl = await createShortUrl({
        url: url.trim(),
        custom_code: customCode.trim() || undefined,
        title: title.trim() || undefined,
      });
      onCreated(shortUrl);
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Couldn’t create link', err instanceof ApiError ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <ThemedView type="background" style={[styles.sheet, { borderColor: theme.border }]}>
        <View style={styles.sheetHeader}>
          <ThemedText type="subtitle" style={styles.sheetTitle}>
            New short link
          </ThemedText>
          <Pressable onPress={onClose} hitSlop={8}>
            <Feather name="x" size={22} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <TextField
            label="Destination URL"
            placeholder="https://example.com/a-very-long-path"
            autoCapitalize="none"
            keyboardType="url"
            value={url}
            onChangeText={setUrl}
          />
          <TextField
            label="Custom code (optional)"
            placeholder="my-link"
            autoCapitalize="none"
            value={customCode}
            onChangeText={setCustomCode}
          />
          <TextField
            label="Title (optional)"
            placeholder="Launch announcement"
            value={title}
            onChangeText={setTitle}
          />
          <Button label="Create" onPress={handleCreate} loading={loading} fullWidth />
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 100,
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: { fontSize: 20, lineHeight: 26 },
  form: { gap: Spacing.three },
});
