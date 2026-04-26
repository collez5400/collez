export const Colors = {
  background: '#161309',
  surface: '#161309',
  surfaceDim: '#161309',
  surfaceContainerLowest: '#110e05',
  surfaceContainerLow: '#1f1b10',
  surfaceContainer: '#231f14',
  surfaceContainerHigh: '#2e2a1e',
  surfaceContainerHighest: '#393428',
  surfaceVariant: '#393428',
  surfaceBright: '#3d392c',
  surfaceLow: '#1f1b10',
  surfaceHigh: '#2e2a1e',
  primary: '#fff3d6',
  primaryContainer: '#ffd400',
  primaryFixed: '#ffe177',
  primaryFixedDim: '#ebc300',
  primaryVariant: '#ffd400',
  onPrimary: '#3b2f00',
  onPrimaryContainer: '#705c00',
  secondary: '#d1bcff',
  secondaryContainer: '#6b03f1',
  secondaryFixed: '#eaddff',
  secondaryFixedDim: '#d1bcff',
  onSecondary: '#3d0090',
  onSecondaryContainer: '#d7c4ff',
  accentGold: '#ffd400',
  accentCoral: '#ffb4ab',
  accentTeal: '#6b03f1',
  success: '#ebc300',
  warning: '#ffe177',
  error: '#FFB4AB',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',
  onSurface: '#eae2cf',
  onSurfaceVariant: '#d0c6ab',
  outline: '#999077',
  outlineVariant: '#4d4632',
  transparent: 'transparent',
};

export const Gradients = {
  cardWarm: ['#F5C54233', '#D0BCFF24'] as const,
  cardCool: ['#2DD4BF2E', '#B4C5FF1F'] as const,
  headerAccent: ['#B4C5FF', '#2DD4BF'] as const,
};

export const Typography = {
  fontFamily: {
    display: 'Space Grotesk',
    heading: 'Space Grotesk',
    button: 'Space Grotesk',
    body: 'Plus Jakarta Sans',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    display: 48,
    displayHero: 72,
    headlineLg: 40,
    headlineMd: 24,
    buttonLabel: 16,
    bodyLg: 18,
    bodyMd: 16,
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Layout = {
  glassOpacity: 0.8,
  glassBlur: 24,
};

export const Shadows = {
  hardShadowSm: '2px 2px 0px 0px #110e05',
  hardShadow: '4px 4px 0px 0px #110e05',
  hardShadowLg: '8px 8px 0px 0px #110e05',
  hardShadowYellow: '6px 6px 0px 0px #ffd400',
  hardShadowPurple: '6px 6px 0px 0px #6b03f1',
  neonYellow: '0 0 20px rgba(255, 212, 0, 0.4)',
  neonPurple: '0 0 20px rgba(107, 3, 241, 0.3)',
  glossRim: 'inset 0px 2px 0px 0px rgba(255,255,255,0.4)',
  card: {
    shadowColor: '#110e05',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  glass: {
    shadowColor: '#110e05',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  glowPrimary: {
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 0,
  },
};

export const Borders = {
  comicBorder: {
    borderWidth: 3,
    borderColor: '#111111',
  },
  comicBorderLg: {
    borderWidth: 4,
    borderColor: '#111111',
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
