import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';

interface ExpiryDateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ExpiryDateField({ label, value, onChange }: ExpiryDateFieldProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  // @react-native-community/datetimepicker has no web implementation.
  // The mobile app's real targets are iOS/Android; web is only used here
  // for quick local testing, so fall back to a plain HTML date input
  // there via createElement (JSX would need 'input' in
  // JSX.IntrinsicElements, which React Native's types don't declare).
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {createElement('input', {
          type: 'date',
          value: value ? toDateInputValue(value) : '',
          onChange: (e: { target: { value: string } }) =>
            onChange(e.target.value ? new Date(`${e.target.value}T00:00:00`) : null),
          style: {
            height: 44,
            borderRadius: Spacing.two,
            border: `1px solid ${theme.border}`,
            paddingLeft: Spacing.three,
            paddingRight: Spacing.three,
            color: theme.text,
            backgroundColor: 'transparent',
            fontSize: 16,
            fontFamily: 'inherit',
          },
        })}
      </View>
    );
  }

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowPicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  }

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Pressable
        style={[styles.button, { borderColor: theme.border }]}
        onPress={() => setShowPicker(true)}
      >
        <Feather name="calendar" size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={[styles.buttonLabel, { color: value ? theme.text : theme.textSecondary }]}
        >
          {value ? formatDate(value.toISOString()) : 'No expiry'}
        </ThemedText>
        {value && (
          <Pressable onPress={() => onChange(null)} hitSlop={8}>
            <Feather name="x" size={14} color={theme.textSecondary} />
          </Pressable>
        )}
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 44,
    paddingHorizontal: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Spacing.two,
  },
  buttonLabel: { flex: 1 },
});
