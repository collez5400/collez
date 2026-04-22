import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { PREMIUM_THEMES } from '../../src/config/premiumThemes';
import { GlassCard } from '../../src/components/shared/GlassCard';
import { usePremiumStore } from '../../src/store/premiumStore';

export default function PremiumThemesScreen() {
  const {
    activeTheme,
    unlockedThemes,
    prices,
    isLoading,
    isPurchasing,
    error,
    initialize,
    selectTheme,
    unlockThemePurchase,
    clearError,
  } = usePremiumStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!error) return;
    Alert.alert('Premium', error, [{ text: 'OK', onPress: clearError }]);
  }, [clearError, error]);

  const handleThemePress = async (themeId: (typeof PREMIUM_THEMES)[number]['id']) => {
    const isUnlocked = unlockedThemes.includes(themeId);
    if (isUnlocked) {
      await selectTheme(themeId);
      return;
    }

    const success = await unlockThemePurchase(themeId);
    if (success) {
      await selectTheme(themeId);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Premium Themes</Text>
        <Text style={styles.subtitle}>
          Pick your style. Premium themes sync to your account via `premium_config`.
        </Text>

        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          PREMIUM_THEMES.map((theme) => {
            const isActive = activeTheme === theme.id;
            const isUnlocked = unlockedThemes.includes(theme.id);
            const priceLabel = theme.productId ? prices[theme.productId] : null;

            return (
              <GlassCard key={theme.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <View>
                    <Text style={styles.cardTitle}>{theme.name}</Text>
                    <Text style={styles.cardDescription}>{theme.description}</Text>
                  </View>
                  <Text style={styles.tag}>{theme.isPremium ? 'Premium' : 'Free'}</Text>
                </View>

                <View style={styles.previewRow}>
                  <View style={[styles.swatch, { backgroundColor: theme.palette.background }]} />
                  <View style={[styles.swatch, { backgroundColor: theme.palette.surface }]} />
                  <View style={[styles.swatch, { backgroundColor: theme.palette.primary }]} />
                  <View style={[styles.swatch, { backgroundColor: theme.palette.secondary }]} />
                </View>

                <Pressable
                  onPress={() => void handleThemePress(theme.id)}
                  disabled={isPurchasing}
                  style={[styles.actionButton, isActive && styles.actionButtonActive]}
                >
                  <Text style={[styles.actionText, isActive && styles.actionTextActive]}>
                    {isActive
                      ? 'Applied'
                      : isUnlocked
                      ? 'Apply Theme'
                      : priceLabel
                      ? `Unlock ${priceLabel}`
                      : 'Unlock Theme'}
                  </Text>
                </Pressable>
              </GlassCard>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  loaderWrap: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  card: {
    gap: Spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  cardTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  cardDescription: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginTop: 4,
  },
  tag: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  previewRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.outline}66`,
  },
  actionButton: {
    backgroundColor: Colors.surfaceLow,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: `${Colors.primary}22`,
    borderColor: `${Colors.primary}88`,
  },
  actionText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  actionTextActive: {
    color: Colors.primary,
  },
});
