import { useEffect, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { BadgeIcon } from '../../src/components/shared/BadgeIcon';
import { GlassCard } from '../../src/components/shared/GlassCard';
import { useUserStore } from '../../src/store/userStore';
import { getRankMeta, getRankTier } from '../../src/utils/rankCalculator';

export default function OtherUserProfileScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { profile, isLoading, fetchProfile } = useUserStore();

  useEffect(() => {
    if (params.id) {
      void fetchProfile(params.id);
    }
  }, [fetchProfile, params.id]);

  const rankMeta = useMemo(
    () => getRankMeta(getRankTier(profile?.xp ?? 0)),
    [profile?.xp]
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.header}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <MaterialIcons name="person" size={42} color={Colors.onSurfaceVariant} />
            </View>
          )}
          <Text style={styles.name}>{profile?.full_name ?? (isLoading ? 'Loading...' : 'User')}</Text>
          <Text style={styles.username}>@{profile?.username ?? 'unknown'}</Text>
          <Text style={styles.college}>{profile?.college_name ?? 'No college listed'}</Text>
        </GlassCard>

        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>Rank</Text>
            <Text style={[styles.statValue, { color: rankMeta.color }]}>{rankMeta.label}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>XP</Text>
            <Text style={styles.statValue}>{profile?.xp ?? 0}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{profile?.streak_count ?? 0}d</Text>
          </GlassCard>
        </View>

        <Pressable style={styles.friendBtn}>
          <Text style={styles.friendBtnText}>Add Friend</Text>
          <Text style={styles.friendSubText}>Phase 2</Text>
        </Pressable>

        <Pressable
          style={styles.reportBtn}
          onPress={() => Alert.alert('Report User', 'Report flow will be enabled in Phase 2.')}
        >
          <MaterialIcons name="more-vert" size={18} color={Colors.error} />
          <Text style={styles.reportText}>Report User</Text>
        </Pressable>

        {profile?.is_coordinator ? (
          <GlassCard style={styles.coordinatorCard}>
            <BadgeIcon type="coordinator" iconName="verified" color={Colors.secondary} />
            <Text style={styles.coordinatorText}>Official College Coordinator</Text>
          </GlassCard>
        ) : null}
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
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  name: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  username: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  college: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  statValue: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  friendBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.primary}66`,
    backgroundColor: `${Colors.primary}22`,
    padding: Spacing.md,
    alignItems: 'center',
  },
  friendBtnText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  friendSubText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  reportBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  coordinatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  coordinatorText: {
    color: Colors.secondary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});
