import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { TopAppBar } from '../../src/components/shared/TopAppBar';
import { ComicPanelCard } from '../../src/components/shared/ComicPanelCard';
import { StickerChip } from '../../src/components/shared/StickerChip';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { FriendListUser, useFriendStore } from '../../src/store/friendStore';
import { useAuthStore } from '../../src/store/authStore';
import { HardShadowBox } from '../../src/components/shared/HardShadowBox';
import { useLeaderboardStore } from '../../src/store/leaderboardStore';

type SquadFilter = 'all' | 'coordinators' | 'streakers' | 'top-xp';

const FILTERS: Array<{ key: SquadFilter; label: string }> = [
  { key: 'all', label: 'All Squads' },
  { key: 'coordinators', label: 'Coordinators' },
  { key: 'streakers', label: 'Streakers' },
  { key: 'top-xp', label: 'Top XP' },
];

const cardColors = [Colors.secondaryContainer, Colors.errorContainer, Colors.surfaceBright, Colors.primaryContainer];

export default function FriendsScreen() {
  const router = useRouter();
  const avatarUrl = useAuthStore((s) => s.user?.avatar_url);
  const me = useAuthStore((s) => s.user);
  const {
    friends,
    pendingIncoming,
    relationshipByUserId,
    isLoading,
    error,
    hydrate,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    searchUsersByUsernamePrefix,
    clearError,
  } = useFriendStore();
  const { getUserRankSummary, fetchCollegeBoard } = useLeaderboardStore();

  const [query, setQuery] = useState('');
  const [isRefreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SquadFilter>('all');
  const [searchResults, setSearchResults] = useState<FriendListUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    void hydrate();
    void fetchCollegeBoard();
  }, [fetchCollegeBoard, hydrate]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => clearError(), 3500);
    return () => clearTimeout(id);
  }, [clearError, error]);

  useEffect(() => {
    const clean = query.trim();
    if (!clean) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      void (async () => {
        const users = await searchUsersByUsernamePrefix(clean, 24);
        setSearchResults(users);
        setIsSearching(false);
      })();
    }, 220);
    return () => clearTimeout(timeoutId);
  }, [query, searchUsersByUsernamePrefix]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([hydrate(), fetchCollegeBoard({ refresh: true })]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCollegeBoard, hydrate]);

  const socialProof = getUserRankSummary('college');
  const discoverBase = useMemo(() => {
    const pendingSenders = pendingIncoming
      .map((req) => req.sender)
      .filter((sender): sender is FriendListUser => !!sender);
    const merged = [...searchResults, ...friends, ...pendingSenders];
    const unique = new Map<string, FriendListUser>();
    merged.forEach((user) => {
      if (user.id !== me?.id) unique.set(user.id, user);
    });
    return Array.from(unique.values());
  }, [friends, me?.id, pendingIncoming, searchResults]);

  const discoverUsers = useMemo(() => {
    if (activeFilter === 'coordinators') return discoverBase.filter((user) => !!user.is_coordinator);
    if (activeFilter === 'streakers') return discoverBase.filter((user) => (user.streak_count ?? 0) >= 7);
    if (activeFilter === 'top-xp') return [...discoverBase].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)).slice(0, 12);
    return discoverBase;
  }, [activeFilter, discoverBase]);

  const onFind = useCallback(() => {
    const clean = query.trim();
    if (!clean) return;
    router.push({ pathname: '/search', params: { q: clean } });
  }, [query, router]);

  const renderProfileCard = ({ item, index }: { item: FriendListUser; index: number }) => {
    const relation = relationshipByUserId[item.id];
    const isFriend = relation?.kind === 'friends';
    const isPending = relation?.kind === 'outgoing_request';
    const lvl = Math.max(1, Math.floor((item.xp ?? 0) / 200) + 1);
    const tagA = item.is_coordinator ? 'Coordinator' : item.college_name?.split(' ')[0] ?? 'Squad';
    const tagB = (item.streak_count ?? 0) >= 7 ? 'Streaker' : 'Active';

    return (
      <ComicPanelCard style={styles.profileCard} padding={16}>
        <Pressable
          style={styles.cardHeader}
          onPress={() => router.push(`/profile/${item.id}`)}
          accessibilityLabel={`Open profile for ${item.username}`}
        >
          <View style={[styles.avatarWrap, { backgroundColor: cardColors[index % cardColors.length] }]}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <MaterialIcons name="person" size={22} color={Colors.onSurfaceVariant} />
              </View>
            )}
          </View>
          <View style={styles.metaWrap}>
            <Text style={styles.name} numberOfLines={1}>
              {item.full_name}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              @{item.username}
            </Text>
            <StickerChip label={item.is_coordinator ? 'Campus Lead' : 'Squad Mate'} tone="purple" />
          </View>
          <View style={styles.xpWrap}>
            <View style={styles.xpRow}>
              <MaterialIcons name="stars" size={14} color={Colors.primaryContainer} />
              <Text style={styles.xpValue}>{Math.round(item.xp ?? 0)}</Text>
            </View>
            <Text style={styles.levelLabel}>LVL {lvl}</Text>
          </View>
        </Pressable>

        <View style={styles.tagsRow}>
          <StickerChip label={tagA} tone="yellow" />
          <StickerChip label={tagB} tone="purple" />
        </View>

        <View style={styles.cardActions}>
          <HardShadowBox shadowOffset={4} borderRadius={10} style={styles.actionSlot}>
            <Pressable
              style={[styles.actionBtn, styles.followBtn, isFriend || isPending ? styles.actionBtnMuted : null]}
              onPress={() => {
                if (!isFriend && !isPending) void sendFriendRequest(item.id);
              }}
              accessibilityLabel={isFriend ? 'Already following user' : `Follow ${item.username}`}
            >
              <MaterialIcons name="person-add" size={16} color={Colors.onSecondary} />
              <Text style={styles.followText}>{isFriend ? 'Following' : isPending ? 'Pending' : 'Follow'}</Text>
            </Pressable>
          </HardShadowBox>
          <HardShadowBox shadowOffset={4} borderRadius={10} style={styles.actionSlot}>
            <Pressable
              style={[styles.actionBtn, styles.msgBtn]}
              onPress={() => router.push(`/profile/${item.id}`)}
              accessibilityLabel={`Message ${item.username}`}
            >
              <MaterialIcons name="chat-bubble" size={16} color={Colors.onPrimary} />
              <Text style={styles.msgText}>Msg</Text>
            </Pressable>
          </HardShadowBox>
        </View>
      </ComicPanelCard>
    );
  };

  const listHeader = (
    <View style={styles.headerWrap}>
      <Text style={styles.title}>CONNECT</Text>

      <HardShadowBox shadowOffset={4} borderRadius={12}>
        <View style={styles.searchWrap}>
          <View style={styles.searchIconWrap}>
            <MaterialIcons name="search" size={20} color={Colors.outline} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search students, departments..."
            placeholderTextColor={Colors.outline}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onFind}
            style={styles.searchInput}
            accessibilityLabel="Search students"
          />
          <Pressable style={styles.findBtn} onPress={onFind} accessibilityLabel="Find students">
            <Text style={styles.findBtnText}>FIND</Text>
          </Pressable>
        </View>
      </HardShadowBox>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filtersRow}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <HardShadowBox shadowOffset={4} borderRadius={999}>
            <Pressable
              style={[styles.filterPill, activeFilter === item.key ? styles.filterPillActive : null]}
              onPress={() => setActiveFilter(item.key)}
              accessibilityLabel={`Filter by ${item.label}`}
            >
              <Text style={[styles.filterLabel, activeFilter === item.key ? styles.filterLabelActive : null]}>{item.label}</Text>
            </Pressable>
          </HardShadowBox>
        )}
      />

      {socialProof ? (
        <ComicPanelCard style={styles.youCard} padding={16}>
          <View style={styles.youCardTop}>
            <Text style={styles.youTitle}>YOUR SOCIAL PROOF</Text>
            <StickerChip label={socialProof.type.toUpperCase()} tone="yellow" />
          </View>
          <Text style={styles.youRank}>{socialProof.rank ? `#${socialProof.rank}` : 'UNRANKED'}</Text>
          <Text style={styles.youMeta}>{Math.round(socialProof.xp)} XP · {socialProof.collegeName ?? 'COLLEGE RANK'}</Text>
          <Pressable style={styles.youCta} onPress={() => router.push('/(tabs)/rankings')}>
            <MaterialIcons name="leaderboard" size={16} color={Colors.primary} />
            <Text style={styles.youCtaText}>OPEN LEADERBOARD</Text>
          </Pressable>
        </ComicPanelCard>
      ) : null}

      {pendingIncoming.length > 0 ? (
        <View style={styles.pendingWrap}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          {pendingIncoming.slice(0, 2).map((req) => (
            <ComicPanelCard key={req.id} style={styles.requestCard} padding={12}>
              <Pressable
                style={styles.requestRow}
                onPress={() => router.push(`/profile/${req.sender_id}`)}
                accessibilityLabel={`Open profile for ${req.sender?.username ?? 'user'}`}
              >
                <Text style={styles.requestName}>{req.sender?.full_name ?? 'User'}</Text>
                <Text style={styles.requestMeta}>@{req.sender?.username ?? 'unknown'}</Text>
              </Pressable>
              <View style={styles.requestActions}>
                <Pressable style={[styles.requestBtn, styles.acceptBtn]} onPress={() => void acceptFriendRequest(req.id)}>
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>
                <Pressable style={[styles.requestBtn, styles.rejectBtn]} onPress={() => void rejectFriendRequest(req.id)}>
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
              </View>
            </ComicPanelCard>
          ))}
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {isSearching ? <Text style={styles.helperText}>Searching...</Text> : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <TopAppBar avatarUrl={avatarUrl} onAvatarPress={() => router.push('/(tabs)/profile')} />
      <FlatList
        data={discoverUsers}
        numColumns={2}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        ListHeaderComponentStyle={styles.headerBlock}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrap}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        renderItem={renderProfileCard}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="group"
                title="No squad members found"
                description="Try another search or switch filters to discover more students."
                compact
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBlock: {
    marginBottom: Spacing.md,
  },
  headerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.displayHero ?? 72,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#111111',
    borderRadius: 12,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  searchIconWrap: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 3,
    borderRightColor: '#111111',
    backgroundColor: Colors.surfaceContainerHighest,
  },
  searchInput: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  findBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.primaryFixed,
    borderLeftWidth: 3,
    borderLeftColor: '#111111',
  },
  findBtnText: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily.button,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  filtersRow: {
    gap: Spacing.sm,
    paddingBottom: 4,
  },
  filterPill: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
  },
  filterLabel: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.button,
    fontSize: Typography.size.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  filterLabelActive: {
    color: Colors.onPrimary,
  },
  youCard: {
    backgroundColor: Colors.surfaceContainer,
    gap: Spacing.sm,
  },
  youCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  youTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  youRank: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xxl,
    fontWeight: '900',
  },
  youMeta: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  youCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  youCtaText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.button,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  pendingWrap: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  requestCard: {
    gap: Spacing.sm,
  },
  requestRow: {
    gap: 2,
  },
  requestName: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  requestMeta: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  requestActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  requestBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111111',
    paddingVertical: 8,
  },
  acceptBtn: {
    backgroundColor: Colors.primaryContainer,
  },
  rejectBtn: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  acceptText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  rejectText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  helperText: {
    color: Colors.outline,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  columnWrap: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  profileCard: {
    flex: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#111111',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    backgroundColor: Colors.surfaceHigh,
  },
  metaWrap: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  handle: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  xpWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  xpValue: {
    color: Colors.primaryFixed,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  levelLabel: {
    color: Colors.outline,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingTop: 4,
    borderTopWidth: 3,
    borderTopColor: '#110e05',
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionSlot: {
    flex: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#111111',
    paddingVertical: 8,
  },
  actionBtnMuted: {
    opacity: 0.85,
  },
  followBtn: {
    backgroundColor: Colors.secondary,
  },
  msgBtn: {
    backgroundColor: Colors.primary,
  },
  followText: {
    color: Colors.onSecondary,
    fontFamily: Typography.fontFamily.button,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  msgText: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily.button,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  emptyWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
