import { Colors } from './theme';

export type ThemeId = 'default' | 'midnight_gold' | 'neon_pulse' | 'sunset_scholar';

export type ThemePalette = {
  background: string;
  surface: string;
  surfaceLow: string;
  surfaceHigh: string;
  primary: string;
  primaryVariant: string;
  secondary: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
};

export type PremiumTheme = {
  id: ThemeId;
  name: string;
  description: string;
  isPremium: boolean;
  productId?: string;
  palette: ThemePalette;
};

export const PREMIUM_THEME_PRODUCT_IDS = {
  midnightGold: 'collez.theme.midnight_gold',
  neonPulse: 'collez.theme.neon_pulse',
  sunsetScholar: 'collez.theme.sunset_scholar',
} as const;

export const PREMIUM_THEMES: PremiumTheme[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic COLLEZ look.',
    isPremium: false,
    palette: {
      background: Colors.background,
      surface: Colors.surface,
      surfaceLow: Colors.surfaceLow,
      surfaceHigh: Colors.surfaceHigh,
      primary: Colors.primary,
      primaryVariant: Colors.primaryVariant,
      secondary: Colors.secondary,
      onSurface: Colors.onSurface,
      onSurfaceVariant: Colors.onSurfaceVariant,
      outline: Colors.outline,
    },
  },
  {
    id: 'midnight_gold',
    name: 'Midnight Gold',
    description: 'Dark luxury with warm highlights.',
    isPremium: true,
    productId: PREMIUM_THEME_PRODUCT_IDS.midnightGold,
    palette: {
      background: '#0A0A12',
      surface: '#171726',
      surfaceLow: '#121221',
      surfaceHigh: '#23233A',
      primary: '#FFD166',
      primaryVariant: '#FFC233',
      secondary: '#F4B183',
      onSurface: '#FFF6DE',
      onSurfaceVariant: '#E5D9BF',
      outline: '#9F9171',
    },
  },
  {
    id: 'neon_pulse',
    name: 'Neon Pulse',
    description: 'Cyber glow with sharp contrast.',
    isPremium: true,
    productId: PREMIUM_THEME_PRODUCT_IDS.neonPulse,
    palette: {
      background: '#090A14',
      surface: '#13172A',
      surfaceLow: '#0E1222',
      surfaceHigh: '#1E2641',
      primary: '#7CFBFF',
      primaryVariant: '#8EFFA8',
      secondary: '#A18AFF',
      onSurface: '#E4F7FF',
      onSurfaceVariant: '#B8CADB',
      outline: '#6A7B92',
    },
  },
  {
    id: 'sunset_scholar',
    name: 'Sunset Scholar',
    description: 'Calm twilight tones for focused sessions.',
    isPremium: true,
    productId: PREMIUM_THEME_PRODUCT_IDS.sunsetScholar,
    palette: {
      background: '#1A1025',
      surface: '#291735',
      surfaceLow: '#20122E',
      surfaceHigh: '#3A224B',
      primary: '#FFAF87',
      primaryVariant: '#F48CCB',
      secondary: '#C6B3FF',
      onSurface: '#FEEAFD',
      onSurfaceVariant: '#D8C1DF',
      outline: '#9E7CAB',
    },
  },
];

export function getThemeById(id: ThemeId): PremiumTheme {
  return PREMIUM_THEMES.find((theme) => theme.id === id) ?? PREMIUM_THEMES[0];
}
