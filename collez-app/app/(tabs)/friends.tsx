import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { Colors, Spacing, Typography } from '../../src/config/theme';

export default function FriendsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Friends</Text>
      <EmptyState
        icon="group"
        title="No friends yet"
        description="Search and add classmates in Phase 2. Your network will appear here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
});
