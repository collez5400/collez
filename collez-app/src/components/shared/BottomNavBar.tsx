import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';

const { width } = Dimensions.get('window');

type RouteName = 'home' | 'rankings' | 'friends' | 'vault' | 'profile';

const ICONS: Record<RouteName, { active: any; inactive: any }> = {
  home: { active: 'home', inactive: 'home' }, // Material doesn't always have exact outline pairs, we'll try outline variants or use opacity
  rankings: { active: 'leaderboard', inactive: 'leaderboard' },
  friends: { active: 'people', inactive: 'people-outline' },
  vault: { active: 'folder', inactive: 'folder-open' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export const BottomNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
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
              label={label as string}
              iconName={iconName || 'circle'}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
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
    opacity: withTiming(isFocused ? 1 : 0.6, { duration: 200 }),
    transform: [{ scale: withTiming(isFocused ? 1.05 : 1, { duration: 200 }) }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
    transform: [{ scaleX: withTiming(isFocused ? 1 : 0, { duration: 200 }) }],
  }));

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabBtn}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.indicatorWrap, indicatorStyle]}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryVariant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.indicator}
        />
      </Animated.View>
      
      <MaterialIcons
        name={iconName as any}
        size={24}
        color={isFocused ? Colors.primary : Colors.onSurfaceVariant}
        style={styles.icon}
      />
      
      <Animated.Text style={[styles.label, { color: isFocused ? Colors.primary : Colors.onSurfaceVariant }, animatedLabelStyle]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: `${Colors.surface}F2`,
    borderRadius: BorderRadius.full,
    ...Shadows.glass,
    elevation: 10,
    borderWidth: 1,
    borderColor: `${Colors.onSurfaceVariant}22`,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 64,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '600',
  },
  indicatorWrap: {
    position: 'absolute',
    top: -Spacing.sm,
    width: 24,
    height: 3,
    alignItems: 'center',
  },
  indicator: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
