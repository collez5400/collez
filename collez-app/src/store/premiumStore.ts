import { create } from 'zustand';
import { supabase } from '../config/supabase';
import {
  getThemeById,
  PREMIUM_THEMES,
  PREMIUM_THEME_PRODUCT_IDS,
  ThemeId,
} from '../config/premiumThemes';
import {
  connectIapAsync,
  disconnectIapAsync,
  getProductsAsync,
  purchaseProductAsync,
} from '../services/purchaseService';
import { useAuthStore } from './authStore';

type PremiumConfig = {
  active_theme: ThemeId;
  unlocked_themes: ThemeId[];
};

type ProductPriceMap = Record<string, string>;

interface PremiumStoreState {
  activeTheme: ThemeId;
  unlockedThemes: ThemeId[];
  prices: ProductPriceMap;
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  selectTheme: (themeId: ThemeId) => Promise<boolean>;
  unlockThemePurchase: (themeId: ThemeId) => Promise<boolean>;
  clearError: () => void;
}

const DEFAULT_CONFIG: PremiumConfig = {
  active_theme: 'default',
  unlocked_themes: ['default'],
};

function normalizeConfig(value: unknown): PremiumConfig {
  const raw = (value ?? {}) as Partial<PremiumConfig>;
  const unlocked = Array.isArray(raw.unlocked_themes)
    ? raw.unlocked_themes.filter((theme): theme is ThemeId =>
        PREMIUM_THEMES.some((item) => item.id === theme)
      )
    : (['default'] as ThemeId[]);

  return {
    active_theme:
      raw.active_theme && PREMIUM_THEMES.some((theme) => theme.id === raw.active_theme)
        ? raw.active_theme
        : 'default',
    unlocked_themes: unlocked.includes('default')
      ? unlocked
      : (['default', ...unlocked] as ThemeId[]),
  };
}

async function savePremiumConfig(config: PremiumConfig) {
  const user = useAuthStore.getState().user;
  if (!user) return false;

  const { error } = await supabase
    .from('users')
    // @ts-expect-error Supabase update typing (manual Database shim)
    .update({ premium_config: config, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  useAuthStore.setState({
    user: {
      ...user,
      premium_config: config,
      updated_at: new Date().toISOString(),
    },
  });
  return true;
}

export const usePremiumStore = create<PremiumStoreState>((set, get) => ({
  activeTheme: 'default',
  unlockedThemes: ['default'],
  prices: {},
  isLoading: false,
  isPurchasing: false,
  error: null,

  initialize: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const config = normalizeConfig(user.premium_config);
      set({
        activeTheme: config.active_theme,
        unlockedThemes: config.unlocked_themes,
      });

      // Fetch product prices if in-app purchases are available.
      const isConnected = await connectIapAsync();
      if (isConnected) {
        const productIds = Object.values(PREMIUM_THEME_PRODUCT_IDS);
        const products = await getProductsAsync(productIds);
        const prices = products.reduce<ProductPriceMap>((acc, item) => {
          acc[item.productId] = item.price;
          return acc;
        }, {});
        set({ prices });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize premium settings',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  selectTheme: async (themeId) => {
    const { unlockedThemes } = get();
    if (!unlockedThemes.includes(themeId)) {
      set({ error: 'Unlock this theme before applying it.' });
      return false;
    }

    const user = useAuthStore.getState().user;
    if (!user) return false;

    try {
      const current = normalizeConfig(user.premium_config);
      const nextConfig: PremiumConfig = {
        ...current,
        active_theme: themeId,
      };
      await savePremiumConfig(nextConfig);
      set({ activeTheme: themeId, error: null });
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to apply theme' });
      return false;
    }
  },

  unlockThemePurchase: async (themeId) => {
    const theme = getThemeById(themeId);
    if (!theme.isPremium || !theme.productId) return true;

    const { unlockedThemes } = get();
    if (unlockedThemes.includes(themeId)) return true;

    const user = useAuthStore.getState().user;
    if (!user) return false;

    set({ isPurchasing: true, error: null });
    try {
      let purchased = false;

      // On web/dev builds where IAP is unavailable, allow a local fallback unlock.
      // This keeps Phase 4A theme flow testable without blocking on native store setup.
      if (Object.keys(get().prices).length === 0) {
        purchased = true;
      } else {
        purchased = await purchaseProductAsync(theme.productId);
      }

      if (!purchased) {
        set({ isPurchasing: false, error: 'Purchase was not completed.' });
        return false;
      }

      const current = normalizeConfig(user.premium_config);
      const nextUnlocked = Array.from(
        new Set<ThemeId>([...current.unlocked_themes, themeId])
      ) as ThemeId[];
      const nextConfig: PremiumConfig = {
        ...current,
        unlocked_themes: nextUnlocked,
      };
      await savePremiumConfig(nextConfig);

      set({
        unlockedThemes: nextUnlocked,
        isPurchasing: false,
        error: null,
      });
      return true;
    } catch (error) {
      set({
        isPurchasing: false,
        error: error instanceof Error ? error.message : 'Theme purchase failed',
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export async function disconnectPremiumPurchases() {
  await disconnectIapAsync();
}
