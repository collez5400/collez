import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Colors, Typography } from '../src/config/theme';
import { ComicBrandShell } from '../src/components/shared/ComicBrandShell';
import { WordmarkLockup } from '../src/components/shared/WordmarkLockup';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { status, restoreSession } = useAuthStore();

  // Animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(8)).current;
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
      toValue: Math.min(width - 84, 360),
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
    <ComicBrandShell dotColor="#6b03f1" dotSpacing={16} halftoneOpacity={0.15}>
      <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.glowCircle2, { opacity: glowOpacity }]} />

      <Animated.View
        style={[styles.logoBlock, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <WordmarkLockup />
        <Animated.Text style={[styles.brandPromise, { opacity: subtitleOpacity }]}>
          WELCOME TO THE{'\n'}COMIC CAMPUS
        </Animated.Text>
      </Animated.View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]}>
          <LinearGradient
            colors={[
              'rgba(255,212,0,0.95)',
              'rgba(255,212,0,0.10)',
              'rgba(107,3,241,0.85)',
              'rgba(255,212,0,0.10)',
              'rgba(255,212,0,0.95)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.stripes}
          />
        </Animated.View>
      </View>
    </ComicBrandShell>
  );
}

const styles = StyleSheet.create({
  glowCircle: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: Colors.secondaryContainer,
    opacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
    elevation: 0,
  },
  glowCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primaryContainer,
    opacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
    elevation: 0,
  },
  logoBlock: {
    alignItems: 'center',
    gap: 16,
  },
  brandPromise: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.button,
    color: Colors.primary,
    letterSpacing: 2.4,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  barTrack: {
    position: 'absolute',
    bottom: 84,
    width: Math.min(width - 40, 448),
    height: 32,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#111111',
    borderWidth: 3,
    shadowColor: '#6b03f1',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
  },
  barFill: {
    height: 24,
    margin: 1,
    marginTop: 2,
    borderRadius: 4,
    backgroundColor: Colors.primaryContainer,
    shadowColor: '#ffd400',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  stripe: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  stripes: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
});
