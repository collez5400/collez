import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { supabase } from '../../../src/config/supabase';
import { College } from '../../../src/models/college';
import {
  Colors, Typography, Spacing, BorderRadius,
} from '../../../src/config/theme';

const TOTAL_STEPS = 3;
const STEP = 2;

interface CollegeRequest {
  name: string;
  city: string;
  state: string;
}

export default function OnboardingStep2() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    fullName: string;
    username: string;
    avatarUri: string;
  }>();

  const [colleges, setColleges] = useState<College[]>([]);
  const [filtered, setFiltered] = useState<College[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestSheet, setShowRequestSheet] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [request, setRequest] = useState<CollegeRequest>({ name: '', city: '', state: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Progress bar
  const progressWidth = useSharedValue(0);
  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  useEffect(() => {
    progressWidth.value = withTiming((STEP / TOTAL_STEPS) * 100, { duration: 600 });
    fetchColleges();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    setFiltered(
      query
        ? colleges.filter(
            c =>
              c.name.toLowerCase().includes(query) ||
              c.city.toLowerCase().includes(query)
          )
        : colleges
    );
  }, [search, colleges]);

  async function fetchColleges() {
    setLoading(true);
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name', { ascending: true });
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Could not load colleges. Check your connection.');
      return;
    }
    setColleges((data ?? []) as College[]);
    setFiltered((data ?? []) as College[]);
  }

  async function submitCollegeRequest() {
    if (!request.name || !request.city || !request.state) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    setSubmittingRequest(true);
    // @ts-expect-error Supabase type shim limitations
    const { error } = await supabase.from('college_requests').insert({
      college_name: request.name,
      city: request.city,
      state: request.state,
      status: 'pending',
    });
    setSubmittingRequest(false);
    if (error) {
      Alert.alert('Error', 'Request failed. Try again later.');
      return;
    }
    setShowRequestSheet(false);
    setRequestPending(true);
  }

  function handleContinue() {
    if (!selected) {
      Alert.alert('Select a college', 'Choose your campus to continue.');
      return;
    }
    router.push({
      pathname: '/(auth)/onboarding/step3',
      params: {
        ...params,
        collegeId: selected.id,
        collegeName: selected.name,
      },
    });
  }

  const renderCollege = ({ item }: { item: College }) => {
    const isSelected = selected?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.collegeCard, isSelected && styles.collegeCardSelected]}
        onPress={() => setSelected(item)}
        activeOpacity={0.7}
        accessibilityLabel={`Select ${item.name}`}
      >
        <View style={styles.collegeInfo}>
          <Text style={styles.collegeName}>{item.name}</Text>
          <Text style={styles.collegeMeta}>{item.city} • {item.student_count.toLocaleString()} students</Text>
        </View>
        {isSelected && (
          <Text style={styles.checkMark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (requestPending) {
    return (
      <View style={[styles.root, styles.centeredContent]}>
        <Text style={styles.pendingIcon}>⏳</Text>
        <Text style={styles.pendingHeadline}>Request Submitted!</Text>
        <Text style={styles.pendingBody}>
          We'll review your college and add it soon. Meanwhile, ask your coordinator to onboard your campus.
        </Text>
        <GradientButton title="Go Back to Search" onPress={() => setRequestPending(false)} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Progress */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressAnimStyle]} />
      </View>
      <Text style={styles.stepLabel}>Step {STEP} of {TOTAL_STEPS}</Text>
      <Text style={styles.headline}>Find Your Campus</Text>
      <Text style={styles.subheadline}>Select your college to join your campus leaderboard.</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by college or city…"
          placeholderTextColor={Colors.onSurfaceVariant}
          accessibilityLabel="Search college"
        />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderCollege}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No colleges found. Try a different search.</Text>
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.requestBtn}
              onPress={() => setShowRequestSheet(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.requestBtnText}>+ Request New College</Text>
            </TouchableOpacity>
          }
        />
      )}

      <View style={styles.bottomBtn}>
        <GradientButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>

      {/* College Request Modal */}
      <Modal
        visible={showRequestSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestSheet(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <GlassCard style={styles.modalCard} padding={24}>
            <Text style={styles.modalTitle}>Request a New College</Text>

            {(['name', 'city', 'state'] as const).map(field => (
              <View key={field} style={styles.inputGroup}>
                <Text style={styles.label}>
                  {field === 'name' ? 'College Name' : field === 'city' ? 'City' : 'State'}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={request[field]}
                  onChangeText={v => setRequest(r => ({ ...r, [field]: v }))}
                  placeholder={`Enter ${field}`}
                  placeholderTextColor={Colors.onSurfaceVariant}
                  accessibilityLabel={`College ${field} input`}
                />
              </View>
            ))}

            <GradientButton
              title="Submit Request"
              onPress={submitCollegeRequest}
              loading={submittingRequest}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowRequestSheet(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24, paddingTop: 60 },
  centeredContent: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  progressTrack: {
    height: 4,
    backgroundColor: `${Colors.onSurfaceVariant}33`,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  stepLabel: {
    fontSize: Typography.size.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    marginBottom: Spacing.md,
  },
  headline: {
    fontSize: Typography.size.xxl,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.onSurface,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subheadline: {
    fontSize: Typography.size.sm,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    marginBottom: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.onSurfaceVariant}44`,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurface,
  },
  list: { paddingBottom: 100 },
  collegeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: `${Colors.outline}33`,
  },
  collegeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}11`,
  },
  collegeInfo: { flex: 1 },
  collegeName: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurface,
    fontWeight: '600',
  },
  collegeMeta: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  checkMark: { fontSize: 18, color: Colors.primary },
  emptyText: {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    marginTop: Spacing.xl,
  },
  requestBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.md,
  },
  requestBtnText: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '600',
  },
  bottomBtn: { paddingVertical: Spacing.md },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },
  modalCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  modalTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.onSurface,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  inputGroup: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurface,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  modalInput: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
    paddingHorizontal: Spacing.md,
    height: 48,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  cancelBtn: { alignSelf: 'center', marginTop: Spacing.md },
  cancelText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  pendingIcon: { fontSize: 56, marginBottom: Spacing.md },
  pendingHeadline: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.onSurface,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  pendingBody: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
});
