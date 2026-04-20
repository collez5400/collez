import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  SpaceGrotesk_700Bold,
  SpaceGrotesk_400Regular,
} from '@expo-google-fonts/space-grotesk';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { initSQLite } from '../src/services/sqliteService';
import { configureGoogleSignIn } from '../src/services/authService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure Google Sign-In globally once
configureGoogleSignIn();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk: SpaceGrotesk_700Bold,
    Manrope: Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        await initSQLite();
        // Artificial delay for demonstration to keep splash screen visible longer
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('SQLite init error:', e);
      } finally {
        setIsReady(true);
      }
    }
    prepareApp();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (isReady) {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsLoaded, fontError, isReady]);

  if (!fontsLoaded && !fontError) return null;
  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      {/* Splash / redirect gate */}
      <Stack.Screen name="index" />

      {/* Auth group: login + onboarding */}
      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />

      {/* Main app tabs */}
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />

      {/* Global profile route */}
      <Stack.Screen name="profile/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

