import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ErrorState } from '../src/components/shared/ErrorState';
import { Colors, Spacing } from '../src/config/theme';

export default function GlobalErrorScreen({ error }: { error: Error }) {
  const router = useRouter();

  useEffect(() => {
    console.error('Global route error:', error);
  }, [error]);

  return (
    <View style={styles.screen}>
      <ErrorState
        title="Something broke"
        message={error?.message ?? 'Please try again.'}
        onRetry={() => router.replace('/')}
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
});

