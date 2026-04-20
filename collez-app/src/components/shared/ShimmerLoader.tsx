import React from 'react';
import { StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius } from '../../config/theme';

interface ShimmerLoaderProps {
  style?: ViewStyle;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: DimensionValue;
  height?: DimensionValue;
}

export const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
  style,
  variant = 'rectangular',
  width,
  height,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: BorderRadius.full,
          width: width || 50,
          height: height || 50,
        };
      case 'text':
        return {
          borderRadius: 4,
          height: height || 16,
          width: width || '80%',
          marginBottom: 8,
        };
      case 'rectangular':
      default:
        return {
          borderRadius: BorderRadius.md,
          width: width || '100%',
          height: height || 100,
        };
    }
  };

  return (
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      shimmerColors={[Colors.surfaceLow, Colors.surfaceHigh, Colors.surfaceLow]}
      style={[getVariantStyles(), style]}
    />
  );
};
