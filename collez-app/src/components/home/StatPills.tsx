import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
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
  index,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);
  const shine = useSharedValue(0);
  shine.value = withSequence(withTiming(1, { duration: 350 }), withTiming(0, { duration: 450 }));
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const shineStyle = useAnimatedStyle(() => ({ opacity: shine.value }));
  const iconBg =
    icon === 'local-fire-department'
      ? `${Colors.accentCoral}2B`
      : icon === 'bolt'
        ? `${Colors.accentGold}2B`
        : `${Colors.accentTeal}2B`;
  return (
    <AnimatedTouchableOpacity
      entering={FadeInRight.delay(index * 80).duration(240)}
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
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={16} color={Colors.primary} />
      </View>
      <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />
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
      <Pill icon="local-fire-department" label="Streak" value={streakValue} onPress={onPressStreak} index={0} />
      <Pill icon="bolt" label="XP" value={xp.toLocaleString()} onPress={onPressXp} index={1} />
      <Pill icon="military-tech" label="Rank" value={rank} onPress={onPressRank} index={2} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
  },
  pill: {
    minWidth: 128,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 3,
    borderColor: '#111111',
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 0,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shine: {
    position: 'absolute',
    right: -24,
    top: -10,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF16',
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
