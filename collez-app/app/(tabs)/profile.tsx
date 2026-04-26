import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import { BadgeIcon } from '../../src/components/shared/BadgeIcon';
import { ErrorState } from '../../src/components/shared/ErrorState';
import { GradientButton } from '../../src/components/shared/GradientButton';
import { GlassCard } from '../../src/components/shared/GlassCard';
import { TopAppBar } from '../../src/components/shared/TopAppBar';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useCoordinatorStore } from '../../src/store/coordinatorStore';
import { useEventStore } from '../../src/store/eventStore';
import { getRankMeta, getRankTier } from '../../src/utils/rankCalculator';

function getBadgeIcon(badgeType: string): keyof typeof MaterialIcons.glyphMap {
  if (badgeType.includes('streak')) return 'local-fire-department';
  if (badgeType.includes('coordinator')) return 'verified';
  if (badgeType.includes('event')) return 'emoji-events';
  return 'military-tech';
}

export default function ProfileScreen() {
  const [editOpen, setEditOpen] = useState(false);
  const [rankTapCount, setRankTapCount] = useState(0);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const { signOut } = useAuthStore();
  const { liveEvents, submitHuntResponse } = useEventStore();
  const {
    profile,
    badges,
    isLoading,
    isUpdating,
    error,
    usernameCanChange,
    usernameChangeAvailableInDays,
    fetchProfile,
    fetchBadges,
    updateProfile,
    uploadAvatar,
    clearError,
  } = useUserStore();

  const {
    application: coordinatorApplication,
    eligibility: coordinatorEligibility,
    fetchMyApplication,
    refreshEligibility,
  } = useCoordinatorStore();

  useEffect(() => {
    void fetchProfile();
    void fetchBadges();
    void fetchMyApplication();
    void refreshEligibility();
  }, [fetchBadges, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setUsername(profile.username);
    }
  }, [profile]);

  const rankMeta = useMemo(
    () => getRankMeta(getRankTier(profile?.xp ?? 0)),
    [profile?.xp]
  );
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

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow media access to upload your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets.length) return;
    await uploadAvatar(result.assets[0].uri);
  };

  const handleSaveProfile = async () => {
    const ok = await updateProfile({ full_name: fullName, username });
    if (ok) setEditOpen(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  const handleRankTap = () => {
    const nextCount = rankTapCount + 1;
    if (nextCount >= 3) {
      const huntEvent = liveEvents.find((item) => item.event_type === 'treasure_hunt');
      if (huntEvent) {
        void submitHuntResponse({
          eventId: huntEvent.id,
          clueId: 'clue5',
          response: 'tap_rank_badge_3x',
        });
      }
      setRankTapCount(0);
      return;
    }
    setRankTapCount(nextCount);
  };

  return (
    <View style={styles.screen}>
      <TopAppBar avatarUrl={profile?.avatar_url} xp={profile?.xp ?? 0} />
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.headerCard}>
          <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
            {profile?.is_coordinator ? (
              <LottieView
                source={require('../../assets/animations/coordinator-frame.json')}
                autoPlay
                loop
                style={styles.coordinatorFrame}
              />
            ) : null}
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <MaterialIcons name="person" size={48} color={Colors.onSurfaceVariant} />
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={14} color={Colors.background} />
            </View>
          </Pressable>
          <Text style={styles.name}>{profile?.full_name ?? 'Profile'}</Text>
          <Text style={styles.username}>@{profile?.username ?? 'username'}</Text>
          <Text style={styles.college}>{profile?.college_name ?? 'No college selected'}</Text>
        </GlassCard>

        <View style={styles.statsRow}>
          <Pressable onPress={handleRankTap} style={styles.statPressable}>
            <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>Rank</Text>
            <Text style={[styles.statValue, { color: rankMeta.color }]}>{rankMeta.label}</Text>
            </GlassCard>
          </Pressable>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>XP</Text>
            <Text style={styles.statValue}>{profile?.xp ?? 0}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{profile?.streak_count ?? 0}d</Text>
          </GlassCard>
        </View>

        {profile?.is_coordinator ? (
          <GlassCard style={styles.coordinatorCard}>
            <BadgeIcon type="coordinator" iconName="verified" color={Colors.secondary} animated />
            <View>
              <Text style={styles.coordinatorTitle}>{coordinatorRoleLabel}</Text>
              <Text style={styles.coordinatorText}>You are representing your campus.</Text>
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.coordinatorCard}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.coordinatorTitle}>Coordinator Program</Text>
              {coordinatorApplication ? (
                <Text style={styles.coordinatorText}>
                  Status:{' '}
                  {coordinatorApplication.status === 'approved'
                    ? 'Approved'
                    : coordinatorApplication.status === 'rejected'
                      ? 'Rejected'
                      : 'Under Review'}
                </Text>
              ) : (
                <Text style={styles.coordinatorText}>Apply to represent your campus and help grow COLLEZ.</Text>
              )}
              {coordinatorApplication?.status === 'rejected' && coordinatorApplication.admin_notes ? (
                <Text style={styles.coordinatorText}>Reason: {coordinatorApplication.admin_notes}</Text>
              ) : null}
              {coordinatorEligibility && !coordinatorEligibility.ok ? (
                <Text style={styles.coordinatorText}>
                  Not eligible yet: {coordinatorEligibility.reasons.join(', ')}
                </Text>
              ) : null}
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Pressable
                style={[
                  styles.coordinatorApplyBtn,
                  (coordinatorApplication?.status === 'pending' || (coordinatorEligibility && !coordinatorEligibility.ok)) && styles.coordinatorApplyBtnDisabled,
                ]}
                disabled={coordinatorApplication?.status === 'pending' || (coordinatorEligibility ? !coordinatorEligibility.ok : true)}
                onPress={() => router.push('/coordinator/apply')}
              >
                <Text style={styles.coordinatorApplyText}>
                  {coordinatorApplication?.status === 'rejected' ? 'Re-Apply' : 'Apply'}
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        )}

        <GlassCard>
          <Text style={styles.sectionTitle}>Badges</Text>
          <FlatList
            data={badges}
            keyExtractor={(item) => item.id}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={styles.badgesGrid}
            ListEmptyComponent={<Text style={styles.emptyText}>No badges earned yet.</Text>}
            renderItem={({ item }) => (
              <View style={styles.badgeItem}>
                <BadgeIcon type="rank" iconName={getBadgeIcon(item.badge_type)} color={Colors.primary} />
                <Text style={styles.badgeLabel} numberOfLines={2}>
                  {item.badge_name}
                </Text>
              </View>
            )}
          />
        </GlassCard>

        <GlassCard style={styles.referralCard}>
          <Text style={styles.sectionTitle}>Referral Code</Text>
          <Text style={styles.referralCode}>{profile?.invite_code ?? 'Generating...'}</Text>
          <Text style={styles.referralHint}>
            Share this code with friends. When they join, both get bonus XP.
          </Text>
        </GlassCard>

        {error ? (
          <Pressable onPress={clearError}>
            <ErrorState
              message={error}
              onRetry={() => {
                void fetchProfile();
                void fetchBadges();
              }}
              compact
            />
          </Pressable>
        ) : null}

        <GradientButton title="Edit Profile" onPress={() => setEditOpen(true)} />
        <GradientButton title="Settings" onPress={() => router.push('/settings')} />
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={editOpen} animationType="slide" transparent onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput value={fullName} onChangeText={setFullName} style={styles.input} placeholderTextColor={Colors.outline} />

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" placeholderTextColor={Colors.outline} />
            {!usernameCanChange ? (
              <Text style={styles.noticeText}>
                Username can be changed in {usernameChangeAvailableInDays} day(s).
              </Text>
            ) : null}

            <GradientButton title={isUpdating ? 'Saving...' : 'Save'} onPress={handleSaveProfile} disabled={isLoading || isUpdating} />
            <Pressable style={styles.cancelBtn} onPress={() => setEditOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </GlassCard>
        </View>
      </Modal>
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
    paddingTop: Spacing.md,
  },
  headerCard: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallback: {
    backgroundColor: Colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 2,
    borderColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordinatorFrame: {
    position: 'absolute',
    width: 120,
    height: 120,
    zIndex: 0,
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
    paddingVertical: Spacing.md,
  },
  statPressable: { flex: 1 },
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
  coordinatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  coordinatorTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  coordinatorText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  coordinatorApplyBtn: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 3,
    borderColor: '#111111',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  coordinatorApplyBtnDisabled: {
    opacity: 0.5,
  },
  coordinatorApplyText: {
    color: '#111111',
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  sectionTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  badgesGrid: {
    gap: Spacing.sm,
  },
  badgeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
    minWidth: 68,
  },
  badgeLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  referralCard: {
    gap: 6,
  },
  referralCode: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
    letterSpacing: 1,
  },
  referralHint: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  logoutText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000055',
    padding: Spacing.md,
  },
  modalCard: {
    gap: Spacing.sm,
  },
  modalTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  inputLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  input: {
    backgroundColor: Colors.surfaceLow,
    borderWidth: 3,
    borderColor: '#111111',
    borderRadius: 12,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
  },
  noticeText: {
    color: Colors.warning,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  cancelText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});
