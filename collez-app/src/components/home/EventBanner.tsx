import { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
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
  ctaLabel?: string;
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

  const content = (
    <View style={styles.overlay}>
      <Animated.View style={[styles.liveBadge, liveStyle]}>
        <Text style={styles.liveText}>LIVE</Text>
      </Animated.View>
      <Text style={styles.title}>{event.title}</Text>
      <GradientButton
        title={event.ctaLabel ?? 'Join Now'}
        onPress={() => onJoin(event.id)}
        fullWidth={false}
        style={styles.cta}
        textStyle={styles.ctaText}
      />
    </View>
  );

  if (!event.imageUrl) {
    return (
      <Animated.View entering={FadeIn.delay(200).duration(300)} style={[styles.banner, styles.fallbackBanner]}>
        {content}
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.delay(200).duration(300)}>
      <ImageBackground source={{ uri: event.imageUrl }} imageStyle={styles.image} style={styles.banner}>
        {content}
      </ImageBackground>
    </Animated.View>
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
  fallbackBanner: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 3,
    borderColor: '#111111',
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 6, height: 6 },
    shadowRadius: 0,
    elevation: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#110e05AA',
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: '#111111',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
  },
  liveText: {
    color: '#111111',
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
