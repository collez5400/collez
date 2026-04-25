import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { BorderRadius, Colors, Spacing, Typography } from '../../../src/config/theme';

const TopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

function VaultTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const tabWidth = containerWidth > 0 ? containerWidth / state.routes.length : 0;
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(state.index * tabWidth, { duration: 180 }) }],
  }));
  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarInner} onLayout={handleLayout}>
        <Animated.View entering={FadeIn.duration(220)} style={[styles.indicatorSlot, { width: tabWidth }, indicatorStyle]}>
          <Svg width="100%" height="100%">
            <Defs>
              <SvgLinearGradient id="vaultTabGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={Colors.primary} />
                <Stop offset="100%" stopColor={Colors.secondary} />
              </SvgLinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" rx={999} fill="url(#vaultTabGradient)" />
          </Svg>
        </Animated.View>

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label = typeof options.title === 'string' ? options.title : route.name;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => {
                if (isFocused) {
                  return;
                }
                navigation.navigate(route.name, route.params);
              }}
              style={styles.tabButton}
            >
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function VaultLayout() {
  return (
    <TopTabs
      screenOptions={{
        lazy: true,
        animationEnabled: true,
        swipeEnabled: true,
      }}
      tabBar={(props) => <VaultTabBar {...props} />}
    >
      <TopTabs.Screen name="timetable" options={{ title: 'Timetable' }} />
      <TopTabs.Screen name="tasks" options={{ title: 'Tasks & Notes' }} />
      <TopTabs.Screen name="pdfs" options={{ title: 'PDFs' }} />
    </TopTabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outline}22`,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1,
    borderColor: `${Colors.outline}22`,
    minHeight: 42,
    position: 'relative',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    zIndex: 2,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  tabLabelFocused: {
    color: Colors.background,
  },
  indicatorSlot: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    padding: 3,
  },
});
