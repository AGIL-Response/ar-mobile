/**
 * Theme hook that works without Nativewind
 * Uses the existing theme infrastructure but returns our design system theme
 */

import { useColorScheme } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';

import { storage } from '@/lib/storage';

import type { ColorSchemeType, Theme } from './global-styles';
import { darkTheme, lightTheme } from './global-styles';

const SELECTED_THEME = 'SELECTED_THEME';

/**
 * Hook to get the current theme based on user selection and system preference
 * Returns the complete theme object with colors, spacing, typography, etc.
 */
export const useTheme = (): Theme => {
  const systemColorScheme = useColorScheme();
  const [selectedTheme] = useMMKVString(SELECTED_THEME, storage);

  const effectiveTheme = getEffectiveTheme(
    (selectedTheme as ColorSchemeType) ?? 'system',
    systemColorScheme
  );

  // return effectiveTheme === 'dark' ? darkTheme : lightTheme;
  return darkTheme;
};

/**
 * Hook to manage theme selection (light/dark/system)
 * This is for theme settings/preferences
 */
export const useThemeSelection = () => {
  const [selectedTheme, setSelectedTheme] = useMMKVString(
    SELECTED_THEME,
    storage
  );
  const systemColorScheme = useColorScheme();

  const currentSelection = (selectedTheme as ColorSchemeType) ?? 'system';
  const effectiveTheme = getEffectiveTheme(currentSelection, systemColorScheme);

  const setTheme = (theme: ColorSchemeType) => {
    setSelectedTheme(theme);
  };

  return {
    selectedTheme: currentSelection,
    effectiveTheme,
    setTheme,
    isSystemTheme: currentSelection === 'system',
  } as const;
};

/**
 * Utility function to determine the effective theme
 */
const getEffectiveTheme = (
  selectedTheme: ColorSchemeType,
  systemTheme: 'light' | 'dark' | null | undefined
): 'light' | 'dark' => {
  if (selectedTheme === 'system') {
    return systemTheme === 'light' ? 'light' : 'dark';
  }
  return selectedTheme;
};

/**
 * Get theme colors specifically (most common use case)
 */
export const useThemeColors = () => {
  const theme = useTheme();
  return theme.colors;
};

/**
 * Check if current theme is dark
 */
export const useIsDarkTheme = () => {
  const theme = useTheme();
  return theme.isDark;
};
