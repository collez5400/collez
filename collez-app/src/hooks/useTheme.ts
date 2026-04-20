import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '../config/theme';

export const useTheme = () => {
  return {
    colors: Colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    layout: Layout,
    shadows: Shadows,
  };
};
