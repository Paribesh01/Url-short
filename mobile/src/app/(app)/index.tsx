import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateLinkModal } from '@/components/create-link-modal';
import { QrCodeModal } from '@/components/qr-code-modal';
import { LinkCard } from '@/components/link-card';
import { TextField } from '@/components/ui/text-field';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { deleteShortUrl, getDashboardSummary, listShortUrls, ApiError } from '@/lib/api';
import { formatExactNumber } from '@/lib/format';
import type { DashboardSummary, ShortUrl } from '@/types';

export default function DashboardScreen() {
  const theme = useTheme();
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [urlList, summaryData] = await Promise.all([listShortUrls(), getDashboardSummary()]);
      setUrls(urlList);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  function handleCreated(url: ShortUrl) {
    setUrls((prev) => [url, ...prev]);
    setSummary((prev) => (prev ? { ...prev, total_urls: prev.total_urls + 1 } : prev));
  }

  async function handleDelete(shortCode: string) {
    const deleted = urls.find((u) => u.short_code === shortCode);
    setUrls((prev) => prev.filter((u) => u.short_code !== shortCode));
    try {
      await deleteShortUrl(shortCode);
      setSummary((prev) =>
        prev && deleted
          ? {
              ...prev,
              total_urls: Math.max(0, prev.total_urls - 1),
              total_clicks: Math.max(0, prev.total_clicks - deleted.click_count),
            }
          : prev
      );
    } catch {
      // Put it back — the delete didn't actually go through.
      if (deleted) setUrls((prev) => [deleted, ...prev]);
    }
  }

  const filteredUrls = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return urls;
    return urls.filter(
      (u) =>
        u.short_code.toLowerCase().includes(query) ||
        u.original_url.toLowerCase().includes(query) ||
        u.title?.toLowerCase().includes(query)
    );
  }, [urls, search]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.brand} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <FlatList
          data={filteredUrls}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={
            <View style={styles.header}>
              {error && (
                <ThemedText type="small" themeColor="danger">
                  {error}
                </ThemedText>
              )}
              <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Links
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.statValue}>
                    {formatExactNumber(summary?.total_urls ?? 0)}
                  </ThemedText>
                </Card>
                <Card style={styles.statCard}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Clicks
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.statValue}>
                    {formatExactNumber(summary?.total_clicks ?? 0)}
                  </ThemedText>
                </Card>
                <Card style={styles.statCard}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Avg/link
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.statValue}>
                    {formatExactNumber(
                      summary && summary.total_urls > 0
                        ? Math.round((summary.total_clicks / summary.total_urls) * 10) / 10
                        : 0
                    )}
                  </ThemedText>
                </Card>
              </View>

              {urls.length > 0 && (
                <TextField
                  placeholder="Search links…"
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                />
              )}
            </View>
          }
          renderItem={({ item }) => (
            <LinkCard url={item} onDelete={handleDelete} onShowQr={setQrUrl} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          ListEmptyComponent={
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText type="small" themeColor="textSecondary">
                No short links yet. Tap + to create one.
              </ThemedText>
            </ThemedView>
          }
        />

        <Pressable
          style={[styles.fab, { backgroundColor: theme.brand }]}
          onPress={() => setCreateOpen(true)}
        >
          <Feather name="plus" size={26} color={theme.brandForeground} />
        </Pressable>
      </SafeAreaView>

      <CreateLinkModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <QrCodeModal url={qrUrl} onClose={() => setQrUrl(null)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  header: { gap: Spacing.three, marginBottom: Spacing.three },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statCard: { flex: 1, padding: Spacing.two, gap: Spacing.half },
  statValue: { fontSize: 22, lineHeight: 27 },
  empty: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
