export const Colors = {
  background: '#0B1326',
  surface: '#1A233A',
  surfaceLow: '#141C2E',
  surfaceHigh: '#26324D',
  primary: '#B4C5FF',
  primaryVariant: '#D0BCFF',
  accentGold: '#F5C542',
  accentCoral: '#FF6B6B',
  accentTeal: '#2DD4BF',
  secondary: '#86EAD4',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#FFB4AB',
  onSurface: '#DAE2FD',
  onSurfaceVariant: '#C3C6D7',
  outline: '#8D90A0',
  transparent: 'transparent',
};

export const Gradients = {
  cardWarm: ['#F5C54233', '#D0BCFF24'] as const,
  cardCool: ['#2DD4BF2E', '#B4C5FF1F'] as const,
  headerAccent: ['#B4C5FF', '#2DD4BF'] as const,
};

export const Typography = {
  fontFamily: {
    heading: 'SpaceGrotesk',
    body: 'Manrope',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    display: 48,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,  // default
  lg: 32,  // large
  xl: 48,  // XL
  full: 9999,
};

export const Layout = {
  glassOpacity: 0.8,
  glassBlur: 24,
};

export const Shadows = {
  glass: {
    shadowColor: '#DAE2FD',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.06,
    shadowRadius: 50,
    elevation: 5,
  },
  glowPrimary: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },
};

export const AnimConfig = {
  timingFast: { duration: 140 },
  timingMedium: { duration: 220 },
  springSoft: {
    damping: 14,
    stiffness: 170,
    mass: 0.9,
  },
};
