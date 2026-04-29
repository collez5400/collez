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

  return (
    <ComicBrandShell dotColor="#110e05" dotSpacing={10} halftoneOpacity={0.22}>
      <View style={styles.root}>

      {/* Main card */}
      <Animated.View style={[styles.cardWrap, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
        <View style={styles.card}>
          <View style={styles.lanyardHole} />
          <View style={styles.cardHeader}>
            <View style={styles.logoWrap}>
              <Animated.Image source={{ uri: COLLEZ_LOGO_URI }} style={styles.logo} />
            </View>
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

          {/* Google Sign-In button */}
          <TouchableOpacity
            style={styles.authBtn}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            disabled={status === 'loading'}
            accessibilityLabel="Sign in with Google"
          >
            {status === 'loading' ? (
              <ActivityIndicator color="#5f6368" />
            ) : (
              <>
                <View style={styles.googleIconWrap}>
                  <FontAwesome name="google" size={18} color="#4285F4" />
                </View>
                <Text style={styles.authBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' ? (
            <TouchableOpacity
              style={styles.authBtn}
              onPress={handleAppleSignIn}
              activeOpacity={0.8}
              disabled={status === 'loading'}
              accessibilityLabel="Sign in with Apple"
            >
              <FontAwesome name="apple" size={18} color="#ffffff" />
              <Text style={styles.authBtnText}>Continue with Apple</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.authBtn}
            onPress={() => {}}
            activeOpacity={0.8}
            accessibilityLabel="Use college ID"
          >
            <FontAwesome name="id-badge" size={18} color={Colors.onSurface} />
            <Text style={styles.authBtnText}>Use College ID</Text>
          </TouchableOpacity>

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
          <TouchableOpacity style={styles.ctaBtn} onPress={handleGoogleSignIn} disabled={status === 'loading'}>
            <Text style={styles.ctaText}>ENTER COLLEZ</Text>
            <FontAwesome name="arrow-right" size={20} color={Colors.onPrimary} />
          </TouchableOpacity>
        </View>
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
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 8, height: 8 },
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
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
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
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
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
  ctaBtn: {
    width: '100%',
    height: 64,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: Colors.surfaceContainerLowest,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 8, height: 8 },
    shadowRadius: 0,
    marginTop: 8,
  },
  ctaText: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.headlineMd ?? 24,
    fontWeight: '900',
    textTransform: 'uppercase',
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
