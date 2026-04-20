import React from 'react';
import { StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Layout, Shadows } from '../../config/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle | ViewStyle[];
  borderRadius?: number;
  padding?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = Layout.glassBlur,
  style,
  borderRadius = BorderRadius.md,
  padding = 16,
  ...rest
}) => {
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[
        styles.container,
        {
          borderRadius,
          padding,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${Colors.surfaceHigh}99`, // semi-transparent
    borderColor: `${Colors.onSurfaceVariant}33`,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.glass,
  },
});
