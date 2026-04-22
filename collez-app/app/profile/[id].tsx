import { useEffect, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { BadgeIcon } from '../../src/components/shared/BadgeIcon';
import { GlassCard } from '../../src/components/shared/GlassCard';
import { useUserStore } from '../../src/store/userStore';
import { useFriendStore } from '../../src/store/friendStore';
import { useAuthStore } from '../../src/store/authStore';
import { getRankMeta, getRankTier } from '../../src/utils/rankCalculator';

export default function OtherUserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { profile, isLoading, fetchProfile } = useUserStore();
  const {
    relationshipByUserId,
    fetchRelationship,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
  } = useFriendStore();
  const myStreakCount = useAuthStore((s) => s.user?.streak_count ?? 0);

  useEffect(() => {
    if (params.id) {
      void fetchProfile(params.id);
    }
  }, [fetchProfile, params.id]);

  useEffect(() => {
    if (!params.id) return;
    void fetchRelationship(params.id);
  }, [fetchRelationship, params.id]);

  const rankMeta = useMemo(
    () => getRankMeta(getRankTier(profile?.xp ?? 0)),
    [profile?.xp]
  );

  const relationship = useMemo(() => {
    if (!params.id) return { kind: 'none' as const };
    return relationshipByUserId[params.id] ?? ({ kind: 'none' as const } as const);
  }, [params.id, relationshipByUserId]);

  const mutualFriendCount = useMemo(() => {
    if (!params.id) return 0;
    // Placeholder until we add a dedicated mutual-friends query.
    return 0;
  }, [params.id]);

  const streakDeltaText = useMemo(() => {
    const theirStreak = profile?.streak_count ?? 0;
    const delta = theirStreak - myStreakCount;
    if (delta === 0) return 'You’re tied on streak.';
    if (delta > 0) return `They’re +${delta} days ahead.`;
    return `You’re +${Math.abs(delta)} days ahead.`;
  }, [myStreakCount, profile?.streak_count]);
  const coordinatorRoleLabel = useMemo(() => {
    if (!profile?.is_coordinator) return null;
    if (profile.coordinator_type === 'city') {
      return `Official City Coordinator${profile.coordinator_region ? ` • ${profile.coordinator_region}` : ''}`;
    }
    if (profile.coordinator_type === 'state') {
      return `Official State Coordinator${profile.coordinator_region ? ` • ${profile.coordinator_region}` : ''}`;
    }
    return 'Official College Coordinator';
  }, [profile?.coordinator_region, profile?.coordinator_type, profile?.is_coordinator]);

  const friendButton = useMemo(() => {
    if (!profile?.id) return { label: 'Add Friend', sub: '', disabled: true };
    if (relationship.kind === 'friends') return { label: 'Friends', sub: 'Tap to remove', disabled: false };
    if (relationship.kind === 'outgoing_request')
      return { label: 'Request Sent', sub: 'Waiting for approval', disabled: true };
    if (relationship.kind === 'incoming_request')
      return { label: 'Accept Request', sub: 'They want to add you', disabled: false };
    return { label: 'Add Friend', sub: 'Send a friend request', disabled: false };
  }, [profile?.id, relationship.kind]);

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

        <Pressable
          style={[styles.friendBtn, friendButton.disabled && styles.friendBtnDisabled]}
          disabled={friendButton.disabled}
          onPress={() => {
            if (!profile?.id) return;
            if (relationship.kind === 'none') {
              void sendFriendRequest(profile.id);
              return;
            }
            if (relationship.kind === 'incoming_request') {
              void acceptFriendRequest(relationship.requestId);
              return;
            }
            if (relationship.kind === 'friends') {
              Alert.alert('Remove friend?', `Remove @${profile.username} from your friends list?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => void removeFriend(profile.id),
                },
              ]);
            }
          }}
          accessibilityLabel="Friend action button"
        >
          <Text style={styles.friendBtnText}>{friendButton.label}</Text>
          <Text style={styles.friendSubText}>{friendButton.sub}</Text>
        </Pressable>

        <GlassCard style={styles.socialCard}>
          <View style={styles.socialRow}>
            <MaterialIcons name="people" size={18} color={Colors.onSurfaceVariant} />
            <Text style={styles.socialText}>Mutual friends: {mutualFriendCount}</Text>
          </View>
          <View style={styles.socialRow}>
            <MaterialIcons name="local-fire-department" size={18} color={Colors.secondary} />
            <Text style={styles.socialText}>{streakDeltaText}</Text>
          </View>
          {relationship.kind === 'friends' && profile?.id ? (
            <Pressable
              style={styles.compareBtn}
              onPress={() => router.push(`/friends/compare/${profile.id}`)}
              accessibilityLabel="Compare friend stats"
            >
              <MaterialIcons name="compare-arrows" size={16} color={Colors.primary} />
              <Text style={styles.compareText}>Compare Stats</Text>
            </Pressable>
          ) : null}
        </GlassCard>

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
            <Text style={styles.coordinatorText}>{coordinatorRoleLabel}</Text>
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
  friendBtnDisabled: {
    opacity: 0.65,
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
  socialCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  socialText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  compareBtn: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${Colors.primary}55`,
    backgroundColor: `${Colors.primary}18`,
  },
  compareText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
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
