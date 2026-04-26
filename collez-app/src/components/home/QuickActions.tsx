import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';
import { GlassCard } from '../shared/GlassCard';

type Action = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  tint: string;
};

interface QuickActionsProps {
  onAddTask: () => void;
  onQuickNote: () => void;
  onUploadPdf: () => void;
  onCustomize: () => void;
}

export function QuickActions({
  onAddTask,
  onQuickNote,
  onUploadPdf,
  onCustomize,
}: QuickActionsProps) {
  const actions: Action[] = [
    { key: 'task', label: 'Add Task', icon: 'check-circle-outline', onPress: onAddTask, tint: Colors.surfaceContainerHigh },
    { key: 'note', label: 'Quick Note', icon: 'edit-note', onPress: onQuickNote, tint: Colors.surfaceContainerHigh },
    { key: 'pdf', label: 'Upload PDF', icon: 'upload-file', onPress: onUploadPdf, tint: Colors.surfaceContainerHigh },
    { key: 'customize', label: 'Customize', icon: 'tune', onPress: onCustomize, tint: Colors.surfaceContainerHigh },
  ];

  return (
    <View style={styles.grid}>
      {actions.map((action, index) => (
        <ActionCard key={action.key} action={action} index={index} />
      ))}
    </View>
  );
}

function ActionCard({ action, index }: { action: Action; index: number }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.cell, animatedStyle]} entering={FadeInUp.delay(index * 70).duration(260)}>
      <Pressable
        onPress={action.onPress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 110 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 110 });
        }}
      >
        <GlassCard style={[styles.card, { backgroundColor: action.tint }]} variant="cool">
            <MaterialIcons name={action.icon} size={20} color={Colors.primaryContainer} />
            <Text style={styles.text}>{action.label}</Text>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    width: '48.5%',
  },
  card: {
    minHeight: 80,
    borderRadius: BorderRadius.md,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  text: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '700',
    fontSize: Typography.size.sm,
  },
});
