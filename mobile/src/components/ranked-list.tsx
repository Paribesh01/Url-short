import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { formatExactNumber } from '@/lib/format';
import type { CountEntry } from '@/types';

interface RankedListProps {
  entries: CountEntry[];
  emptyLabel?: string;
  formatLabel?: (label: string) => string;
}

export function RankedList({ entries, emptyLabel = 'No data yet', formatLabel }: RankedListProps) {
  const theme = useTheme();

  if (entries.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
        {emptyLabel}
      </ThemedText>
    );
  }

  const max = Math.max(...entries.map((e) => e.count));

  return (
    <View style={styles.list}>
      {entries.map((entry) => (
        <View key={entry.label} style={styles.row}>
          <View style={styles.labelRow}>
            <ThemedText type="small" numberOfLines={1} style={styles.label}>
              {formatLabel ? formatLabel(entry.label) : entry.label}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatExactNumber(entry.count)}
            </ThemedText>
          </View>
          <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: theme.text, width: `${(entry.count / max) * 100}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: Spacing.three, textAlign: 'center' },
  list: { gap: Spacing.two },
  row: { gap: Spacing.half },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  label: { flex: 1 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
