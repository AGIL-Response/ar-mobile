/* eslint-disable import/first */
// Override the mock from jest-setup.ts to use actual implementation
jest.mock('@/lib/fonts', () => {
  return jest.requireActual('@/lib/fonts');
});

import { renderHook } from '@testing-library/react-native';
import { useFonts } from 'expo-font';

import { useAppFonts, FontFamilies } from './fonts';
/* eslint-enable import/first */

describe('fonts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAppFonts hook', () => {
    it('calls useFonts with correct font map', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      renderHook(() => useAppFonts());

      expect(useFonts).toHaveBeenCalledWith({
        // Manrope family (primary)
        Manrope_400Regular: 'Manrope_400Regular',
        Manrope_500Medium: 'Manrope_500Medium',
        Manrope_600SemiBold: 'Manrope_600SemiBold',
        Manrope_700Bold: 'Manrope_700Bold',

        // RussoOne (accent/branding)
        RussoOne_400Regular: 'RussoOne_400Regular',

        // Additional fonts for Figma screens
        Roboto_500Medium: 'Roboto_500Medium',
        Inter_700Bold: 'Inter_700Bold',

        // Goldman (accent/branding)
        Goldman_400Regular: 'Goldman_400Regular',
        Goldman_700Bold: 'Goldman_700Bold',

        // KdamThmorPro (accent/branding)
        KdamThmorPro_400Regular: 'KdamThmorPro_400Regular',
      });
    });

    it('returns fontsLoaded when fonts are loaded', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      const { result } = renderHook(() => useAppFonts());

      expect(result.current).toBe(true);
    });

    it('returns fontsLoaded when fonts are not loaded', () => {
      (useFonts as jest.Mock).mockReturnValue([false]);
      
      const { result } = renderHook(() => useAppFonts());

      expect(result.current).toBe(false);
    });

    it('includes all Manrope font variants', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      renderHook(() => useAppFonts());

      const fontMap = (useFonts as jest.Mock).mock.calls[0][0];
      expect(fontMap.Manrope_400Regular).toBe('Manrope_400Regular');
      expect(fontMap.Manrope_500Medium).toBe('Manrope_500Medium');
      expect(fontMap.Manrope_600SemiBold).toBe('Manrope_600SemiBold');
      expect(fontMap.Manrope_700Bold).toBe('Manrope_700Bold');
    });

    it('includes RussoOne font', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      renderHook(() => useAppFonts());

      const fontMap = (useFonts as jest.Mock).mock.calls[0][0];
      expect(fontMap.RussoOne_400Regular).toBe('RussoOne_400Regular');
    });

    it('includes Roboto and Inter fonts', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      renderHook(() => useAppFonts());

      const fontMap = (useFonts as jest.Mock).mock.calls[0][0];
      expect(fontMap.Roboto_500Medium).toBe('Roboto_500Medium');
      expect(fontMap.Inter_700Bold).toBe('Inter_700Bold');
    });

    it('includes Goldman fonts', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      renderHook(() => useAppFonts());

      const fontMap = (useFonts as jest.Mock).mock.calls[0][0];
      expect(fontMap.Goldman_400Regular).toBe('Goldman_400Regular');
      expect(fontMap.Goldman_700Bold).toBe('Goldman_700Bold');
    });

    it('includes KdamThmorPro font', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      renderHook(() => useAppFonts());

      const fontMap = (useFonts as jest.Mock).mock.calls[0][0];
      expect(fontMap.KdamThmorPro_400Regular).toBe('KdamThmorPro_400Regular');
    });

    it('includes exactly 10 fonts', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      renderHook(() => useAppFonts());

      const fontMap = (useFonts as jest.Mock).mock.calls[0][0];
      expect(Object.keys(fontMap)).toHaveLength(10);
    });
  });

  describe('FontFamilies constant', () => {
    it('exports FontFamilies object', () => {
      expect(FontFamilies).toBeDefined();
      expect(typeof FontFamilies).toBe('object');
    });

    it('includes Manrope font families', () => {
      expect(FontFamilies.manropeRegular).toBe('Manrope_400Regular');
      expect(FontFamilies.manropeMedium).toBe('Manrope_500Medium');
      expect(FontFamilies.manropeSemiBold).toBe('Manrope_600SemiBold');
      expect(FontFamilies.manropeBold).toBe('Manrope_700Bold');
    });

    it('includes RussoOne font family', () => {
      expect(FontFamilies.russoOneRegular).toBe('RussoOne_400Regular');
    });

    it('includes Roboto and Inter font families', () => {
      expect(FontFamilies.robotoMedium).toBe('Roboto_500Medium');
      expect(FontFamilies.interBold).toBe('Inter_700Bold');
    });

    it('includes system font fallback', () => {
      expect(FontFamilies.sFProText).toBe('SF Pro Text');
    });

    it('includes Goldman font families', () => {
      expect(FontFamilies.goldmanRegular).toBe('Goldman_400Regular');
      expect(FontFamilies.goldmanBold).toBe('Goldman_700Bold');
    });

    it('includes KdamThmorPro font family', () => {
      expect(FontFamilies.kdamThmorProRegular).toBe('KdamThmorPro_400Regular');
    });

    it('has all expected font family keys', () => {
      const expectedKeys = [
        'manropeRegular',
        'manropeMedium',
        'manropeSemiBold',
        'manropeBold',
        'russoOneRegular',
        'robotoMedium',
        'interBold',
        'sFProText',
        'goldmanRegular',
        'goldmanBold',
        'kdamThmorProRegular',
      ];

      expect(Object.keys(FontFamilies)).toEqual(expect.arrayContaining(expectedKeys));
      expect(Object.keys(FontFamilies)).toHaveLength(expectedKeys.length);
    });

    it('has correct font family values', () => {
      expect(FontFamilies.manropeRegular).toBe('Manrope_400Regular');
      expect(FontFamilies.manropeMedium).toBe('Manrope_500Medium');
      expect(FontFamilies.manropeSemiBold).toBe('Manrope_600SemiBold');
      expect(FontFamilies.manropeBold).toBe('Manrope_700Bold');
      expect(FontFamilies.russoOneRegular).toBe('RussoOne_400Regular');
      expect(FontFamilies.robotoMedium).toBe('Roboto_500Medium');
      expect(FontFamilies.interBold).toBe('Inter_700Bold');
      expect(FontFamilies.sFProText).toBe('SF Pro Text');
      expect(FontFamilies.goldmanRegular).toBe('Goldman_400Regular');
      expect(FontFamilies.goldmanBold).toBe('Goldman_700Bold');
      expect(FontFamilies.kdamThmorProRegular).toBe('KdamThmorPro_400Regular');
    });
  });

  describe('Integration', () => {
    it('FontFamilies values match useAppFonts font map keys', () => {
      (useFonts as jest.Mock).mockReturnValue([true]);
      
      renderHook(() => useAppFonts());

      const fontMap = (useFonts as jest.Mock).mock.calls[0][0];
      
      // Check that FontFamilies values match the keys used in useAppFonts
      expect(fontMap.Manrope_400Regular).toBe(FontFamilies.manropeRegular);
      expect(fontMap.Manrope_500Medium).toBe(FontFamilies.manropeMedium);
      expect(fontMap.Manrope_600SemiBold).toBe(FontFamilies.manropeSemiBold);
      expect(fontMap.Manrope_700Bold).toBe(FontFamilies.manropeBold);
      expect(fontMap.RussoOne_400Regular).toBe(FontFamilies.russoOneRegular);
      expect(fontMap.Roboto_500Medium).toBe(FontFamilies.robotoMedium);
      expect(fontMap.Inter_700Bold).toBe(FontFamilies.interBold);
      expect(fontMap.Goldman_400Regular).toBe(FontFamilies.goldmanRegular);
      expect(fontMap.Goldman_700Bold).toBe(FontFamilies.goldmanBold);
      expect(fontMap.KdamThmorPro_400Regular).toBe(FontFamilies.kdamThmorProRegular);
    });
  });
});

