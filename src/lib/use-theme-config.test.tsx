/* eslint-disable import/first */
// Unmock use-theme-config to test the actual implementation
jest.mock('@/lib/use-theme-config', () => {
  return jest.requireActual('@/lib/use-theme-config');
});

import { renderHook } from '@testing-library/react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { useThemeConfig } from './use-theme-config';

// Mock react-native useColorScheme
const mockReactNative = require('react-native');
const mockUseColorScheme = mockReactNative.useColorScheme as jest.Mock;


describe('useThemeConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dark Theme', () => {
    it('returns DarkTheme when colorScheme is dark', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current).toBeDefined();
      expect(result.current.colors.primary).toBe('#FFA766');
      expect(result.current.colors.background).toBe('#121212');
      expect(result.current.colors.text).toBe('#E5E5E5');
      expect(result.current.colors.border).toBe('#7D7D7D');
      expect(result.current.colors.card).toBe('#2E2E2E');
    });

    it('includes all DarkTheme colors from base theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      // Check that base DarkTheme colors are included
      expect(result.current.colors).toHaveProperty('notification');
      expect(result.current.colors).toHaveProperty('primary');
      expect(result.current.colors).toHaveProperty('background');
      expect(result.current.colors).toHaveProperty('text');
      expect(result.current.colors).toHaveProperty('border');
      expect(result.current.colors).toHaveProperty('card');
    });

    it('overrides DarkTheme colors correctly', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      // Verify custom colors override base theme
      expect(result.current.colors.primary).toBe('#FFA766');
      expect(result.current.colors.primary).not.toBe(DarkTheme.colors.primary);
      expect(result.current.colors.background).toBe('#121212');
      expect(result.current.colors.text).toBe('#E5E5E5');
      expect(result.current.colors.border).toBe('#7D7D7D');
      expect(result.current.colors.card).toBe('#2E2E2E');
    });
  });

  describe('Light Theme', () => {
    it('returns LightTheme when colorScheme is light', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current).toBeDefined();
      expect(result.current.colors.primary).toBe('#FF8933');
      expect(result.current.colors.background).toBe('#ffffff');
    });

    it('returns LightTheme when colorScheme is null', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current).toBeDefined();
      expect(result.current.colors.primary).toBe('#FF8933');
      expect(result.current.colors.background).toBe('#ffffff');
    });

    it('returns LightTheme when colorScheme is undefined', () => {
      mockUseColorScheme.mockReturnValue(undefined);

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current).toBeDefined();
      expect(result.current.colors.primary).toBe('#FF8933');
      expect(result.current.colors.background).toBe('#ffffff');
    });

    it('includes all LightTheme colors from base theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeConfig());

      // Check that base DefaultTheme colors are included
      expect(result.current.colors).toHaveProperty('notification');
      expect(result.current.colors).toHaveProperty('primary');
      expect(result.current.colors).toHaveProperty('background');
      expect(result.current.colors).toHaveProperty('text');
      expect(result.current.colors).toHaveProperty('border');
      expect(result.current.colors).toHaveProperty('card');
    });

    it('overrides LightTheme colors correctly', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeConfig());

      // Verify custom colors override base theme
      expect(result.current.colors.primary).toBe('#FF8933');
      expect(result.current.colors.primary).not.toBe(DefaultTheme.colors.primary);
      expect(result.current.colors.background).toBe('#ffffff');
    });

    it('preserves DefaultTheme colors that are not overridden', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeConfig());

      // Colors not overridden should come from DefaultTheme
      expect(result.current.colors.text).toBe(DefaultTheme.colors.text);
      expect(result.current.colors.border).toBe(DefaultTheme.colors.border);
      expect(result.current.colors.card).toBe(DefaultTheme.colors.card);
      expect(result.current.colors.notification).toBe(DefaultTheme.colors.notification);
    });
  });

  describe('Theme Switching', () => {
    it('switches from light to dark theme when colorScheme changes', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useThemeConfig());

      expect(result.current.colors.primary).toBe('#FF8933');
      expect(result.current.colors.background).toBe('#ffffff');

      mockUseColorScheme.mockReturnValue('dark');
      rerender({});

      expect(result.current.colors.primary).toBe('#FFA766');
      expect(result.current.colors.background).toBe('#121212');
    });

    it('switches from dark to light theme when colorScheme changes', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result, rerender } = renderHook(() => useThemeConfig());

      expect(result.current.colors.primary).toBe('#FFA766');
      expect(result.current.colors.background).toBe('#121212');

      mockUseColorScheme.mockReturnValue('light');
      rerender({});

      expect(result.current.colors.primary).toBe('#FF8933');
      expect(result.current.colors.background).toBe('#ffffff');
    });

    it('switches from dark to null colorScheme (defaults to light)', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result, rerender } = renderHook(() => useThemeConfig());

      expect(result.current.colors.primary).toBe('#FFA766');

      mockUseColorScheme.mockReturnValue(null);
      rerender({});

      expect(result.current.colors.primary).toBe('#FF8933');
    });
  });

  describe('Theme Structure', () => {
    it('returns theme object with correct structure', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current).toHaveProperty('colors');
      expect(typeof result.current.colors).toBe('object');
      expect(result.current.colors).toHaveProperty('primary');
      expect(result.current.colors).toHaveProperty('background');
      expect(result.current.colors).toHaveProperty('text');
      expect(result.current.colors).toHaveProperty('border');
      expect(result.current.colors).toHaveProperty('card');
      expect(result.current.colors).toHaveProperty('notification');
    });

    it('dark theme has all required color properties', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      const colors = result.current.colors;
      expect(colors.primary).toBeDefined();
      expect(colors.background).toBeDefined();
      expect(colors.text).toBeDefined();
      expect(colors.border).toBeDefined();
      expect(colors.card).toBeDefined();
      expect(colors.notification).toBeDefined();
    });

    it('light theme has all required color properties', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeConfig());

      const colors = result.current.colors;
      expect(colors.primary).toBeDefined();
      expect(colors.background).toBeDefined();
      expect(colors.text).toBeDefined();
      expect(colors.border).toBeDefined();
      expect(colors.card).toBeDefined();
      expect(colors.notification).toBeDefined();
    });
  });

  describe('Color Values', () => {
    it('dark theme uses correct primary color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current.colors.primary).toBe('#FFA766');
    });

    it('light theme uses correct primary color', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current.colors.primary).toBe('#FF8933');
    });

    it('dark theme uses correct background color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current.colors.background).toBe('#121212');
    });

    it('light theme uses correct background color', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current.colors.background).toBe('#ffffff');
    });

    it('dark theme uses correct text color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current.colors.text).toBe('#E5E5E5');
    });

    it('dark theme uses correct border color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current.colors.border).toBe('#7D7D7D');
    });

    it('dark theme uses correct card color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeConfig());

      expect(result.current.colors.card).toBe('#2E2E2E');
    });
  });
});

