import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';
import { GradientButton } from '../shared/GradientButton';
import { StreakMilestone } from '../../models/streak';

interface MilestoneCelebrationModalProps {
  milestone: StreakMilestone | null;
  visible: boolean;
  onClose: () => void;
}

export function MilestoneCelebrationModal({
  milestone,
  visible,
  onClose,
}: MilestoneCelebrationModalProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale, visible]);

  if (!milestone) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconWrap}>
            <MaterialIcons
              name={milestone.icon as keyof typeof MaterialIcons.glyphMap}
              size={34}
              color={Colors.warning}
            />
          </View>
          <Text style={styles.title}>Milestone Unlocked!</Text>
          <Text style={styles.subtitle}>
            {milestone.day}-day streak earned{'\n'}
            {milestone.badgeName}
          </Text>
          <GradientButton title="Awesome" onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.warning}22`,
    borderWidth: 1,
    borderColor: `${Colors.warning}44`,
    alignSelf: 'center',
  },
  title: {
    color: Colors.onSurface,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    lineHeight: 22,
  },
});

