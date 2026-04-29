import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';

type RouteName = 'home' | 'rankings' | 'friends' | 'vault' | 'profile';

const ICONS: Record<RouteName, { active: any; inactive: any }> = {
  home: { active: 'home', inactive: 'home' }, // Material doesn't always have exact outline pairs, we'll try outline variants or use opacity
  rankings: { active: 'leaderboard', inactive: 'leaderboard' },
  friends: { active: 'group', inactive: 'group' },
  vault: { active: 'inventory-2', inactive: 'inventory-2' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export const BottomNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, Spacing.sm) : Spacing.xs;
  const barHeight = Platform.OS === 'ios' ? 76 : 72;

  return (
    <View style={[styles.containerOuter, { bottom: bottomInset }]}>
      <View pointerEvents="none" style={styles.containerHardShadow} />
      <View style={styles.container}>
      <View style={[styles.content, { height: barHeight, paddingBottom: Platform.OS === 'ios' ? 4 : 0 }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const routeName = route.name as RouteName;
          const tabLabel =
            routeName === 'home'
              ? 'HOME'
              : routeName === 'rankings'
                ? 'RANK'
                : routeName === 'friends'
                  ? 'FRIENDS'
                  : routeName === 'vault'
                    ? 'VAULT'
                    : 'PROFILE';
          const iconName = isFocused ? ICONS[routeName]?.active : ICONS[routeName]?.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              label={tabLabel || (label as string)}
              iconName={iconName || 'circle'}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
      </View>
    </View>
  );
};

const TabItem = ({
  label,
  iconName,
  isFocused,
  onPress,
}: {
  label: string;
  iconName: string;
  isFocused: boolean;
  onPress: () => void;
}) => {
  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0.8, { duration: 120 }),
    transform: [{ scale: withTiming(isFocused ? 1.1 : 1, { duration: 120 }) }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused ? 1.1 : 1, { damping: 18, stiffness: 300 }) }],
  }));

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabBtn}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapStack}>
        {isFocused ? <View pointerEvents="none" style={styles.iconWrapHardShadow} /> : null}
        <Animated.View style={[styles.iconWrap, isFocused ? styles.iconWrapFocused : styles.iconWrapIdle, iconStyle]}>
          <MaterialIcons
            name={iconName as any}
            size={24}
            color={isFocused ? '#111111' : Colors.onSurfaceVariant}
            style={styles.icon}
          />
        </Animated.View>
      </View>
      
      <Animated.Text style={[styles.label, { color: isFocused ? '#111111' : Colors.onSurfaceVariant }, animatedLabelStyle]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  containerHardShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: '#111111',
    transform: [{ translateY: -4 }],
  },
  container: {
    backgroundColor: Colors.primary,
    borderTopWidth: 4,
    borderTopColor: '#111111',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    marginBottom: 2,
  },
  iconWrap: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  iconWrapStack: {
    position: 'relative',
  },
  iconWrapHardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.md,
    backgroundColor: '#111111',
  },
  iconWrapFocused: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 3,
    borderColor: '#111111',
    transform: [{ scale: 1.04 }],
  },
  iconWrapIdle: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 2,
    borderColor: '#111111',
  },
  label: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.button,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
