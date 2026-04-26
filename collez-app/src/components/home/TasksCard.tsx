import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Task } from '../../models/task';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';
import { GlassCard } from '../shared/GlassCard';

interface TasksCardProps {
  tasks: Task[];
  onPress: () => void;
}

export function TasksCard({ tasks, onPress }: TasksCardProps) {
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const activeTasks = tasks.filter((task) => !task.isCompleted && !task.isArchived);
  const completedTasks = tasks.filter((task) => task.isCompleted && !task.isArchived);
  const progress = tasks.length > 0 ? completedTasks.length / tasks.length : 0;
  const previewTasks = activeTasks.slice(0, 2);

  if (progress >= 1) {
    iconScale.value = withTiming(1.2, { duration: 180 });
    iconScale.value = withTiming(1, { duration: 180 });
  }

  return (
    <Animated.View entering={FadeInUp.delay(80).duration(280)} style={pressStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.98, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 110 });
        }}
      >
      <GlassCard style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Tasks</Text>
          <Animated.View style={checkStyle}>
            <MaterialIcons name={progress >= 1 ? 'task-alt' : 'assignment'} size={18} color={Colors.primary} />
          </Animated.View>
        </View>
        <Text style={styles.meta}>{activeTasks.length} active task(s)</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(progress * 100, 6)}%` }]} />
        </View>
        {previewTasks.length === 0 ? (
          <Text style={styles.empty}>You are all caught up.</Text>
        ) : (
          <View style={styles.previewList}>
            {previewTasks.map((task) => (
              <Text style={styles.taskText} numberOfLines={1} key={task.id}>
                - {task.title}
              </Text>
            ))}
          </View>
        )}
      </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.md,
  },
  meta: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: `${Colors.surfaceHigh}99`,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryContainer,
  },
  previewList: {
    marginTop: 4,
    gap: 2,
  },
  taskText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  empty: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});
