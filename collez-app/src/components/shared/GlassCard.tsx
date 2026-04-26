import React from 'react';
import { StyleSheet, ViewStyle, ViewProps, View } from 'react-native';
import { Colors, BorderRadius } from '../../config/theme';

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
    <View
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: '#111111',
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#110e05',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
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
