import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CollezOverviewWidget } from './CollezOverviewWidget';
import { getWidgetData } from './widgetData';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, renderWidget } = props;
  if (widgetInfo.widgetName !== 'CollezOverview') return;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK': {
      const data = await getWidgetData();
      renderWidget(<CollezOverviewWidget {...data} />);
      break;
    }
    case 'WIDGET_DELETED':
    default:
      break;
  }
}
