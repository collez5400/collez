import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { GlassCard } from '../../src/components/shared/GlassCard';
import { GradientButton } from '../../src/components/shared/GradientButton';
import { ErrorState } from '../../src/components/shared/ErrorState';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { useUserStore } from '../../src/store/userStore';
import { useCoordinatorStore } from '../../src/store/coordinatorStore';

function statusLabel(status: string) {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Under Review';
}

export default function CoordinatorApplyScreen() {
  const { profile, fetchProfile } = useUserStore();
  const {
    application,
    eligibility,
    isLoading,
    isSubmitting,
    error,
    fetchMyApplication,
    refreshEligibility,
    submitApplication,
    clearError,
  } = useCoordinatorStore();

  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [collegeIdPhoto, setCollegeIdPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [selfie, setSelfie] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useEffect(() => {
    void (async () => {
      await fetchProfile();
      await fetchMyApplication();
      await refreshEligibility();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setEmail(profile.email ?? '');
    }
  }, [profile]);

  const canApply = useMemo(() => {
    if (profile?.is_coordinator) return false;
    if (application?.status === 'pending') return false;
    return eligibility?.ok ?? false;
  }, [application?.status, eligibility?.ok, profile?.is_coordinator]);

  const pickImage = async (kind: 'college_id' | 'selfie') => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to capture photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 5],
    });
    if (result.canceled || !result.assets.length) return;

    if (kind === 'college_id') setCollegeIdPhoto(result.assets[0]);
    else setSelfie(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!collegeIdPhoto || !selfie) {
      Alert.alert('Missing photos', 'Please capture both your college ID photo and a selfie.');
      return;
    }
    if (!fullName.trim() || !whatsapp.trim() || !email.trim() || !reason.trim()) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }

    const ok = await submitApplication({
      fullName,
      whatsappNumber: whatsapp,
      email,
      reason,
      collegeIdPhoto,
      selfie,
    });
    if (ok) {
      Alert.alert('Submitted', 'Your application is under review.');
      router.replace('/(tabs)/profile');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Coordinator Application</Text>
          <View style={{ width: 40 }} />
        </View>

        {profile?.is_coordinator ? (
          <GlassCard>
            <Text style={styles.sectionTitle}>You’re already a coordinator</Text>
            <Text style={styles.mutedText}>Thanks for representing your campus.</Text>
            <GradientButton title="Back to Profile" onPress={() => router.replace('/(tabs)/profile')} />
          </GlassCard>
        ) : null}

        {!profile?.is_coordinator && application ? (
          <GlassCard style={styles.statusCard}>
            <View style={styles.statusRow}>
              <MaterialIcons
                name={application.status === 'approved' ? 'verified' : application.status === 'rejected' ? 'error' : 'hourglass-top'}
                size={22}
                color={application.status === 'approved' ? Colors.secondary : application.status === 'rejected' ? Colors.error : Colors.primary}
              />
              <Text style={styles.statusTitle}>Status: {statusLabel(application.status)}</Text>
            </View>
            {application.status === 'rejected' && application.admin_notes ? (
              <Text style={styles.mutedText}>Reason: {application.admin_notes}</Text>
            ) : null}
            {application.status === 'pending' ? (
              <Text style={styles.mutedText}>We’ll review this within 24–48 hours.</Text>
            ) : null}
          </GlassCard>
        ) : null}

        {eligibility ? (
          <GlassCard>
            <Text style={styles.sectionTitle}>Eligibility</Text>
            {eligibility.ok ? (
              <Text style={styles.goodText}>You’re eligible to apply.</Text>
            ) : (
              <View style={{ gap: 8 }}>
                <Text style={styles.mutedText}>Complete these requirements:</Text>
                {eligibility.reasons.map((r) => (
                  <View key={r} style={styles.reasonRow}>
                    <MaterialIcons name="info" size={18} color={Colors.onSurfaceVariant} />
                    <Text style={styles.reasonText}>{r}</Text>
                  </View>
                ))}
              </View>
            )}
          </GlassCard>
        ) : null}

        <GlassCard>
          <Text style={styles.sectionTitle}>Application form</Text>

          <Text style={styles.inputLabel}>Full name</Text>
          <TextInput value={fullName} onChangeText={setFullName} style={styles.input} placeholder="Your full name" placeholderTextColor={Colors.outline} />

          <Text style={styles.inputLabel}>WhatsApp number</Text>
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            style={styles.input}
            placeholder="+91..."
            placeholderTextColor={Colors.outline}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="you@gmail.com"
            placeholderTextColor={Colors.outline}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Why do you want to be a coordinator?</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            style={[styles.input, styles.multiline]}
            placeholder="Tell us why you’re a great fit..."
            placeholderTextColor={Colors.outline}
            multiline
          />

          <View style={styles.photoGrid}>
            <Pressable style={styles.photoCard} onPress={() => void pickImage('college_id')}>
              <MaterialIcons name="badge" size={22} color={Colors.onSurfaceVariant} />
              <Text style={styles.photoTitle}>College ID</Text>
              <Text style={styles.photoHint}>{collegeIdPhoto ? 'Captured' : 'Tap to capture'}</Text>
            </Pressable>
            <Pressable style={styles.photoCard} onPress={() => void pickImage('selfie')}>
              <MaterialIcons name="photo-camera" size={22} color={Colors.onSurfaceVariant} />
              <Text style={styles.photoTitle}>Selfie</Text>
              <Text style={styles.photoHint}>{selfie ? 'Captured' : 'Tap to capture'}</Text>
            </Pressable>
          </View>

          <GradientButton
            title={isSubmitting ? 'Submitting...' : 'Submit Application'}
            onPress={handleSubmit}
            disabled={isLoading || isSubmitting || !canApply}
          />

          {!canApply && !profile?.is_coordinator ? (
            <Text style={styles.mutedText}>
              {application?.status === 'pending'
                ? 'Your application is already under review.'
                : 'You can apply once you meet all eligibility requirements.'}
            </Text>
          ) : null}
        </GlassCard>

        {error ? (
          <Pressable onPress={clearError}>
            <ErrorState message={error} onRetry={() => void fetchMyApplication()} compact />
          </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  sectionTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
    marginBottom: 8,
  },
  mutedText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  goodText: {
    color: Colors.success,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  inputLabel: {
    marginTop: 10,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  input: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: Colors.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  photoGrid: {
    marginTop: 14,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  photoCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    backgroundColor: Colors.surfaceHigh,
    padding: 12,
    gap: 6,
  },
  photoTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  photoHint: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  statusCard: {
    gap: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasonText: {
    flex: 1,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});

