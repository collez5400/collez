import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

interface SudokuGridProps {
  prompt?: string;
  value: string;
  onChange: (next: string) => void;
}

export function SudokuGrid({ prompt, value, onChange }: SudokuGridProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{prompt ?? 'Sudoku answer'}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Enter final code"
        placeholderTextColor={Colors.onSurfaceVariant}
        autoCapitalize="none"
        style={styles.input}
      />
      <Text style={styles.helper}>Enter the final value/code from this Sudoku clue.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  label: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    backgroundColor: Colors.surfaceLow,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  helper: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.xs },
});
