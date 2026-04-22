import { create } from 'zustand';
import {
  fetchRemoteConfig,
  getExperimentVariant,
  isFeatureEnabled,
  RemoteConfigPayload,
  trackAbTestExposure,
} from '../services/remoteConfigService';
import { User } from '../models/user';

interface RemoteConfigState {
  config: RemoteConfigPayload;
  loading: boolean;
  lastFetchedAt: number | null;
  exposedExperiments: Record<string, string>;
  refreshConfig: (force?: boolean) => Promise<void>;
  isEnabled: (featureKey: string, user: User | null) => boolean;
  getVariant: (testKey: string, user: User | null) => Promise<string | null>;
}

const DEFAULT_CONFIG: RemoteConfigPayload = {
  featureFlags: {},
  experiments: {},
};

const TTL_MS = 5 * 60 * 1000;

export const useRemoteConfigStore = create<RemoteConfigState>((set, get) => ({
  config: DEFAULT_CONFIG,
  loading: false,
  lastFetchedAt: null,
  exposedExperiments: {},

  refreshConfig: async (force = false) => {
    const { loading, lastFetchedAt } = get();
    if (loading) return;
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt < TTL_MS) return;

    set({ loading: true });
    try {
      const config = await fetchRemoteConfig();
      set({ config, lastFetchedAt: Date.now(), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  isEnabled: (featureKey, user) => isFeatureEnabled(featureKey, user, get().config),

  getVariant: async (testKey, user) => {
    const state = get();
    if (!user) return null;

    const already = state.exposedExperiments[testKey];
    if (already) return already;

    const variant = getExperimentVariant(testKey, user, state.config);
    if (!variant) return null;

    set((prev) => ({
      exposedExperiments: {
        ...prev.exposedExperiments,
        [testKey]: variant,
      },
    }));
    await trackAbTestExposure(user.id, testKey, variant, { source: 'client_auto_assignment' });
    return variant;
  },
}));
