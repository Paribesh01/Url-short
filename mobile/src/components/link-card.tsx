import { Link } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Badge } from '@/components/ui/badge';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { formatExactNumber, timeAgo, truncateUrl } from '@/lib/format';
import type { ShortUrl } from '@/types';

interface LinkCardProps {
  url: ShortUrl;
  onDelete: (shortCode: string) => void;
  onShowQr: (url: string) => void;
}

export function LinkCard({ url, onDelete, onShowQr }: LinkCardProps) {
  const theme = useTheme();

  async function handleCopy() {
    await Clipboard.setStringAsync(url.short_url);
  }

  function handleDelete() {
    Alert.alert('Delete link', `Delete /${url.short_code}? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(url.short_code) },
    ]);
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Link href={`/${url.short_code}`} asChild>
        <Pressable style={styles.header}>
          <View style={styles.titleRow}>
            <ThemedText type="smallBold" themeColor="brand">
              /{url.short_code}
            </ThemedText>
            {url.is_expired && <Badge label="Expired" tone="danger" />}
          </View>
          {url.title && (
            <ThemedText type="small" themeColor="textSecondary">
              {url.title}
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {truncateUrl(url.original_url)}
          </ThemedText>
        </Pressable>
      </Link>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <ThemedText type="small" themeColor="textSecondary">
            {formatExactNumber(url.click_count)} clicks · {timeAgo(url.created_at)}
          </ThemedText>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={handleCopy} hitSlop={8} style={styles.iconButton}>
            <Feather name="copy" size={16} color={theme.textSecondary} />
          </Pressable>
          <Pressable onPress={() => onShowQr(url.short_url)} hitSlop={8} style={styles.iconButton}>
            <Feather name="grid" size={16} color={theme.textSecondary} />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={8} style={styles.iconButton}>
            <Feather name="trash-2" size={16} color={theme.danger} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: { gap: Spacing.half },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  meta: { flex: 1 },
  actions: { flexDirection: 'row', gap: Spacing.three },
  iconButton: { padding: Spacing.one },
});
