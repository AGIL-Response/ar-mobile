/**
 * Custom hook for safe area insets
 * Handles Android navigation bar overlap by providing platform-specific bottom inset
 */

import { Platform } from 'react-native';
import { useSafeAreaInsets as useRNSafeAreaInsets } from 'react-native-safe-area-context';

export interface UseSafeAreaInsetsReturn {
  top: number;
  right: number;
  bottom: number;
  left: number;
  bottomInset: number; // Platform-specific bottom inset (Android only)
}

/**
 * Hook that provides safe area insets with Android-specific bottom inset calculation
 * On Android, the bottom inset accounts for the navigation bar
 * On iOS, the bottom inset is 0 (handled by the system)
 */
export function useSafeAreaInsets(): UseSafeAreaInsetsReturn {
  const insets = useRNSafeAreaInsets();

  // On Android, use the bottom inset to account for navigation bar
  // On iOS, the system handles this automatically, so we use 0
  const bottomInset = Platform.OS === 'android' ? insets.bottom : 0;

  return {
    top: insets.top,
    right: insets.right,
    bottom: insets.bottom,
    left: insets.left,
    bottomInset,
  };
}
