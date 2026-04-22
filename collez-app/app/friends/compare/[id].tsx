import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Typography } from '../../../src/config/theme';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { BadgeIcon } from '../../../src/components/shared/BadgeIcon';
import { EmptyState } from '../../../src/components/shared/EmptyState';
import { useAuthStore } from '../../../src/store/authStore';
import { useFriendStore } from '../../../src/store/friendStore';
import { supabase } from '../../../src/config/supabase';
import { getRankMeta, getRankTier } from '../../../src/utils/rankCalculator';

type CompareProfile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  streak_count: number;
};

type ProfileBadgeCount = Record<string, number>;

const METRICS = [
  { key: 'xp', label: 'XP Total', icon: 'bolt' as const },
  { key: 'streak_count', label: 'Streak', icon: 'local-fire-department' as const },
] as const;

export default function FriendCompareScreen() {
  const { id: friendIdParam } = useLocalSearchParams<{ id: string }>();
  const friendId = typeof friendIdParam === 'string' ? friendIdParam : '';
  const me = useAuthStore((s) => s.user);
  const relationship = useFriendStore((s) =>
    friendId ? s.relationshipByUserId[friendId] ?? { kind: 'none' as const } : { kind: 'none' as const }
  );
  const fetchRelationship = useFriendStore((s) => s.fetchRelationship);

  const [friendProfile, setFriendProfile] = useState<CompareProfile | null>(null);
  const [badgeCounts, setBadgeCounts] = useState<ProfileBadgeCount>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!friendId) return;
    void fetchRelationship(friendId);
  }, [fetchRelationship, friendId]);

  useEffect(() => {
    if (!me?.id || !friendId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [{ data: friend, error: friendError }, { data: myBadges, error: myBadgeError }, { data: friendBadges, error: friendBadgeError }] =
          await Promise.all([
            supabase
              .from('users')
              .select('id, full_name, username, avatar_url, xp, streak_count')
              .eq('id', friendId)
              .single(),
            supabase.from('badges').select('id').eq('user_id', me.id),
            supabase.from('badges').select('id').eq('user_id', friendId),
          ]);

        if (friendError || !friend) {
          throw new Error(friendError?.message ?? 'Could not load friend profile.');
        }
        if (myBadgeError) throw new Error(myBadgeError.message);
        if (friendBadgeError) throw new Error(friendBadgeError.message);

        if (cancelled) return;
        setFriendProfile(friend as CompareProfile);
        setBadgeCounts({
          [me.id]: (myBadges ?? []).length,
          [friendId]: (friendBadges ?? []).length,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to compare stats.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [friendId, me?.id]);

  const meRank = useMemo(() => getRankMeta(getRankTier(me?.xp ?? 0)), [me?.xp]);
  const friendRank = useMemo(() => getRankMeta(getRankTier(friendProfile?.xp ?? 0)), [friendProfile?.xp]);

  const canCompare = !!friendId && !!me?.id && relationship.kind === 'friends';

  if (!canCompare) {
    return (
      <View style={styles.screen}>
        <View style={styles.centerWrap}>
          <EmptyState
            icon="lock"
            title="Comparison unavailable"
            description="You can compare stats only with users in your friends list."
          />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.centerWrap}>
          <Text style={styles.helperText}>Loading comparison...</Text>
        </View>
      </View>
    );
  }

  if (error || !friendProfile || !me) {
    return (
      <View style={styles.screen}>
        <View style={styles.centerWrap}>
          <EmptyState icon="error-outline" title="Could not load comparison" description={error ?? 'Please try again later.'} />
        </View>
      </View>
    );
  }

  const badgeMine = badgeCounts[me.id] ?? 0;
  const badgeFriend = badgeCounts[friendProfile.id] ?? 0;
  const xpDiff = (me.xp ?? 0) - (friendProfile.xp ?? 0);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Compare Stats</Text>
        <Text style={styles.subtitle}>Side-by-side progress with your friend</Text>

        <View style={styles.compareRow}>
          <ProfileCard
            label="You"
            name={me.full_name}
            username={me.username}
            avatarUrl={me.avatar_url}
            rankLabel={meRank.label}
            rankColor={meRank.color}
          />
          <ProfileCard
            label="Friend"
            name={friendProfile.full_name}
            username={friendProfile.username}
            avatarUrl={friendProfile.avatar_url}
            rankLabel={friendRank.label}
            rankColor={friendRank.color}
          />
        </View>

        {METRICS.map((metric) => {
          const mineValue = metric.key === 'xp' ? me.xp ?? 0 : me.streak_count ?? 0;
          const friendValue = metric.key === 'xp' ? friendProfile.xp ?? 0 : friendProfile.streak_count ?? 0;
          return (
            <GlassCard key={metric.key} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <MaterialIcons name={metric.icon} size={18} color={Colors.onSurfaceVariant} />
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
              <View style={styles.metricValuesRow}>
                <Text style={styles.metricValue}>{mineValue}</Text>
                <Text style={styles.metricDivider}>vs</Text>
                <Text style={styles.metricValue}>{friendValue}</Text>
              </View>
            </GlassCard>
          );
        })}

        <GlassCard style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <MaterialIcons name="workspace-premium" size={18} color={Colors.onSurfaceVariant} />
            <Text style={styles.metricLabel}>Badges</Text>
          </View>
          <View style={styles.metricValuesRow}>
            <Text style={styles.metricValue}>{badgeMine}</Text>
            <Text style={styles.metricDivider}>vs</Text>
            <Text style={styles.metricValue}>{badgeFriend}</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Head-to-head summary</Text>
          <Text style={styles.summaryText}>
            {xpDiff === 0
              ? `You and @${friendProfile.username} are tied on XP.`
              : xpDiff > 0
                ? `You are ahead by ${xpDiff} XP.`
                : `@${friendProfile.username} is ahead by ${Math.abs(xpDiff)} XP.`}
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

function ProfileCard({
  label,
  name,
  username,
  avatarUrl,
  rankLabel,
  rankColor,
}: {
  label: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  rankLabel: string;
  rankColor: string;
}) {
  return (
    <GlassCard style={styles.profileCard}>
      <Text style={styles.profileCardLabel}>{label}</Text>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <MaterialIcons name="person" size={18} color={Colors.onSurfaceVariant} />
        </View>
      )}
      <Text numberOfLines={1} style={styles.profileName}>
        {name}
      </Text>
      <Text numberOfLines={1} style={styles.profileUsername}>
        @{username}
      </Text>
      <View style={styles.rankRow}>
        <BadgeIcon type="rank" iconName="military-tech" color={rankColor} size={16} />
        <Text style={[styles.rankLabel, { color: rankColor }]}>{rankLabel}</Text>
      </View>
    </GlassCard>
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
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  helperText: {
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  compareRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  profileCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  profileCardLabel: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  profileName: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  profileUsername: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankLabel: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  metricCard: {
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  metricValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricValue: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  metricDivider: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  summaryCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  summaryTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  summaryText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});
