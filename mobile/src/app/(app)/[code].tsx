import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { ClicksBarChart } from '@/components/clicks-bar-chart';
import { QrCodeModal } from '@/components/qr-code-modal';
import { RankedList } from '@/components/ranked-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { API_URL, getUrlAnalytics, ApiError } from '@/lib/api';
import { formatDateTime, formatExactNumber, referrerLabel } from '@/lib/format';
import type { UrlAnalytics } from '@/types';

export default function LinkAnalyticsScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const theme = useTheme();
  const [analytics, setAnalytics] = useState<UrlAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    (async () => {
      try {
        const data = await getUrlAnalytics(code);
        if (!cancelled) setAnalytics(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const shortUrl = `${API_URL}/${code}`;

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.brand} />
      </ThemedView>
    );
  }

  if (notFound || !analytics) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          This short link doesn&apos;t exist.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryText}>
              <ThemedText type="subtitle" themeColor="brand" style={styles.code}>
                /{analytics.short_code}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {analytics.original_url}
              </ThemedText>
            </View>
            <View style={styles.totalClicks}>
              <ThemedText type="subtitle">{formatExactNumber(analytics.total_clicks)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                clicks
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.actionButton, { borderColor: theme.border }]}
              onPress={() => Clipboard.setStringAsync(shortUrl)}
            >
              <Feather name="copy" size={16} color={theme.text} />
              <ThemedText type="small">Copy link</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { borderColor: theme.border }]}
              onPress={() => setQrOpen(true)}
            >
              <Feather name="grid" size={16} color={theme.text} />
              <ThemedText type="small">QR code</ThemedText>
            </Pressable>
          </View>

          <Card>
            <ThemedText type="smallBold">Clicks over time</ThemedText>
            <ClicksBarChart data={analytics.clicks_over_time} />
          </Card>

          <Card>
            <ThemedText type="smallBold">Top referrers</ThemedText>
            <RankedList
              entries={analytics.top_referrers}
              formatLabel={(label) => (label === 'Unknown' ? 'Direct' : label)}
            />
          </Card>

          <Card>
            <ThemedText type="smallBold">Top countries</ThemedText>
            <RankedList entries={analytics.top_countries} />
          </Card>

          <Card>
            <ThemedText type="smallBold">Top browsers</ThemedText>
            <RankedList entries={analytics.top_browsers} />
          </Card>

          <Card>
            <ThemedText type="smallBold">Top devices</ThemedText>
            <RankedList entries={analytics.top_devices} />
          </Card>

          <Card>
            <ThemedText type="smallBold">Recent clicks</ThemedText>
            {analytics.recent_clicks.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyRecent}>
                No clicks recorded yet.
              </ThemedText>
            ) : (
              <View style={styles.recentList}>
                {analytics.recent_clicks.map((click) => (
                  <View key={click.id} style={[styles.recentRow, { borderColor: theme.border }]}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatDateTime(click.clicked_at)}
                    </ThemedText>
                    <ThemedText type="small">{referrerLabel(click.referrer)}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {click.browser} · {click.device_type}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>

      <QrCodeModal url={qrOpen ? shortUrl : null} onClose={() => setQrOpen(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  summaryText: { flex: 1, gap: Spacing.half },
  code: { fontSize: 22, lineHeight: 28 },
  totalClicks: { alignItems: 'flex-end' },
  actionsRow: { flexDirection: 'row', gap: Spacing.two },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyRecent: { paddingVertical: Spacing.two },
  recentList: { gap: Spacing.two },
  recentRow: {
    gap: Spacing.half,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
