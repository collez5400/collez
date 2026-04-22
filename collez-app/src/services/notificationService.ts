import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { supabase } from '../config/supabase';

const STORAGE_KEY_LAST_PUSH_TOKEN = 'push:last_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationDeepLinkData = {
  url?: string;
};

export function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;
  void Notifications.setNotificationChannelAsync('default', {
    name: 'COLLEZ',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#B4C5FF',
  });
}

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  ensureAndroidNotificationChannel();

  const isPhysicalDevice =
    Constants.executionEnvironment === 'standalone' ||
    Constants.executionEnvironment === 'storeClient' ||
    Constants.isDevice;

  if (!isPhysicalDevice) {
    // Push tokens do not work on most emulators/simulators.
    return null;
  }

  const settings = await Notifications.getPermissionsAsync();
  let finalStatus = settings.status;

  if (finalStatus !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  if (finalStatus !== 'granted') return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    // Fallback for older config shapes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants as any)?.easConfig?.projectId;

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  const token = tokenResponse.data;

  const lastStored = await AsyncStorage.getItem(STORAGE_KEY_LAST_PUSH_TOKEN);
  if (lastStored !== token) {
    await AsyncStorage.setItem(STORAGE_KEY_LAST_PUSH_TOKEN, token);
    await supabase
      .from('users')
      // @ts-expect-error Supabase update typing (manual Database shim)
      .update({ push_token: token })
      .eq('id', userId);
  }

  return token;
}

export function parseNotificationDeepLink(
  notification: Notifications.Notification | Notifications.NotificationResponse
): string | null {
  const data =
    'notification' in notification
      ? (notification.notification.request.content.data as NotificationDeepLinkData)
      : (notification.request.content.data as NotificationDeepLinkData);

  const url = typeof data?.url === 'string' ? data.url : null;
  if (!url) return null;
  return url.startsWith('/') ? url : `/${url}`;
}

