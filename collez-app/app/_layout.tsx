import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, ToastAndroid } from 'react-native';
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
import { configureGoogleSignIn } from '../src/services/authService';
import { useStreakStore } from '../src/store/streakStore';
import { useXpStore } from '../src/store/xpStore';
import { XP_VALUES } from '../src/config/constants';

const { initSQLite } =
  Platform.OS === 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../src/services/sqliteService.web')
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../src/services/sqliteService.native');

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
  const appOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousStateRef = useRef<AppStateStatus>(AppState.currentState);

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

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const startAppOpenTimer = () => {
      if (appOpenTimerRef.current) clearTimeout(appOpenTimerRef.current);
      appOpenTimerRef.current = setTimeout(() => {
        void useStreakStore.getState().logStreakAction('app_open');
        void (async () => {
          const result = await useXpStore.getState().awardXpForAction({
            source: 'daily_login',
            amount: XP_VALUES.DAILY_LOGIN,
            description: 'Daily login reward',
          });

          if (result && result.awardedXp > 0 && Platform.OS === 'android') {
            ToastAndroid.show(`+${result.awardedXp} XP`, ToastAndroid.SHORT);
          }
        })();
      }, 5000);
    };

    startAppOpenTimer();

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = previousStateRef.current;
      previousStateRef.current = nextState;

      if (nextState === 'active' && previousState !== 'active') {
        startAppOpenTimer();
      }

      if (nextState !== 'active' && appOpenTimerRef.current) {
        clearTimeout(appOpenTimerRef.current);
        appOpenTimerRef.current = null;
      }
    });

    return () => {
      subscription.remove();
      if (appOpenTimerRef.current) clearTimeout(appOpenTimerRef.current);
    };
  }, []);

  if (!fontsLoaded && !fontError) return null;
  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      {/* Splash / redirect gate */}
      <Stack.Screen name="index" />
    </Stack>
  );
}