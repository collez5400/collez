import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Colors, Spacing, Typography } from '../src/config/theme';
import { GlassCard } from '../src/components/shared/GlassCard';

const appVersion = Constants.expoConfig?.version ?? 'dev';

export default function TermsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.paragraph}>
            By using COLLEZ, you agree to use the app responsibly, follow your institution’s rules, and avoid abusing
            leaderboards or systems (including XP manipulation).
          </Text>
          <Text style={styles.paragraph}>
            COLLEZ is provided “as is” without warranties. We may update features and policies to improve safety and
            reliability.
          </Text>
          <Text style={styles.paragraph}>
            For account issues (including deletion requests), contact support through the admin team.
          </Text>
          <Text style={styles.meta}>Version: {appVersion}</Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  card: { gap: Spacing.sm },
  paragraph: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  meta: {
    marginTop: Spacing.sm,
    color: Colors.outline,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
});

