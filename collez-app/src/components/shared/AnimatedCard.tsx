import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type AnimatedCardProps = {
  children: React.ReactNode;
  index?: number;
  delayMs?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedCard({
  children,
  index = 0,
  delayMs,
  style,
}: AnimatedCardProps) {
  const entering = FadeInUp.delay(delayMs ?? index * 60).duration(300);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
