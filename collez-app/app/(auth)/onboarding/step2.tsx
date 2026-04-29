import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { useAuthStore } from '../../../src/store/authStore';
import {
  Colors, Typography, Spacing, BorderRadius,
} from '../../../src/config/theme';
import { ComicBrandShell } from '../../../src/components/shared/ComicBrandShell';
import { WordmarkLockup } from '../../../src/components/shared/WordmarkLockup';
import { ComicPodium } from '../../../src/components/shared/ComicPodium';
import { ComicProgressBar } from '../../../src/components/shared/ComicProgressBar';

const TOTAL_STEPS = 3;
const STEP = 2;
const KARNATAKA_STATE = 'Karnataka';
const KARNATAKA_DISTRICTS = [
  'Bagalkot',
  'Ballari',
  'Belagavi',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Bidar',
  'Chamarajanagar',
  'Chikkaballapur',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kodagu',
  'Kolar',
  'Koppal',
  'Mandya',
  'Mysuru',
  'Raichur',
  'Ramanagara',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
  'Uttara Kannada',
  'Vijayapura',
  'Yadgir',
] as const;

interface CollegeRequest {
  name: string;
  city: string;
  state: string;
}

export default function OnboardingStep2() {
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useLocalSearchParams<{
    fullName: string;
    username: string;
    avatarUri: string;
    referralCode?: string;
  }>();

  const [colleges, setColleges] = useState<College[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestSheet, setShowRequestSheet] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [requestedCollegeName, setRequestedCollegeName] = useState('');
  const [request, setRequest] = useState<CollegeRequest>({ name: '', city: '', state: KARNATAKA_STATE });
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const isCollegeRequestTableUnavailable = useRef(false);

  // Progress bar
  const progressWidth = useSharedValue(0);
  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  useEffect(() => {
    progressWidth.value = withTiming((STEP / TOTAL_STEPS) * 100, { duration: 600 });
    fetchColleges();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return colleges;

    return colleges.filter((college) => {
      const collegeName = (college.name ?? '').toLowerCase();
      const city = (college.city ?? '').toLowerCase();
      const nameWords = collegeName.split(/\s+/).filter(Boolean);
      const cityWords = city.split(/\s+/).filter(Boolean);

      return (
        collegeName.startsWith(query) ||
        city.startsWith(query) ||
        collegeName.includes(query) ||
        city.includes(query) ||
        nameWords.some((word) => word.startsWith(query)) ||
        cityWords.some((word) => word.startsWith(query))
      );
    });
  }, [search, colleges]);

  const filteredDistricts = useMemo(() => {
    const q = districtSearch.trim().toLowerCase();
    if (!q) return KARNATAKA_DISTRICTS;
    return KARNATAKA_DISTRICTS.filter((district) => district.toLowerCase().includes(q));
  }, [districtSearch]);

  async function fetchColleges() {
    setLoading(true);
    const tablesToTry = ['colleges', 'college'] as const;
    let data: any[] | null = null;
    let error: any = null;

    for (const tableName of tablesToTry) {
      const result = await supabase
        .from(tableName)
        .select('*')
        .order('name', { ascending: true });
      if (!result.error) {
        data = result.data ?? [];
        error = null;
        break;
      }
      error = result.error;
    }

    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Could not load colleges. Check your connection.');
      return;
    }
    const normalized = (data ?? [])
      .map((row) => ({
        ...row,
        name: row.name ?? row.college_name ?? '',
        city: row.city ?? '',
        student_count: Number(row.student_count ?? 0),
      }))
      .filter((row) => row.id && row.name) as College[];
    setColleges(normalized);
  }

  async function submitCollegeRequest() {
    if (!request.name || !request.city || !request.state) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    setSubmittingRequest(true);
    const payload = {
      requested_by: user?.id ?? null,
      college_name: request.name.trim(),
      city: request.city.trim(),
      state: request.state.trim(),
      status: 'pending',
    };
    let error: any = null;
    if (!isCollegeRequestTableUnavailable.current) {
      const tablesToTry = ['college_requests', 'college_request'] as const;
      for (const tableName of tablesToTry) {
        // @ts-expect-error Supabase type shim limitations
        const result = await supabase.from(tableName).insert(payload);
        if (!result.error) {
          error = null;
          break;
        }
        error = result.error;
        const tableMissingForThisName =
          String(result.error?.code ?? '').toUpperCase() === 'PGRST205' ||
          (typeof result.error?.message === 'string' &&
            (result.error.message.includes('relation') || result.error.message.includes('not found')));
        // If the first call already confirms missing table, stop trying extra endpoints.
        if (tableMissingForThisName) {
          isCollegeRequestTableUnavailable.current = true;
          break;
        }
      }
    } else {
      error = { message: 'college request table not found' };
    }
    setSubmittingRequest(false);

    // If request tables are missing in production (404), keep onboarding unblocked.
    const tableMissing =
      typeof error?.message === 'string' &&
      (error.message.includes('relation') || error.message.includes('not found'));
    if (tableMissing) {
      setShowRequestSheet(false);
      setRequestedCollegeName(payload.college_name);
      setRequestPending(true);
      setRequest({ name: '', city: '', state: KARNATAKA_STATE });
      setDistrictSearch('');
      return;
    }

    if (error) {
      Alert.alert('Error', 'Request failed. Please contact support if this keeps happening.');
      return;
    }
    setShowRequestSheet(false);
    setRequestedCollegeName(payload.college_name);
    setRequestPending(true);
    setRequest({ name: '', city: '', state: KARNATAKA_STATE });
    setDistrictSearch('');
  }

  function continueWithRequestedCollege() {
    if (!requestedCollegeName) {
      setRequestPending(false);
      return;
    }
    router.push({
      pathname: '/(auth)/onboarding/step3',
      params: {
        ...params,
        collegeId: '',
        collegeName: requestedCollegeName,
      },
    });
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
      <ComicBrandShell dotColor="#6b03f1" dotSpacing={14} halftoneOpacity={0.12}>
        <View style={[styles.root, styles.centeredContent]}>
          <Text style={styles.pendingIcon}>⏳</Text>
          <Text style={styles.pendingHeadline}>Request Submitted!</Text>
          <Text style={styles.pendingBody}>
            We'll review your college and add it soon. Meanwhile, ask your coordinator to onboard your campus.
          </Text>
          <GradientButton title="Continue for Now" onPress={continueWithRequestedCollege} />
          <View style={{ height: Spacing.md }} />
          <GradientButton title="Go Back to Search" onPress={() => setRequestPending(false)} />
        </View>
      </ComicBrandShell>
    );
  }

  return (
    <ComicBrandShell dotColor="#6b03f1" dotSpacing={14} halftoneOpacity={0.15}>
      <View style={styles.root}>
        <View style={styles.wordmarkWrap}>
          <WordmarkLockup variant="compact" />
        </View>
      {/* Progress */}
      <ComicProgressBar
        progress={STEP / TOTAL_STEPS}
        valueLabel={`Step ${STEP} of ${TOTAL_STEPS}`}
        style={styles.progressTrack}
        compact
      />
      <Text style={styles.stepLabel}>Step {STEP} of {TOTAL_STEPS}</Text>
      <Text style={styles.storylineHeader}>STORY BEAT 2</Text>
      <Text style={styles.headline}>Find Your Campus</Text>
      <Text style={styles.subheadline}>Pick a squad—then watch the podium move.</Text>

      {/* Search */}
      <ComicPodium style={styles.podiumWrap} />
      <Text style={styles.heroLine}>Win with friends.</Text>

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
                {field === 'name' ? (
                  <TextInput
                    style={styles.modalInput}
                    value={request.name}
                    onChangeText={v => setRequest(r => ({ ...r, name: v }))}
                    placeholder="Enter college name"
                    placeholderTextColor={Colors.onSurfaceVariant}
                    accessibilityLabel="College name input"
                  />
                ) : null}
                {field === 'city' ? (
                  <TouchableOpacity
                    style={styles.modalInputPicker}
                    onPress={() => setShowDistrictPicker(true)}
                    accessibilityLabel="Select district"
                    activeOpacity={0.8}
                  >
                    <Text style={request.city ? styles.modalInputPickerText : styles.modalInputPickerPlaceholder}>
                      {request.city || 'Select district'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {field === 'state' ? (
                  <View style={styles.modalInputPicker}>
                    <Text style={styles.modalInputPickerText}>{KARNATAKA_STATE}</Text>
                  </View>
                ) : null}
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

      <Modal
        visible={showDistrictPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDistrictPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.districtPickerCard} padding={20}>
            <Text style={styles.modalTitle}>Select District</Text>
            <TextInput
              style={styles.modalInput}
              value={districtSearch}
              onChangeText={setDistrictSearch}
              placeholder="Search district"
              placeholderTextColor={Colors.onSurfaceVariant}
              accessibilityLabel="Search district input"
              autoCapitalize="words"
            />
            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item}
              style={styles.districtList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.districtItem}
                  onPress={() => {
                    setRequest((prev) => ({ ...prev, city: item, state: KARNATAKA_STATE }));
                    setShowDistrictPicker(false);
                    setDistrictSearch('');
                  }}
                >
                  <Text style={styles.districtText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No district found.</Text>}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowDistrictPicker(false);
                setDistrictSearch('');
              }}
            >
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
      </View>
    </ComicBrandShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingTop: 34 },
  centeredContent: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  wordmarkWrap: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTrack: {
    marginBottom: Spacing.sm,
  },
  stepLabel: {
    fontSize: Typography.size.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    marginBottom: Spacing.md,
  },
  storylineHeader: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.body,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    textAlign: 'left',
    textShadowColor: '#111111',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  headline: {
    fontSize: Typography.size.xxl,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.onSurface,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  heroLine: {
    marginTop: 8,
    marginBottom: 10,
    textAlign: 'center',
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.headlineMd ?? 24,
    fontWeight: '700',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
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
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#111111',
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
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
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 3,
    borderColor: '#111111',
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
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
  podiumWrap: {
    marginBottom: 4,
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
    borderWidth: 3,
    borderColor: '#111111',
    paddingHorizontal: Spacing.md,
    height: 48,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  modalInputPicker: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.sm,
    borderWidth: 3,
    borderColor: '#111111',
    paddingHorizontal: Spacing.md,
    height: 48,
    justifyContent: 'center',
  },
  modalInputPickerText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  modalInputPickerPlaceholder: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  districtPickerCard: {
    marginHorizontal: 24,
    marginTop: 120,
    maxHeight: '70%',
  },
  districtList: {
    marginTop: Spacing.md,
  },
  districtItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outline}22`,
  },
  districtText: {
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
