import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';
import { GlassCard } from '../shared/GlassCard';

interface QuoteCardProps {
  quote: string;
  author: string;
  onViewed?: () => void;
}

export function QuoteCard({ quote, author, onViewed }: QuoteCardProps) {
  return (
    <GlassCard style={styles.card} onLayout={onViewed}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="format-quote" size={24} color={Colors.primary} />
      </View>
      <Text style={styles.label}>Daily quote</Text>
      <Text style={styles.quoteText}>"{quote}"</Text>
      <Text style={styles.author}>- {author}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}22`,
    marginBottom: Spacing.xs,
  },
  label: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  quoteText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    lineHeight: 24,
  },
  author: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});

