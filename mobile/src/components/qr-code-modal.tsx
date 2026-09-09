import { Pressable, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface QrCodeModalProps {
  url: string | null;
  onClose: () => void;
}

export function QrCodeModal({ url, onClose }: QrCodeModalProps) {
  const theme = useTheme();

  if (url === null) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable onPress={(e) => e.stopPropagation()}>
        <ThemedView type="background" style={[styles.card, { borderColor: theme.border }]}>
          <View style={styles.headerRow}>
            <ThemedText type="smallBold">Scan to open</ThemedText>
            <Pressable onPress={onClose} hitSlop={8}>
              <Feather name="x" size={20} color={theme.text} />
            </Pressable>
          </View>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {url}
          </ThemedText>
          <View style={styles.qrWrapper}>
            <QRCode value={url} size={200} />
          </View>
        </ThemedView>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.four,
    zIndex: 100,
  },
  card: {
    borderRadius: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.two,
    width: 280,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qrWrapper: {
    marginTop: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
});
