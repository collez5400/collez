import React from 'react';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Colors, Typography, Spacing } from '../../../src/config/theme';

const TopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function VaultLayout() {
  return (
    <TopTabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: `${Colors.outline}22`,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarIndicatorStyle: {
          backgroundColor: Colors.primary,
          height: 3,
          borderRadius: 3,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamily.heading,
          fontWeight: '700',
          fontSize: 13,
          textTransform: 'none',
        },
      }}
    >
      <TopTabs.Screen name="timetable" options={{ title: 'Timetable' }} />
      <TopTabs.Screen name="tasks" options={{ title: 'Tasks & Notes' }} />
      <TopTabs.Screen name="pdfs" options={{ title: 'PDFs' }} />
    </TopTabs>
  );
}
