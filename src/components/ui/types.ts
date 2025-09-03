/**
 * Base component types and interfaces for the design system
 * Provides consistent typing patterns for all UI components
 */

import type { PressableProps, TextProps, ViewProps } from 'react-native';

import type { Theme } from '@/theme';

/* ================================
   BASE COMPONENT INTERFACES
   ================================ */

/**
 * Base props that all themed components should extend
 */
export interface BaseComponentProps {
  /** Optional test ID for testing */
  testID?: string;
  /** Optional accessibility label */
  accessibilityLabel?: string;
}

/**
 * Props for components that support theme variants
 */
export interface ThemedComponentProps extends BaseComponentProps {
  /** Theme variant to apply */
  variant?: string;
  /** Size variant to apply */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether the component is in a loading state */
  loading?: boolean;
}

/* ================================
   COMPONENT-SPECIFIC INTERFACES
   ================================ */

/**
 * Base props for text-based components
 */
export interface BaseTextProps extends TextProps, BaseComponentProps {
  /** Typography variant to apply */
  variant?: keyof Theme['typography'];
  /** Text color override */
  color?: string;
  /** Whether text should be centered */
  centered?: boolean;
}

/**
 * Base props for pressable components
 */
export interface BasePressableProps
  extends Omit<PressableProps, 'disabled'>,
    ThemedComponentProps,
    DisableableProps {
  /** Press handler */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
}

/**
 * Base props for container components
 */
export interface BaseContainerProps extends ViewProps, BaseComponentProps {
  /** Padding variant to apply */
  padding?: keyof Theme['spacing']['padding'];
  /** Margin variant to apply */
  margin?: keyof Theme['spacing']['margin'];
  /** Background color override */
  backgroundColor?: string;
  /** Whether to apply full width */
  fullWidth?: boolean;
}

/**
 * Props for input components
 */
export interface BaseInputProps extends BaseComponentProps, DisableableProps {
  /** Input label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Whether the input is required */
  required?: boolean;
}

/* ================================
   STYLE CREATION HELPERS
   ================================ */

/**
 * Function signature for creating themed styles
 */
export type StyleCreator<TProps = any> = (theme: Theme, props: TProps) => any;

/**
 * Common style properties that can be overridden
 */
export interface StyleOverrides {
  /** Container style overrides */
  containerStyle?: any;
  /** Text style overrides */
  textStyle?: any;
  /** Content style overrides */
  contentStyle?: any;
}

/* ================================
   VARIANT DEFINITIONS
   ================================ */

/**
 * Standard size variants used across components
 */
export type SizeVariant = 'small' | 'medium' | 'large';

/**
 * Standard color variants used across components
 */
export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Standard visual variants used across components
 */
export type VisualVariant = 'solid' | 'outline' | 'ghost' | 'link';

/* ================================
   UTILITY TYPES
   ================================ */

/**
 * Extract theme-aware props from a component props interface
 */
export type ThemeAwareProps<T> = T & {
  theme?: Theme;
};

/**
 * Make certain props optional for component variants
 */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Props for components that support custom styling
 */
export interface CustomizableProps extends StyleOverrides {
  /** Custom class name (for legacy support) */
  className?: string;
}

/* ================================
   COMPONENT STATE TYPES
   ================================ */

/**
 * Standard interaction states for components
 */
export type InteractionState =
  | 'default'
  | 'hover'
  | 'pressed'
  | 'focused'
  | 'disabled';

/**
 * Standard loading states for components
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Validation state for form components
 */
export type ValidationState = 'default' | 'valid' | 'invalid' | 'warning';
