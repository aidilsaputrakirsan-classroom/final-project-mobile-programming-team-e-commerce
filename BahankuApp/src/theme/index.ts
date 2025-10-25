export const theme = {
  colors: {
    primary: '#10b981', // emerald-500
    primaryDark: '#059669', // emerald-600
    secondary: '#f59e0b', // amber-500
    background: '#ffffff',
    backgroundDark: '#1f2937', // gray-800
    surface: '#f9fafb', // gray-50
    surfaceDark: '#374151', // gray-700
    text: '#111827', // gray-900
    textDark: '#f9fafb', // gray-50
    textSecondary: '#6b7280', // gray-500
    border: '#e5e7eb', // gray-200
    borderDark: '#4b5563', // gray-600
    error: '#ef4444', // red-500
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    info: '#3b82f6', // blue-500
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export type Theme = typeof theme;
