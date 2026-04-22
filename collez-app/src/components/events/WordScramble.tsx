import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

interface WordScrambleProps {
  scrambledWord?: string;
  value: string;
  onChange: (next: string) => void;
}

export function WordScramble({ scrambledWord, value, onChange }: WordScrambleProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Unscramble</Text>
      <Text style={styles.word}>{scrambledWord ?? 'No scrambled word provided'}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        autoCapitalize="characters"
        placeholder="Type answer"
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
  word: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
    letterSpacing: 2,
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
