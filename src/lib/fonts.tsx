/**
 * Font Loading Setup
 * Loads Manrope font family using Expo Google Fonts
 */

import {
  Goldman_400Regular,
  Goldman_700Bold,
} from '@expo-google-fonts/goldman';
import { Inter_700Bold } from '@expo-google-fonts/inter';
import { KdamThmorPro_400Regular } from '@expo-google-fonts/kdam-thmor-pro';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { Roboto_500Medium } from '@expo-google-fonts/roboto';
import { RussoOne_400Regular } from '@expo-google-fonts/russo-one';
import { useFonts } from 'expo-font';

/**
 * Hook to load Manrope fonts
 * Returns fontsLoaded boolean
 */
export function useAppFonts() {
  const [fontsLoaded] = useFonts({
    // Manrope family (primary)
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,

    // RussoOne (accent/branding)
    RussoOne_400Regular,

    // Additional fonts for Figma screens
    Roboto_500Medium,
    Inter_700Bold,

    // Goldman (accent/branding)
    Goldman_400Regular,
    Goldman_700Bold,

    // KdamThmorPro (accent/branding)
    KdamThmorPro_400Regular,
  });

  return fontsLoaded;
}

/**
 * Font family constants that match the loaded Google Fonts
 */
export const FontFamilies = {
  // Manrope family (primary)
  manropeRegular: 'Manrope_400Regular',
  manropeMedium: 'Manrope_500Medium',
  manropeSemiBold: 'Manrope_600SemiBold',
  manropeBold: 'Manrope_700Bold',

  // RussoOne (accent/branding)
  russoOneRegular: 'RussoOne_400Regular',

  // Additional fonts for Figma screens
  robotoMedium: 'Roboto_500Medium',
  interBold: 'Inter_700Bold',

  // System fonts (fallbacks)
  sFProText: 'SF Pro Text', // iOS system font

  // Goldman (accent/branding)
  goldmanRegular: 'Goldman_400Regular',
  goldmanBold: 'Goldman_700Bold',

  // KdamThmorPro (accent/branding)
  kdamThmorProRegular: 'KdamThmorPro_400Regular',
} as const;
