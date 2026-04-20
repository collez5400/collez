import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors, Typography, BorderRadius } from '../../config/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.touchable,
        fullWidth && styles.fullWidth,
        style,
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryVariant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={Colors.background} />
        ) : (
          <>
            {icon && icon}
            <Text style={[styles.text, textStyle, icon ? styles.textWithIcon : null]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.background,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
