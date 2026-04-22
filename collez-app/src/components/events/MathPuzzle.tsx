import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

interface MathPuzzleProps {
  equation?: string;
  value: string;
  onChange: (next: string) => void;
}

export function MathPuzzle({ equation, value, onChange }: MathPuzzleProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Solve equation</Text>
      <Text style={styles.equation}>{equation ?? 'Equation not configured'}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="Your answer"
        placeholderTextColor={Colors.onSurfaceVariant}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  equation: {
    color: Colors.secondary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
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
});
