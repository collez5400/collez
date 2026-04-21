import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';
import { GlassCard } from '../shared/GlassCard';

type Action = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
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
    { key: 'task', label: 'Add Task', icon: 'check-circle-outline', onPress: onAddTask },
    { key: 'note', label: 'Quick Note', icon: 'edit-note', onPress: onQuickNote },
    { key: 'pdf', label: 'Upload PDF', icon: 'upload-file', onPress: onUploadPdf },
    { key: 'customize', label: 'Customize', icon: 'tune', onPress: onCustomize },
  ];

  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <Pressable key={action.key} style={styles.cell} onPress={action.onPress}>
          <GlassCard style={styles.card}>
            <MaterialIcons name={action.icon} size={20} color={Colors.primary} />
            <Text style={styles.text}>{action.label}</Text>
          </GlassCard>
        </Pressable>
      ))}
    </View>
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
