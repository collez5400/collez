import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors } from '../../config/theme';

export type BadgeType = 'rank' | 'streak' | 'coordinator';

interface BadgeIconProps {
  type: BadgeType;
  iconName: keyof typeof MaterialIcons.glyphMap;
  color?: string;
  size?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  type,
  iconName,
  color = Colors.primary,
  size = 24,
  style,
  animated = false,
}) => {
  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75 }, getBgStyle(type, color), style]}>
      {animated && type === 'coordinator' ? (
        <LottieView
          source={require('../../../assets/animations/coordinator-frame.json')}
          autoPlay
          loop
          style={styles.animationOverlay}
        />
      ) : null}
      <MaterialIcons name={iconName} size={size} color={color} />
    </View>
  );
};

const getBgStyle = (type: BadgeType, color: string) => {
  return {
    backgroundColor: `${color}20`, // 20% opacity matching the color
    borderWidth: 1,
    borderColor: `${color}40`,
  };
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  animationOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
