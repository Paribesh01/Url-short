import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label && <ThemedText type="smallBold">{label}</ThemedText>}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { borderColor: error ? theme.danger : theme.border, color: theme.text },
          style,
        ]}
        {...rest}
      />
      {error && (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  input: {
    height: 44,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
