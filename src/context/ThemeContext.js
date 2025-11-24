import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { getTheme } from '../theme/themeUtils';
import { colors } from '../theme/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [accentColor, setAccentColor] = useState(colors.primary.main);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      const savedAccent = await AsyncStorage.getItem('accentColor');
      
      if (savedMode) setThemeMode(savedMode);
      if (savedAccent) setAccentColor(savedAccent);
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateThemeMode = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const updateAccentColor = async (color) => {
    try {
      setAccentColor(color);
      await AsyncStorage.setItem('accentColor', color);
    } catch (error) {
      console.error('Failed to save accent color:', error);
    }
  };

  // Determine actual mode to render
  const activeMode = themeMode === 'system' ? systemScheme : themeMode;
  
  // Generate the theme object
  const theme = getTheme(activeMode, accentColor);

  return (
    <ThemeContext.Provider value={{
      theme,
      themeMode,
      accentColor,
      setThemeMode: updateThemeMode,
      setAccentColor: updateAccentColor,
      isDark: activeMode === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
