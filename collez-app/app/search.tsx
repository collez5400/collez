import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Typography } from '../src/config/theme';
import { EmptyState } from '../src/components/shared/EmptyState';
import { GlassCard } from '../src/components/shared/GlassCard';
import { useFriendStore } from '../src/store/friendStore';
import { getRankMeta, getRankTier } from '../src/utils/rankCalculator';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const initialQuery = useMemo(() => (params.q ? String(params.q) : ''), [params.q]);

  const { searchUsersByUsernamePrefix } = useFriendStore();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchUsersByUsernamePrefix>>>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const clean = query.trim();
    if (!clean) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = setTimeout(() => {
      void (async () => {
        const users = await searchUsersByUsernamePrefix(clean);
        setResults(users);
        setLoading(false);
      })();
    }, 250);

    return () => clearTimeout(handle);
  }, [query, searchUsersByUsernamePrefix]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Search</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.outline} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by username..."
          placeholderTextColor={Colors.outline}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
          accessibilityLabel="Search input"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
            <MaterialIcons name="close" size={20} color={Colors.outline} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <EmptyState icon="search" title="Searching..." description="Looking up users" compact />
      ) : results.length === 0 ? (
        <EmptyState
          icon={query.trim().length === 0 ? 'search' : 'search-off'}
          title={query.trim().length === 0 ? 'Search by username' : 'No users found'}
          description={query.trim().length === 0 ? 'Try something like @aarav' : 'Try a different prefix.'}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const rankMeta = getRankMeta(getRankTier(item.xp ?? 0));
            return (
              <Pressable
                onPress={() => router.push(`/profile/${item.id}`)}
                accessibilityLabel={`Open profile for ${item.username}`}
              >
                <GlassCard style={styles.card}>
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

                  <View style={styles.rankPill}>
                    <Text style={[styles.rankText, { color: rankMeta.color }]}>{rankMeta.label}</Text>
                  </View>
                </GlassCard>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    backgroundColor: Colors.surfaceLow,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    paddingVertical: 0,
  },
  listContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
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
  rankPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    backgroundColor: Colors.surfaceHigh,
  },
  rankText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

