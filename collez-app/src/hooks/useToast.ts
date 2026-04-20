import { Alert, ToastAndroid, Platform } from 'react-native';

export const useToast = () => {
  const showToast = (message: string, duration: 'short' | 'long' = 'short') => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        message,
        duration === 'short' ? ToastAndroid.SHORT : ToastAndroid.LONG
      );
    } else {
      // In a real app we might use a custom toast library for iOS
      // For now, mapping to an alert
      Alert.alert('Notification', message);
    }
  };

  return { showToast };
};
