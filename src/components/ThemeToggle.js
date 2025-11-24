import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ color = "#fff", size = 24, style }) => {
  const { isDark, setThemeMode } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <Ionicons name={isDark ? "sunny" : "moon"} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ThemeToggle;
