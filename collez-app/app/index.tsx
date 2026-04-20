import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../src/store/authStore';
import { Colors, Typography, Spacing } from '../src/config/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { status, restoreSession } = useAuthStore();

  // Animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Subtitle fade in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });

    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.9, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Loading bar
    Animated.timing(barWidth, {
      toValue: width - 64,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    // Restore session
    restoreSession();
  }, []);

  // Navigate once auth status resolves
  useEffect(() => {
    if (status === 'idle' || status === 'loading') return;
    const timer = setTimeout(() => {
      if (status === 'authenticated') {
        router.replace('/(tabs)/home');
      } else if (status === 'onboarding') {
        router.replace('/(auth)/onboarding/step1');
      } else {
        router.replace('/(auth)/login');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <View style={styles.root}>
      {/* Radial glow behind logo */}
      <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />

      {/* Logo block */}
      <Animated.View
        style={[styles.logoBlock, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryVariant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientText}
        >
          <Text style={styles.logo}>COLLEZ</Text>
        </LinearGradient>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          The Kinetic Scholar
        </Animated.Text>
      </Animated.View>

      {/* Animated loading bar */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.primary,
    opacity: 0.06,
    // Soft glow using shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 120,
    elevation: 0,
  },
  logoBlock: {
    alignItems: 'center',
    gap: 12,
  },
  gradientText: {
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  logo: {
    fontSize: 64,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '800',
    letterSpacing: 12,
    color: Colors.background,
  },
  subtitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },
  barTrack: {
    position: 'absolute',
    bottom: 72,
    left: 32,
    right: 32,
    height: 2,
    backgroundColor: `${Colors.onSurfaceVariant}33`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
