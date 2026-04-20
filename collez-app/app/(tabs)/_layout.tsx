import React from 'react';
import { Tabs } from 'expo-router';
import { BottomNavBar } from '../../src/components/shared/BottomNavBar';
import { Colors } from '../../src/config/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="rankings"
        options={{ title: 'Rankings' }}
      />
      <Tabs.Screen
        name="friends"
        options={{ title: 'Friends' }}
      />
      <Tabs.Screen
        name="vault"
        options={{ title: 'Vault' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}
