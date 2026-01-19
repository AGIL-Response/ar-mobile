import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from './use-safe-area-insets';

const useRNSafeAreaInsets = require('react-native-safe-area-context').useSafeAreaInsets;

describe('useSafeAreaInsets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Android', () => {
    beforeEach(() => {
      Platform.OS = 'android';
    });

    it('returns bottomInset equal to bottom on Android', () => {
      const mockInsets = {
        top: 44,
        right: 0,
        bottom: 34,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current).toEqual({
        top: 44,
        right: 0,
        bottom: 34,
        left: 0,
        bottomInset: 34, // Same as bottom on Android
      });
    });

    it('returns bottomInset of 0 when bottom is 0 on Android', () => {
      const mockInsets = {
        top: 24,
        right: 0,
        bottom: 0,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current.bottomInset).toBe(0);
    });

    it('handles large bottom inset on Android', () => {
      const mockInsets = {
        top: 48,
        right: 0,
        bottom: 48,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current.bottomInset).toBe(48);
    });

    it('handles all insets on Android', () => {
      const mockInsets = {
        top: 44,
        right: 20,
        bottom: 34,
        left: 20,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current).toEqual({
        top: 44,
        right: 20,
        bottom: 34,
        left: 20,
        bottomInset: 34,
      });
    });
  });

  describe('iOS', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('returns bottomInset of 0 on iOS regardless of bottom value', () => {
      const mockInsets = {
        top: 44,
        right: 0,
        bottom: 34,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current).toEqual({
        top: 44,
        right: 0,
        bottom: 34,
        left: 0,
        bottomInset: 0, // Always 0 on iOS
      });
    });

    it('returns bottomInset of 0 when bottom is 0 on iOS', () => {
      const mockInsets = {
        top: 20,
        right: 0,
        bottom: 0,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current.bottomInset).toBe(0);
    });

    it('handles notched iPhone insets on iOS', () => {
      const mockInsets = {
        top: 47,
        right: 0,
        bottom: 34,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current).toEqual({
        top: 47,
        right: 0,
        bottom: 34,
        left: 0,
        bottomInset: 0, // iOS doesn't need manual bottom inset
      });
    });

    it('handles all insets on iOS', () => {
      const mockInsets = {
        top: 47,
        right: 0,
        bottom: 34,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current).toEqual({
        top: 47,
        right: 0,
        bottom: 34,
        left: 0,
        bottomInset: 0,
      });
    });
  });

  describe('Platform comparison', () => {
    it('returns different bottomInset values for same insets on different platforms', () => {
      const mockInsets = {
        top: 44,
        right: 0,
        bottom: 34,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);

      // Test Android
      Platform.OS = 'android';
      const { result: androidResult } = renderHook(() => useSafeAreaInsets());
      expect(androidResult.current.bottomInset).toBe(34);

      // Test iOS
      Platform.OS = 'ios';
      const { result: iosResult } = renderHook(() => useSafeAreaInsets());
      expect(iosResult.current.bottomInset).toBe(0);
    });
  });

  describe('Type safety', () => {
    it('returns all required properties with correct types', () => {
      const mockInsets = {
        top: 44,
        right: 0,
        bottom: 34,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);
      Platform.OS = 'android';

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(typeof result.current.top).toBe('number');
      expect(typeof result.current.right).toBe('number');
      expect(typeof result.current.bottom).toBe('number');
      expect(typeof result.current.left).toBe('number');
      expect(typeof result.current.bottomInset).toBe('number');
    });

    it('has all properties defined', () => {
      const mockInsets = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);
      Platform.OS = 'android';

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current).toHaveProperty('top');
      expect(result.current).toHaveProperty('right');
      expect(result.current).toHaveProperty('bottom');
      expect(result.current).toHaveProperty('left');
      expect(result.current).toHaveProperty('bottomInset');
    });
  });

  describe('Edge cases', () => {
    it('handles zero insets', () => {
      const mockInsets = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);
      Platform.OS = 'android';

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        bottomInset: 0,
      });
    });

    it('handles negative values gracefully', () => {
      const mockInsets = {
        top: 44,
        right: 0,
        bottom: -5, // Should not happen in practice but test defensive handling
        left: 0,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);
      Platform.OS = 'android';

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current.bottomInset).toBe(-5);
      expect(result.current.bottom).toBe(-5);
    });

    it('handles very large inset values', () => {
      const mockInsets = {
        top: 100,
        right: 50,
        bottom: 100,
        left: 50,
      };

      useRNSafeAreaInsets.mockReturnValue(mockInsets);
      Platform.OS = 'android';

      const { result } = renderHook(() => useSafeAreaInsets());

      expect(result.current).toEqual({
        top: 100,
        right: 50,
        bottom: 100,
        left: 50,
        bottomInset: 100,
      });
    });
  });
});



