import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Colors, Spacing, Typography } from '../src/config/theme';
import { GlassCard } from '../src/components/shared/GlassCard';

const appVersion = Constants.expoConfig?.version ?? 'dev';

export default function PrivacyScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.paragraph}>
            COLLEZ stores your profile and leaderboard-related information in Supabase. Local features (timetable, tasks,
            notes, PDFs) are stored on your device.
          </Text>
          <Text style={styles.paragraph}>
            We don’t sell personal information. We may process basic usage data to improve reliability and detect abuse.
          </Text>
          <Text style={styles.paragraph}>
            You can request account deletion by contacting support. Some data may be retained for security and fraud
            prevention.
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

