import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';

interface StatPillsProps {
  streak: number;
  xp: number;
  rank: string;
  streakShieldCount?: number;
  streakShieldActive?: boolean;
  onPressStreak: () => void;
  onPressXp: () => void;
  onPressRank: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function Pill({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedTouchableOpacity
      style={[styles.pill, style]}
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
      }}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={16} color={Colors.primary} />
      </View>
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </AnimatedTouchableOpacity>
  );
}

export function StatPills({
  streak,
  xp,
  rank,
  streakShieldCount = 0,
  streakShieldActive = false,
  onPressStreak,
  onPressXp,
  onPressRank,
}: StatPillsProps) {
  const streakValue = `${streak} days${streakShieldCount > 0 ? ` · ${streakShieldActive ? 'Shield ON' : `x${streakShieldCount} shield`}` : ''}`;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Pill icon="local-fire-department" label="Streak" value={streakValue} onPress={onPressStreak} />
      <Pill icon="bolt" label="XP" value={xp.toLocaleString()} onPress={onPressXp} />
      <Pill icon="military-tech" label="Rank" value={rank} onPress={onPressRank} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
  },
  pill: {
    minWidth: 128,
    backgroundColor: `${Colors.surfaceHigh}C0`,
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.sm,
    textTransform: 'capitalize',
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
});
