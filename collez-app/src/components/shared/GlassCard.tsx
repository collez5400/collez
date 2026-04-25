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
  variant?: 'default' | 'warm' | 'cool' | 'accent';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = Layout.glassBlur,
  style,
  borderRadius = BorderRadius.md,
  padding = 16,
  variant = 'default',
  ...rest
}) => {
  const variantStyle = {
    default: styles.defaultBg,
    warm: styles.warmBg,
    cool: styles.coolBg,
    accent: styles.accentBg,
  }[variant];

  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[
        styles.container,
        variantStyle,
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
    borderColor: `${Colors.onSurfaceVariant}33`,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.glass,
  },
  defaultBg: {
    backgroundColor: `${Colors.surfaceHigh}99`,
  },
  warmBg: {
    backgroundColor: `${Colors.accentGold}22`,
  },
  coolBg: {
    backgroundColor: `${Colors.accentTeal}1F`,
  },
  accentBg: {
    backgroundColor: `${Colors.primary}25`,
    borderColor: `${Colors.primary}55`,
  },
});
