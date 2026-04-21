import { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GradientButton } from '../shared/GradientButton';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';

export interface HomeEvent {
  id: string;
  title: string;
  imageUrl?: string;
}

interface EventBannerProps {
  event: HomeEvent | null;
  onJoin: (eventId: string) => void;
}

export function EventBanner({ event, onJoin }: EventBannerProps) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [opacity]);
  const liveStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!event) return null;

  return (
    <ImageBackground
      source={
        event.imageUrl
          ? { uri: event.imageUrl }
          : require('../../../assets/images/adaptive-icon.png')
      }
      imageStyle={styles.image}
      style={styles.banner}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.liveBadge, liveStyle]}>
          <Text style={styles.liveText}>LIVE</Text>
        </Animated.View>
        <Text style={styles.title}>{event.title}</Text>
        <GradientButton
          title="Join Now"
          onPress={() => onJoin(event.id)}
          fullWidth={false}
          style={styles.cta}
          textStyle={styles.ctaText}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 158,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    borderRadius: BorderRadius.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 38, 0.62)',
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  liveText: {
    color: '#ffffff',
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.xs,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.lg,
  },
  cta: {
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: Typography.size.sm,
  },
});
