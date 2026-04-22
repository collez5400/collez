import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '../src/config/theme';
import { GlassCard } from '../src/components/shared/GlassCard';
import { useAuthStore } from '../src/store/authStore';
import { supabase } from '../src/config/supabase';

const appVersion = Constants.expoConfig?.version ?? 'dev';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const pushEnabled = user?.push_enabled ?? true;
  const pushStreakEnabled = user?.push_streak_enabled ?? true;
  const pushEventEnabled = user?.push_event_enabled ?? true;

  const updatePrefs = async (updates: Record<string, boolean>) => {
    if (!user) return;
    useAuthStore.setState({ user: { ...user, ...updates } });
    const { error } = await supabase
      .from('users')
      // @ts-expect-error Supabase update typing (manual Database shim)
      .update(updates)
      .eq('id', user.id);
    if (error) {
      // Revert locally if write fails
      useAuthStore.setState({ user });
      Alert.alert('Update failed', error.message ?? 'Could not update notification preferences.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Account deletion requires admin verification in this phase. Contact support to proceed.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.rowTitle}>Edit Name</Text>
          <Text style={styles.rowText}>Use Edit Profile from your profile screen.</Text>
        </GlassCard>
        <GlassCard style={styles.card}>
          <Text style={styles.rowTitle}>Edit Username</Text>
          <Text style={styles.rowText}>Username updates are locked for 30 days after each change.</Text>
        </GlassCard>
        <GlassCard style={styles.card}>
          <Text style={styles.rowTitle}>Change College</Text>
          <Text style={styles.rowText}>College changes require admin approval.</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowText}>Enable or disable all COLLEZ notifications.</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(value) => void updatePrefs({ push_enabled: value })}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowTitle}>Streak Reminders</Text>
              <Text style={styles.rowText}>Reminders when your streak is at risk.</Text>
            </View>
            <Switch
              value={pushEnabled && pushStreakEnabled}
              disabled={!pushEnabled}
              onValueChange={(value) => void updatePrefs({ push_streak_enabled: value })}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowTitle}>Event Alerts</Text>
              <Text style={styles.rowText}>Notifies you when a trivia/event goes live.</Text>
            </View>
            <Switch
              value={pushEnabled && pushEventEnabled}
              disabled={!pushEnabled}
              onValueChange={(value) => void updatePrefs({ push_event_enabled: value })}
            />
          </View>
        </GlassCard>

        <Pressable style={styles.linkCard} onPress={() => router.push('/terms')} accessibilityRole="button" accessibilityLabel="Terms of Service">
          <Text style={styles.rowTitle}>Terms of Service</Text>
        </Pressable>
        <Pressable style={styles.linkCard} onPress={() => router.push('/privacy')} accessibilityRole="button" accessibilityLabel="Privacy Policy">
          <Text style={styles.rowTitle}>Privacy Policy</Text>
        </Pressable>
        <GlassCard style={styles.card}>
          <Text style={styles.rowTitle}>About COLLEZ</Text>
          <Text style={styles.rowText}>The student operating system for competitive college life.</Text>
          <Text style={styles.version}>Version {appVersion}</Text>
        </GlassCard>

        <Pressable style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  card: {
    gap: 4,
  },
  linkCard: {
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1,
    borderColor: `${Colors.outline}33`,
    borderRadius: 12,
    padding: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  switchText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  rowText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  version: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 6,
  },
  deleteBtn: {
    marginTop: Spacing.sm,
    backgroundColor: `${Colors.error}22`,
    borderColor: `${Colors.error}66`,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  deleteText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});
