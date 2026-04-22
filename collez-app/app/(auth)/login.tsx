import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { GlassCard } from '../../src/components/shared/GlassCard';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/config/theme';

const { width, height } = Dimensions.get('window');

// Floating ambient blob
function AmbientBlob({
  x, y, size, color, delay,
}: {
  x: number; y: number; size: number; color: string; delay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 0.18, duration: 1000, delay, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -20, duration: 3000 + delay, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 3000 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

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
    <View style={styles.root}>
      {/* Ambient blobs */}
      <AmbientBlob x={-60} y={100} size={260} color={Colors.primary} delay={0} />
      <AmbientBlob x={width - 180} y={height * 0.35} size={300} color={Colors.primaryVariant} delay={400} />
      <AmbientBlob x={40} y={height * 0.65} size={200} color={Colors.secondary} delay={600} />

      {/* Main card */}
      <Animated.View
        style={[
          styles.cardWrap,
          { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] },
        ]}
      >
        <GlassCard style={styles.card} padding={32}>
          {/* Brand mark */}
          <LinearGradient
            colors={[Colors.primary, Colors.primaryVariant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandGradient}
          >
            <Text style={styles.brandText}>COLLEZ</Text>
          </LinearGradient>

          <Text style={styles.headline}>Welcome to COLLEZ</Text>
          <Text style={styles.subheadline}>
            Your college life, supercharged. Rank up. Stay consistent. Dominate.
          </Text>

          {/* Error */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Google Sign-In button */}
          <TouchableOpacity
            style={styles.googleBtn}
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
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' ? (
            <TouchableOpacity
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
              activeOpacity={0.8}
              disabled={status === 'loading'}
              accessibilityLabel="Sign in with Apple"
            >
              <FontAwesome name="apple" size={18} color="#ffffff" />
              <Text style={styles.appleBtnText}>Continue with Apple</Text>
            </TouchableOpacity>
          ) : null}

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
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  brandGradient: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: Spacing.md,
  },
  brandText: {
    fontSize: 28,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '800',
    letterSpacing: 8,
    color: Colors.background,
  },
  headline: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.onSurface,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subheadline: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#dadce0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: Spacing.lg,
    gap: 10,
  },
  googleBtnText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '600',
    color: '#3c4043',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: Spacing.lg,
    gap: 10,
  },
  appleBtnText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '600',
    color: '#ffffff',
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
