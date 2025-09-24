export const theme = {
  colors: {
    // Primary Colors
    primary: '#3b82f6',
    secondary: '#10b981',
    danger: '#dc2626',
    warning: '#f59e0b',
    success: '#10b981',
    
    // Backgrounds
    background: '#ffffff',
    backgroundDark: '#1f2937',
    card: '#f9fafb',
    cardDark: '#374151',
    surface: '#ffffff', // Added surface color
    
    // Text
    text: '#1f2937',
    textDark: '#f9fafb',
    textSecondary: '#6b7280',
    
    // UI Elements
    border: '#e5e7eb',
    shadow: '#000000',
    tabBar: '#ffffff',
    
    // Worker Status Colors
    pending: '#f59e0b',
    inProgress: '#3b82f6',
    completed: '#10b981',
    rejected: '#dc2626'
  },
  
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  }
};

export type Theme = typeof theme;
