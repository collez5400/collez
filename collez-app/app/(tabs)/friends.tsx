import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { GlassCard } from '../../src/components/shared/GlassCard';
import { TopAppBar } from '../../src/components/shared/TopAppBar';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { useFriendStore } from '../../src/store/friendStore';
import { useAuthStore } from '../../src/store/authStore';

export default function FriendsScreen() {
  const router = useRouter();
  const avatarUrl = useAuthStore((s) => s.user?.avatar_url);
  const {
    friends,
    pendingIncoming,
    isLoading,
    error,
    hydrate,
    acceptFriendRequest,
    rejectFriendRequest,
    clearError,
  } = useFriendStore();

  const [query, setQuery] = useState('');
  const [isRefreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => clearError(), 3500);
    return () => clearTimeout(id);
  }, [clearError, error]);

  const onSearch = useCallback(() => {
    const clean = query.trim();
    if (!clean) return;
    router.push({ pathname: '/search', params: { q: clean } });
  }, [query, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await hydrate();
    } finally {
      setRefreshing(false);
    }
  }, [hydrate]);

  const hasContent = pendingIncoming.length > 0 || friends.length > 0;

  const header = useMemo(() => {
    return (
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Friends</Text>

        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={Colors.outline} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by username..."
            placeholderTextColor={Colors.outline}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onSearch}
            style={styles.searchInput}
            accessibilityLabel="Search users by username"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
              <MaterialIcons name="close" size={20} color={Colors.outline} />
            </Pressable>
          ) : null}
        </View>

        {error ? (
          <Text style={styles.errorText} accessibilityLabel="Friends error">
            {error}
          </Text>
        ) : null}

        {pendingIncoming.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending requests</Text>
            <View style={styles.sectionBody}>
              {pendingIncoming.map((req) => (
                <GlassCard key={req.id} style={styles.requestCard}>
                  <Pressable
                    style={styles.row}
                    onPress={() => router.push(`/profile/${req.sender_id}`)}
                    accessibilityLabel={`Open profile for ${req.sender?.username ?? 'user'}`}
                  >
                    {req.sender?.avatar_url ? (
                      <Image
                        source={{ uri: req.sender.avatar_url }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.avatar, styles.avatarFallback]}>
                        <MaterialIcons name="person" size={18} color={Colors.onSurfaceVariant} />
                      </View>
                    )}

                    <View style={styles.grow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {req.sender?.full_name ?? 'User'}
                      </Text>
                      <Text style={styles.meta} numberOfLines={1}>
                        @{req.sender?.username ?? 'unknown'} · {req.sender?.college_name ?? 'No college'}
                      </Text>
                    </View>
                  </Pressable>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => void acceptFriendRequest(req.id)}
                      accessibilityLabel="Accept friend request"
                    >
                      <Text style={styles.acceptText}>Accept</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => void rejectFriendRequest(req.id)}
                      accessibilityLabel="Reject friend request"
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </Pressable>
                  </View>
                </GlassCard>
              ))}
            </View>
          </View>
        ) : null}

        {friends.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your network</Text>
          </View>
        ) : null}
      </View>
    );
  }, [
    acceptFriendRequest,
    clearError,
    error,
    friends.length,
    onSearch,
    pendingIncoming,
    query,
    rejectFriendRequest,
    router,
  ]);

  return (
    <View style={styles.screen}>
      <TopAppBar avatarUrl={avatarUrl} onAvatarPress={() => router.push('/(tabs)/profile')} />
      {!hasContent && !isLoading ? (
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Friends</Text>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.outline} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by username..."
              placeholderTextColor={Colors.outline}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={onSearch}
              style={styles.searchInput}
              accessibilityLabel="Search users by username"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
                <MaterialIcons name="close" size={20} color={Colors.outline} />
              </Pressable>
            ) : null}
          </View>
          <EmptyState
            icon="group"
            title="No friends yet"
            description="Search and add classmates to build your network."
          />
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <View style={styles.friendRow}>
              <Pressable
                onPress={() => router.push(`/profile/${item.id}`)}
                accessibilityLabel={`Open friend profile for ${item.username}`}
              >
                <GlassCard style={styles.friendCard}>
                  {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.avatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <MaterialIcons name="person" size={18} color={Colors.onSurfaceVariant} />
                    </View>
                  )}
                  <View style={styles.grow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.full_name}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      @{item.username} · {item.college_name ?? 'No college'}
                    </Text>
                  </View>
                  <View style={styles.badgePill}>
                    <MaterialIcons name="local-fire-department" size={16} color={Colors.secondary} />
                    <Text style={styles.badgeText}>{item.streak_count ?? 0}d</Text>
                  </View>
                </GlassCard>
              </Pressable>
              <Pressable
                style={styles.compareBtn}
                onPress={() => router.push(`/friends/compare/${item.id}`)}
                accessibilityLabel={`Compare stats with ${item.username}`}
              >
                <MaterialIcons name="compare-arrows" size={16} color={Colors.primary} />
                <Text style={styles.compareText}>Compare</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            hasContent ? (
              <View style={styles.emptyFriendsWrap}>
                <EmptyState
                  icon="group"
                  title="No friends yet"
                  description="Search and add classmates to build your network."
                  compact
                />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.displayHero ?? 72,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  headerWrap: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  errorText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  sectionBody: {
    gap: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surface,
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
  },
  searchInput: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    paddingVertical: 0,
  },
  requestCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  friendRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 3,
    borderColor: '#110e05',
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 8, height: 8 },
    shadowRadius: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  grow: {
    flex: 1,
  },
  name: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  meta: {
    marginTop: 2,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  badgeText: {
    color: Colors.secondary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#111111',
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
  emptyFriendsWrap: {
    padding: Spacing.lg,
  },
  compareBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  compareText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});
