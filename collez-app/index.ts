import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  // Avoid initializing Android headless task APIs on web.
  // Using require keeps web bundle from eagerly evaluating widget modules.
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./src/widgets/widgetTaskHandler');
  registerWidgetTaskHandler(widgetTaskHandler);
}
import 'expo-router/entry';
