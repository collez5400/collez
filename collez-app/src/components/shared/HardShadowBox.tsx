import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type HardShadowBoxProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  shadowOffset?: number;
  shadowColor?: string;
  borderRadius?: number;
};

/**
 * React Native `shadow*` styles don't render on Android and don't create a true
 * "hard offset shadow" look. This component renders a second layer behind the
 * content to create the reference-accurate hard shadow on all platforms.
 */
export function HardShadowBox({
  children,
  style,
  shadowOffset = 6,
  shadowColor = '#111111',
  borderRadius,
}: HardShadowBoxProps) {
  return (
    <View style={[styles.root, style]}>
      <View
        pointerEvents="none"
        style={[
          styles.shadow,
          {
            backgroundColor: shadowColor,
            top: shadowOffset,
            left: shadowOffset,
            borderRadius,
          },
        ]}
      />
      <View style={[styles.content, borderRadius != null ? { borderRadius } : null]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'relative',
  },
});

