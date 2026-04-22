import AsyncStorage from '@react-native-async-storage/async-storage';

const WIDGET_DATA_KEY = 'collez_widget_overview_v1';

export type CollezWidgetData = {
  streakCount: number;
  nextClass: string;
};

const DEFAULT_WIDGET_DATA: CollezWidgetData = {
  streakCount: 0,
  nextClass: 'No class scheduled',
};

export async function saveWidgetData(data: Partial<CollezWidgetData>) {
  const current = await getWidgetData();
  const merged: CollezWidgetData = {
    ...current,
    ...data,
  };
  await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(merged));
}

export async function getWidgetData(): Promise<CollezWidgetData> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    if (!raw) return DEFAULT_WIDGET_DATA;
    const parsed = JSON.parse(raw) as Partial<CollezWidgetData>;
    return {
      streakCount: Number(parsed.streakCount ?? 0),
      nextClass: parsed.nextClass?.trim() || DEFAULT_WIDGET_DATA.nextClass,
    };
  } catch {
    return DEFAULT_WIDGET_DATA;
  }
}
