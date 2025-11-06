/**
 * UI Components Index
 * Central export point for all design system components
 */

// Base component utilities (essential functions only)
export {
  createAccessibilityProps,
  createStyleCreator,
  createTextStyles,
  mergeStyles,
  mergeTypographyStyles,
  useThemedStyles,
} from './base-component';
export * from './types';

// Core components
export * from './app-bar';
export * from './avatar';
export * from './badge';
export * from './button';
export * from './card';
export * from './checkbox';
export * from './file-upload';
export * from './incident-attachment';
export * from './floating-action-button';
export * from './withFileSource';
export * from './icon';
export * from './input';
export * from './select';
export * from './tab-bar';
export * from './text';
export * from './textarea';
export * from './view';

// Legacy components (to be migrated)
export { default as colors } from './colors';
export * from './focus-aware-status-bar';
export * from './modal';
export * from './theme-toggle';
export * from './utils';

// Re-export React Native components for convenience
export {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
export { SafeAreaView } from 'react-native-safe-area-context';

// Note: We export our custom View instead of React Native's View
// to provide theme-aware styling capabilities
