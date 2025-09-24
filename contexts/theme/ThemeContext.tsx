import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, Theme } from '../../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  workerColors: {
    pending: string;
    inProgress: string;
    completed: string;
    rejected: string;
  };
}

const THEME_STORAGE_KEY = '@bin2win_theme_mode';

const darkTheme: Theme = {
  colors: {
    // Primary Colors
    primary: '#3b82f6',
    secondary: '#10b981',
    danger: '#dc2626',
    warning: '#f59e0b',
    success: '#10b981',
    
    // Dark Backgrounds
    background: '#0f172a',
    backgroundDark: '#1e293b',
    card: '#1e293b',
    cardDark: '#334155',
    
    // Dark Text
    text: '#f8fafc',
    textDark: '#f8fafc',
    textSecondary: '#94a3b8',
    
    // UI Elements
    border: '#334155',
    shadow: '#000000',
    tabBar: '#1e293b',
    
    // Worker Status Colors (same)
    pending: '#f59e0b',
    inProgress: '#3b82f6',
    completed: '#10b981',
    rejected: '#dc2626'
  },
  
  typography: theme.typography,
  spacing: theme.spacing,
  borderRadius: theme.borderRadius
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemeMode();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode) {
        const mode = savedMode as ThemeMode;
        setThemeModeState(mode);
        if (mode === 'light') setIsDark(false);
        else if (mode === 'dark') setIsDark(true);
        else setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      
      if (mode === 'light') setIsDark(false);
      else if (mode === 'dark') setIsDark(true);
      else setIsDark(systemColorScheme === 'dark');
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const currentTheme = isDark ? darkTheme : theme;

  const workerColors = {
    pending: currentTheme.colors.pending,
    inProgress: currentTheme.colors.inProgress,
    completed: currentTheme.colors.completed,
    rejected: currentTheme.colors.rejected
  };

  const contextValue: ThemeContextType = {
    theme: currentTheme,
    isDark,
    themeMode,
    toggleTheme,
    setThemeMode,
    workerColors
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
