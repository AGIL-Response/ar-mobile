import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useIsDarkTheme, useThemeColors, useThemeSelection } from '@/theme';

import { Text } from './text';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  showLabel = false,
  style,
}) => {
  const colors = useThemeColors();
  const isDark = useIsDarkTheme();
  const { setTheme } = useThemeSelection();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const iconSize = {
    small: 20,
    medium: 24,
    large: 28,
  }[size];

  const styles = StyleSheet.create({
    container: {
      flexDirection: showLabel ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      width: iconSize + 12,
      height: iconSize + 12,
      borderRadius: (iconSize + 12) / 2,
      backgroundColor: colors.surface.card,
      borderWidth: 1,
      borderColor: colors.surface.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.semantic.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    icon: {
      fontSize: iconSize,
      color: colors.text.primary,
    },
    label: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: showLabel ? 0 : 4,
      marginLeft: showLabel ? 8 : 0,
    },
  });

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      accessibilityHint="Toggles between light and dark theme"
    >
      <Pressable style={styles.button} onPress={toggleTheme}>
        <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
      </Pressable>
      {showLabel && (
        <Text style={styles.label}>{isDark ? 'Light' : 'Dark'}</Text>
      )}
    </Pressable>
  );
};
