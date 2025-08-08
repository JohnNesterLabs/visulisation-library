import { ChartTheme } from '../types';

export const defaultThemes = {
  light: {
    background: '#ffffff',
    text: '#333333',
    grid: '#e0e0e0',
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    accent: '#45b7d1',
    border: '#cccccc',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    grid: '#333333',
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    accent: '#45b7d1',
    border: '#444444',
    shadow: 'rgba(255, 255, 255, 0.1)'
  }
};

export function createTheme(theme: Partial<ChartTheme>): ChartTheme {
  return {
    ...defaultThemes.light,
    ...theme
  };
}

export function getTheme(theme: ChartTheme | string): ChartTheme {
  if (typeof theme === 'string') {
    return defaultThemes[theme as keyof typeof defaultThemes] || defaultThemes.light;
  }
  return theme;
}
