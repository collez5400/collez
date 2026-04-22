import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { CollezWidgetData } from './widgetData';

export function CollezOverviewWidget({ streakCount, nextClass }: CollezWidgetData) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#0B1326',
        justifyContent: 'space-between',
      }}
    >
      <TextWidget
        text="COLLEZ"
        style={{ color: '#B4C5FF', fontSize: 18, fontWeight: '700' }}
      />
      <TextWidget
        text={`🔥 Streak: ${streakCount} day${streakCount === 1 ? '' : 's'}`}
        style={{ color: '#DAE2FD', fontSize: 14, fontWeight: '600' }}
      />
      <TextWidget
        text={`📚 Next: ${nextClass}`}
        maxLines={2}
        style={{ color: '#C3C6D7', fontSize: 12 }}
      />
    </FlexWidget>
  );
}
