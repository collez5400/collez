import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { useAuthStore } from '../../../src/store/authStore';
import { supabase } from '../../../src/config/supabase';
import {
  Colors, Typography, Spacing, BorderRadius,
} from '../../../src/config/theme';

const TOTAL_STEPS = 3;
const STEP = 1;

// Username validation
function validateUsername(username: string): string | null {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'At least 3 characters required';
  if (username.length > 20) return 'Max 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Only letters, numbers, and underscore';
  return null;
}

export default function OnboardingStep1() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url ?? null);
  const [referralCode, setReferralCode] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Progress bar animation
  const progressWidth = useSharedValue(0);
  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  useEffect(() => {
    progressWidth.value = withTiming((STEP / TOTAL_STEPS) * 100, { duration: 600 });
  }, []);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow media library access to set your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const checkUsernameAvailable = async (value: string) => {
    const err = validateUsername(value);
    if (err) { setUsernameError(err); return false; }
    setCheckingUsername(true);
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', value.toLowerCase())
      .neq('id', user?.id ?? '')
      .maybeSingle();
    setCheckingUsername(false);
    if (data) {
      setUsernameError('This username is already taken');
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const handleContinue = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing info', 'Please enter your full name.');
      return;
    }
    const available = await checkUsernameAvailable(username.toLowerCase().trim());
    if (!available) return;

    setLoading(true);
    try {
      // Store locally in auth state; we commit on step3 completion
      router.push({
        pathname: '/(auth)/onboarding/step2',
        params: {
          fullName: fullName.trim(),
          username: username.toLowerCase().trim(),
          avatarUri: avatarUri ?? '',
          referralCode: referralCode.trim().toUpperCase(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressAnimStyle]} />
        </View>
        <Text style={styles.stepLabel}>Step {STEP} of {TOTAL_STEPS}</Text>

        <Text style={styles.headline}>Set Up Your Profile</Text>
        <Text style={styles.subheadline}>
          This is how you'll appear on the leaderboard and to other students.
        </Text>

        {/* Avatar picker */}
        <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.8}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>📷</Text>
              <Text style={styles.avatarHint}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={Colors.onSurfaceVariant}
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityLabel="Full name input"
            />
          </View>
        </View>

        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={[styles.inputRow, usernameError ? styles.inputError : null]}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={v => {
                setUsername(v);
                setUsernameError(null);
              }}
              onBlur={() => checkUsernameAvailable(username)}
              placeholder="your_handle"
              placeholderTextColor={Colors.onSurfaceVariant}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              accessibilityLabel="Username input"
            />
            {checkingUsername && (
              <Text style={styles.checkingText}>Checking…</Text>
            )}
          </View>
          {usernameError ? (
            <Text style={styles.errorText}>{usernameError}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Referral Code (Optional)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🎁</Text>
            <TextInput
              style={styles.input}
              value={referralCode}
              onChangeText={(value) => setReferralCode(value.toUpperCase())}
              placeholder="e.g. CLZ12AB"
              placeholderTextColor={Colors.onSurfaceVariant}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Referral code input"
            />
          </View>
        </View>

        <View style={styles.btnWrap}>
          <GradientButton
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!fullName.trim() || !username.trim()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressTrack: {
    height: 4,
    backgroundColor: `${Colors.onSurfaceVariant}33`,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: Typography.size.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    marginBottom: Spacing.lg,
  },
  headline: {
    fontSize: Typography.size.xxl,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.onSurface,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subheadline: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.onSurfaceVariant,
    borderStyle: 'dashed',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  avatarIcon: { fontSize: 24 },
  avatarHint: {
    fontSize: Typography.size.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
  },
  inputGroup: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurface,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.onSurfaceVariant}44`,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputIcon: { fontSize: 16, marginRight: Spacing.sm },
  inputPrefix: {
    fontSize: Typography.size.md,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurface,
  },
  checkingText: {
    fontSize: Typography.size.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
  },
  errorText: {
    fontSize: Typography.size.xs,
    color: Colors.error,
    fontFamily: Typography.fontFamily.body,
    marginTop: 4,
  },
  btnWrap: { marginTop: Spacing.xl },
});
