export interface ThemePalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
  DEFAULT: string;
}

export interface AdminTheme {
  colors: {
    primary: ThemePalette;
    semantic: { success: string; warning: string; error: string; info: string };
  };
  charts: {
    /** Палитра для категорий/сегментов в графиках Recharts (8 цветов цикла) */
    category: readonly string[];
    /** Цвет линии/области главного метрика (Recharts) */
    primary: string;
    /** Цвет осей и неактивных подписей */
    axisTick: string;
  };
}

export const theme: AdminTheme = {
  colors: {
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
      DEFAULT: '#10b981',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  charts: {
    category: [
      '#10b981',
      '#3b82f6',
      '#8b5cf6',
      '#f59e0b',
      '#ef4444',
      '#06b6d4',
      '#ec4899',
      '#84cc16',
    ],
    primary: '#10b981',
    axisTick: '#9ca3af',
  },
};
