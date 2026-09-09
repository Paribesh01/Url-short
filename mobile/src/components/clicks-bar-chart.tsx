import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { ClickPoint } from '@/types';

interface ClicksBarChartProps {
  data: ClickPoint[];
}

const CHART_HEIGHT = 120;

/** A lightweight bar chart built from plain Views — no charting
 * dependency needed for a single time series on a small screen. */
export function ClicksBarChart({ data }: ClicksBarChartProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
        No clicks recorded yet.
      </ThemedText>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  // Keep the chart readable on a phone width — show at most the most
  // recent 14 points.
  const points = data.slice(-14);

  return (
    <View>
      <View style={styles.chart}>
        {points.map((point) => (
          <View key={point.date} style={styles.barColumn}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(4, (point.count / max) * CHART_HEIGHT),
                  backgroundColor: theme.brand,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labelsRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {formatShort(points[0].date)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatShort(points[points.length - 1].date)}
        </ThemedText>
      </View>
    </View>
  );
}

function formatShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  empty: { paddingVertical: Spacing.five, textAlign: 'center' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT,
    gap: Spacing.half,
  },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '60%', borderRadius: 3, minWidth: 4 },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
});
