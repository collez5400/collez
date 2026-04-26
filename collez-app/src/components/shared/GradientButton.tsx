import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
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
  variant?: 'primary' | 'secondary';
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
  variant = 'primary',
}) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(pressed.value ? 6 : 0, { duration: 75 }) },
      { translateY: withTiming(pressed.value ? 6 : 0, { duration: 75 }) },
    ],
    shadowOffset: {
      width: withTiming(pressed.value ? 0 : 6, { duration: 75 }),
      height: withTiming(pressed.value ? 0 : 6, { duration: 75 }),
    },
    opacity: disabled ? 0.5 : 1,
  }));

  const handlePressIn = () => {
    pressed.value = 1;
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { stiffness: 300, damping: 20 });
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.touchable,
        fullWidth && styles.fullWidth,
        style,
        animatedStyle,
      ]}
    >
      <View style={[styles.buttonBody, variant === 'secondary' && styles.buttonSecondary]}>
        {loading ? (
          <ActivityIndicator color={variant === 'secondary' ? Colors.onSecondaryContainer : Colors.onPrimary} />
        ) : (
          <>
            {icon && icon}
            <Text
              style={[
                styles.text,
                variant === 'secondary' && styles.textSecondary,
                textStyle,
                icon ? styles.textWithIcon : null,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#111111',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  fullWidth: {
    width: '100%',
  },
  buttonBody: {
    backgroundColor: Colors.primaryContainer,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonSecondary: {
    backgroundColor: Colors.secondaryContainer,
  },
  text: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily.button,
    fontSize: Typography.size.buttonLabel ?? Typography.size.md,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  textSecondary: {
    color: Colors.onSecondaryContainer,
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
