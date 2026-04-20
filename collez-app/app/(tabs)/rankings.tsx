import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStreakStore } from '../../src/store/streakStore';
import { Colors, Typography } from '../../src/config/theme';

export default function RankingsScreen() {
  useEffect(() => {
    void useStreakStore.getState().logStreakAction('leaderboard_view');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rankings</Text>
      <Text style={styles.subtitle}>Leaderboard module will be implemented in Phase 1K.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});
