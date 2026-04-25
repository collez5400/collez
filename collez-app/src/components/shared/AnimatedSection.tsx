import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '../../config/theme';

type AnimatedSectionProps = {
  title?: string;
  index?: number;
  children: React.ReactNode;
};

export function AnimatedSection({ title, index = 0, children }: AnimatedSectionProps) {
  const delay = index * 80;
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(320)} style={styles.container}>
      {title ? (
        <Animated.Text entering={FadeInUp.delay(delay + 40).duration(280)} style={styles.title}>
          {title}
        </Animated.Text>
      ) : null}
      <View>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});
