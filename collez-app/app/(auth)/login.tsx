import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/config/theme';
import { ComicBrandShell } from '../../src/components/shared/ComicBrandShell';
import { COLLEZ_LOGO_URI } from '../../src/config/branding';
import { HardShadowBox } from '../../src/components/shared/HardShadowBox';
import { GradientButton } from '../../src/components/shared/GradientButton';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, status, error } = useAuthStore();

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 700, delay: 300, useNativeDriver: true }),
      Animated.spring(cardTranslateY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  // Redirect on authenticated
  useEffect(() => {
    if (status === 'authenticated') router.replace('/(tabs)/home');
    if (status === 'onboarding') router.replace('/(auth)/onboarding/step1');
  }, [status]);

  const handleGoogleSignIn = () => {
    if (status === 'loading') return;
    signIn('google');
  };

  const handleAppleSignIn = () => {
    if (status === 'loading') return;
    signIn('apple');
  };

  const AuthButton = ({
    label,
    onPress,
    icon,
  }: {
    label: string;
    onPress: () => void;
    icon: React.ReactNode;
  }) => (
    <HardShadowBox shadowOffset={4} borderRadius={BorderRadius.sm}>
      <TouchableOpacity
        style={styles.authBtn}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={status === 'loading'}
        accessibilityLabel={label}
      >
        {status === 'loading' ? (
          <ActivityIndicator color={Colors.onSurfaceVariant} />
        ) : (
          <>
            {icon}
            <Text style={styles.authBtnText}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    </HardShadowBox>
  );

  return (
    <ComicBrandShell dotColor="#110e05" dotSpacing={10} halftoneOpacity={0.22}>
      <View style={styles.root}>

      {/* Main card */}
      <Animated.View style={[styles.cardWrap, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
        <HardShadowBox shadowOffset={8} borderRadius={BorderRadius.md}>
          <View style={styles.card}>
            <View style={styles.lanyardHole} />
            <View style={styles.cardHeader}>
              <HardShadowBox shadowOffset={4} borderRadius={999}>
                <View style={styles.logoWrap}>
                  <Animated.Image source={{ uri: COLLEZ_LOGO_URI }} style={styles.logo} />
                </View>
              </HardShadowBox>
              <Text style={styles.brandText}>COLLEZ{'\n'}ACCESS CARD</Text>
            </View>

            <Text style={styles.headline}>AUTHENTICATE IDENTITY</Text>
            <Text style={styles.subheadline}>
              Your college life, supercharged.
            </Text>

            {/* Error */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AuthButton
              label="Continue with Google"
              onPress={handleGoogleSignIn}
              icon={
                <View style={styles.googleIconWrap}>
                  <FontAwesome name="google" size={18} color="#4285F4" />
                </View>
              }
            />

            {Platform.OS === 'ios' ? (
              <AuthButton
                label="Continue with Apple"
                onPress={handleAppleSignIn}
                icon={<FontAwesome name="apple" size={18} color={Colors.onSurface} />}
              />
            ) : null}

            <AuthButton
              label="Use College ID"
              onPress={() => {}}
              icon={<FontAwesome name="id-badge" size={18} color={Colors.onSurface} />}
            />

            <View style={styles.barcode} />

            {/* Legal */}
            <View style={styles.legal}>
              <Text style={styles.legalText}>By continuing, you agree to our </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://collez.app/terms')}>
                <Text style={styles.legalLink}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.legalText}> & </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://collez.app/privacy')}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ctaWrap}>
              <GradientButton title="Enter COLLEZ" onPress={handleGoogleSignIn} disabled={status === 'loading'} />
            </View>
          </View>
        </HardShadowBox>
      </Animated.View>
      </View>
    </ComicBrandShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 4,
    borderColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  cardHeader: {
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.surfaceContainerLowest,
    width: '100%',
    paddingBottom: 14,
    marginBottom: 14,
  },
  lanyardHole: {
    width: 64,
    height: 12,
    borderRadius: 99,
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: Colors.surfaceContainerLowest,
    marginBottom: 10,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.surfaceContainerLowest,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    marginBottom: 10,
  },
  logo: { width: '100%', height: '100%' },
  brandText: {
    fontSize: 30,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.onSecondaryContainer,
  },
  headline: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.button,
    color: Colors.onSecondaryContainer,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  subheadline: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSecondaryContainer,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  errorBanner: {
    backgroundColor: `${Colors.error}22`,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    width: '100%',
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    textAlign: 'center',
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: Colors.surfaceContainerLowest,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 10,
    gap: 10,
  },
  authBtnText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.button,
    fontWeight: '700',
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  googleIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8eaed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  barcode: {
    width: '100%',
    height: 24,
    marginTop: 4,
    marginBottom: 14,
    backgroundColor: 'rgba(17,14,5,0.5)',
  },
  ctaWrap: {
    width: '100%',
    marginTop: 8,
  },
  legalText: {
    fontSize: Typography.size.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
  },
  legalLink: {
    fontSize: Typography.size.xs,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    textDecorationLine: 'underline',
  },
});
