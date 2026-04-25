import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';

interface GreetingHeaderProps {
  fullName: string;
  avatarUrl?: string | null;
  onAvatarPress: () => void;
  onLightningPress: () => void;
}

function getGreeting() {
  const hour = dayjs().hour();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function GreetingHeader({
  fullName,
  avatarUrl,
  onAvatarPress,
  onLightningPress,
}: GreetingHeaderProps) {
  const firstName = fullName.trim().split(' ')[0] ?? 'Scholar';
  const glowOpacity = useSharedValue(0.25);
  const boltY = useSharedValue(0);
  glowOpacity.value = withRepeat(withSequence(withTiming(0.55, { duration: 900 }), withTiming(0.25, { duration: 900 })), -1, true);
  boltY.value = withRepeat(withSequence(withTiming(-2, { duration: 300 }), withTiming(0, { duration: 300 })), -1, true);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const boltStyle = useAnimatedStyle(() => ({ transform: [{ translateY: boltY.value }] }));

  return (
    <View style={styles.container}>
      <Pressable onPress={onAvatarPress} style={styles.avatarButton}>
        <Animated.View style={[styles.avatarGlow, glowStyle]} />
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.brandBlock}>
        <Text style={styles.brand}>COLLEZ</Text>
        <Animated.Text entering={FadeInDown.duration(260)} style={styles.greeting}>
          {getGreeting()}, {firstName}!
        </Animated.Text>
      </View>

      <Pressable onPress={onLightningPress} style={styles.actionButton}>
        <Animated.View style={boltStyle}>
          <MaterialIcons name="bolt" size={22} color={Colors.background} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Colors.outline}66`,
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    inset: -2,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: `${Colors.accentTeal}AA`,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.md,
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
  },
  brand: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.lg,
    letterSpacing: 1.1,
  },
  greeting: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
});
