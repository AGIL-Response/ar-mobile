// Unmock the theme module to test the real implementation (must be before imports)
jest.unmock('@/theme');

import { renderHook, act } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';

import {
  useTheme,
  useThemeColors,
  useThemeSelection,
  useIsDarkTheme,
} from './use-theme';
import { darkTheme, lightTheme } from './global-styles';

describe('useTheme', () => {
  const mockSetSelectedTheme = jest.fn();
  const mockUseMMKVString = useMMKVString as jest.Mock;
  const mockUseColorScheme = useColorScheme as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetSelectedTheme.mockClear();
  });

  describe('useTheme', () => {
    it('returns light theme when selected theme is light', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      expect(result.current).toEqual(lightTheme);
      expect(result.current.isDark).toBe(false);
    });

    it('returns dark theme when selected theme is dark', () => {
      mockUseMMKVString.mockReturnValue(['dark', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      expect(result.current).toEqual(darkTheme);
      expect(result.current.isDark).toBe(true);
    });

    it('returns light theme when selected theme is system and system is light', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      expect(result.current).toEqual(lightTheme);
      expect(result.current.isDark).toBe(false);
    });

    it('returns dark theme when selected theme is system and system is dark', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current).toEqual(darkTheme);
      expect(result.current.isDark).toBe(true);
    });

    it('defaults to system theme when selected theme is null', () => {
      mockUseMMKVString.mockReturnValue([null, mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      expect(result.current).toEqual(lightTheme);
      expect(result.current.isDark).toBe(false);
    });

    it('defaults to system theme when selected theme is undefined', () => {
      mockUseMMKVString.mockReturnValue([undefined, mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current).toEqual(darkTheme);
      expect(result.current.isDark).toBe(true);
    });

    it('returns dark theme when system theme is null and selected is system', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current).toEqual(darkTheme);
      expect(result.current.isDark).toBe(true);
    });

    it('returns dark theme when system theme is undefined and selected is system', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue(undefined);

      const { result } = renderHook(() => useTheme());

      expect(result.current).toEqual(darkTheme);
      expect(result.current.isDark).toBe(true);
    });

    it('updates theme when system color scheme changes', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useTheme());

      expect(result.current).toEqual(lightTheme);

      mockUseColorScheme.mockReturnValue('dark');
      rerender({});

      expect(result.current).toEqual(darkTheme);
    });

    it('updates theme when selected theme changes', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useTheme());

      expect(result.current).toEqual(lightTheme);

      mockUseMMKVString.mockReturnValue(['dark', mockSetSelectedTheme]);
      rerender({});

      expect(result.current).toEqual(darkTheme);
    });
  });

  describe('useThemeSelection', () => {
    it('returns correct values when theme is light', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeSelection());

      expect(result.current.selectedTheme).toBe('light');
      expect(result.current.effectiveTheme).toBe('light');
      expect(result.current.isSystemTheme).toBe(false);
      expect(typeof result.current.setTheme).toBe('function');
    });

    it('returns correct values when theme is dark', () => {
      mockUseMMKVString.mockReturnValue(['dark', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeSelection());

      expect(result.current.selectedTheme).toBe('dark');
      expect(result.current.effectiveTheme).toBe('dark');
      expect(result.current.isSystemTheme).toBe(false);
    });

    it('returns correct values when theme is system', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeSelection());

      expect(result.current.selectedTheme).toBe('system');
      expect(result.current.effectiveTheme).toBe('light');
      expect(result.current.isSystemTheme).toBe(true);
    });

    it('defaults to system when selected theme is null', () => {
      mockUseMMKVString.mockReturnValue([null, mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeSelection());

      expect(result.current.selectedTheme).toBe('system');
      expect(result.current.effectiveTheme).toBe('dark');
      expect(result.current.isSystemTheme).toBe(true);
    });

    it('defaults to system when selected theme is undefined', () => {
      mockUseMMKVString.mockReturnValue([undefined, mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeSelection());

      expect(result.current.selectedTheme).toBe('system');
      expect(result.current.effectiveTheme).toBe('light');
      expect(result.current.isSystemTheme).toBe(true);
    });

    it('returns dark effective theme when system is dark and selected is system', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeSelection());

      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('returns dark effective theme when system is null and selected is system', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue(null);

      const { result } = renderHook(() => useThemeSelection());

      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('setTheme calls setSelectedTheme with correct value', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeSelection());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(mockSetSelectedTheme).toHaveBeenCalledWith('dark');
    });

    it('setTheme calls setSelectedTheme with system', () => {
      mockUseMMKVString.mockReturnValue(['dark', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeSelection());

      act(() => {
        result.current.setTheme('system');
      });

      expect(mockSetSelectedTheme).toHaveBeenCalledWith('system');
    });

    it('setTheme calls setSelectedTheme with light', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeSelection());

      act(() => {
        result.current.setTheme('light');
      });

      expect(mockSetSelectedTheme).toHaveBeenCalledWith('light');
    });

    it('updates effective theme when system color scheme changes', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useThemeSelection());

      expect(result.current.effectiveTheme).toBe('light');

      mockUseColorScheme.mockReturnValue('dark');
      rerender({});

      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('updates when selected theme changes', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useThemeSelection());

      expect(result.current.selectedTheme).toBe('light');
      expect(result.current.isSystemTheme).toBe(false);

      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      rerender({});

      expect(result.current.selectedTheme).toBe('system');
      expect(result.current.isSystemTheme).toBe(true);
    });
  });

  describe('useThemeColors', () => {
    it('returns colors from light theme when light theme is active', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeColors());

      expect(result.current).toEqual(lightTheme.colors);
    });

    it('returns colors from dark theme when dark theme is active', () => {
      mockUseMMKVString.mockReturnValue(['dark', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useThemeColors());

      expect(result.current).toEqual(darkTheme.colors);
    });

    it('returns colors from system theme when system theme is active', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useThemeColors());

      expect(result.current).toEqual(darkTheme.colors);
    });

    it('updates colors when theme changes', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useThemeColors());

      expect(result.current).toEqual(lightTheme.colors);

      mockUseMMKVString.mockReturnValue(['dark', mockSetSelectedTheme]);
      rerender({});

      expect(result.current).toEqual(darkTheme.colors);
    });
  });

  describe('useIsDarkTheme', () => {
    it('returns false when light theme is active', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useIsDarkTheme());

      expect(result.current).toBe(false);
    });

    it('returns true when dark theme is active', () => {
      mockUseMMKVString.mockReturnValue(['dark', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useIsDarkTheme());

      expect(result.current).toBe(true);
    });

    it('returns false when system theme is light', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useIsDarkTheme());

      expect(result.current).toBe(false);
    });

    it('returns true when system theme is dark', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useIsDarkTheme());

      expect(result.current).toBe(true);
    });

    it('returns true when system theme is null and selected is system', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue(null);

      const { result } = renderHook(() => useIsDarkTheme());

      expect(result.current).toBe(true);
    });

    it('updates when theme changes from light to dark', () => {
      mockUseMMKVString.mockReturnValue(['light', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useIsDarkTheme());

      expect(result.current).toBe(false);

      mockUseMMKVString.mockReturnValue(['dark', mockSetSelectedTheme]);
      rerender({});

      expect(result.current).toBe(true);
    });

    it('updates when system theme changes', () => {
      mockUseMMKVString.mockReturnValue(['system', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useIsDarkTheme());

      expect(result.current).toBe(false);

      mockUseColorScheme.mockReturnValue('dark');
      rerender({});

      expect(result.current).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid theme value gracefully', () => {
      mockUseMMKVString.mockReturnValue(['invalid', mockSetSelectedTheme]);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      // Should default to light theme
      expect(result.current).toEqual(lightTheme);
    });

    it('handles all theme combinations correctly', () => {
      const combinations = [
        { selected: 'light', system: 'light', expected: lightTheme },
        { selected: 'light', system: 'dark', expected: lightTheme },
        { selected: 'dark', system: 'light', expected: darkTheme },
        { selected: 'dark', system: 'dark', expected: darkTheme },
        { selected: 'system', system: 'light', expected: lightTheme },
        { selected: 'system', system: 'dark', expected: darkTheme },
        { selected: 'system', system: null, expected: darkTheme },
        { selected: null, system: 'light', expected: lightTheme },
        { selected: null, system: 'dark', expected: darkTheme },
        { selected: undefined, system: 'light', expected: lightTheme },
        { selected: undefined, system: 'dark', expected: darkTheme },
      ];

      combinations.forEach(({ selected, system, expected }) => {
        mockUseMMKVString.mockReturnValue([selected, mockSetSelectedTheme]);
        mockUseColorScheme.mockReturnValue(system);

        const { result } = renderHook(() => useTheme());

        expect(result.current).toEqual(expected);
      });
    });
  });
});

