import React from 'react';
import { StyleSheet, ViewStyle, ViewProps, View } from 'react-native';
import { Colors, BorderRadius } from '../../config/theme';
import { HardShadowBox } from './HardShadowBox';

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
  intensity = 0,
  style,
  borderRadius = BorderRadius.lg,
  padding = 20,
  variant = 'default',
  ...rest
}) => {
  void intensity;
  const variantStyle = {
    default: styles.defaultBg,
    warm: styles.warmBg,
    cool: styles.coolBg,
    accent: styles.accentBg,
  }[variant];

  return (
    <HardShadowBox shadowOffset={6} borderRadius={borderRadius} style={style}>
      <View
        style={[
          styles.container,
          variantStyle,
          {
            borderRadius,
            padding,
          },
        ]}
        {...rest}
      >
        {children}
      </View>
    </HardShadowBox>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: '#111111',
    borderWidth: 3,
    overflow: 'hidden',
  },
  defaultBg: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  warmBg: {
    backgroundColor: Colors.surfaceContainer,
  },
  coolBg: {
    backgroundColor: Colors.surfaceVariant,
  },
  accentBg: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: '#111111',
  },
});
