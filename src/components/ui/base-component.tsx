/**
 * Base component utilities and HOCs for consistent component patterns
 * Provides theme integration, accessibility, and common functionality
 */

import React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/theme';
import { useTheme } from '@/theme';

import type {
  BaseComponentProps,
  StyleCreator,
  ThemeAwareProps,
} from './types';

/* ================================
   THEME INTEGRATION HOOK
   ================================ */

/**
 * Hook that provides theme-aware styling for components
 * @param styleCreator Function that creates styles based on theme and props
 * @param props Component props
 */
export function useThemedStyles<TProps = any>(
  styleCreator: StyleCreator<TProps>,
  props: TProps
) {
  const theme = useTheme();

  return React.useMemo(
    () => styleCreator(theme, props),
    [theme, props, styleCreator]
  );
}

/**
 * Type-safe version of useThemedStyles with proper prop validation
 * @param styleCreator Function that creates styles based on theme and partial props
 * @param props Partial props object
 */
export function useThemedStylesSafe<
  TFullProps,
  TPartialProps extends Partial<TFullProps>,
>(
  styleCreator: (theme: Theme, props: TPartialProps) => any,
  props: TPartialProps
) {
  const theme = useTheme();
  return React.useMemo(() => styleCreator(theme, props), [theme, props]);
}

/**
 * Creates a type-safe style creator function for components
 * @param styleCreator Function that creates styles based on theme and partial props
 */
export function createStyleCreator<TProps>(
  styleCreator: (theme: Theme, props: Partial<TProps>) => any
) {
  return styleCreator;
}

/* ================================
   STYLE MERGING UTILITIES
   ================================ */

/**
 * Merges theme styles with user-provided style overrides
 * @param themeStyle Style object from theme
 * @param userStyle User-provided style override
 */
export function mergeStyles<T extends ViewStyle | TextStyle>(
  themeStyle: T,
  userStyle?: StyleProp<T>
): T {
  if (!userStyle) return themeStyle;

  if (Array.isArray(userStyle)) {
    return Object.assign({}, themeStyle, ...userStyle.filter(Boolean)) as T;
  }

  return Object.assign({}, themeStyle, userStyle) as T;
}

/**
 * Creates a style object with conditional properties
 * @param baseStyle Base style object
 * @param conditions Object with condition-style pairs
 */
export function createConditionalStyle<T extends ViewStyle | TextStyle>(
  baseStyle: T,
  conditions: Record<string, boolean | undefined>,
  styles: Record<string, Partial<T>>
): T {
  let result = { ...baseStyle };

  Object.entries(conditions).forEach(([key, condition]) => {
    if (condition && styles[key]) {
      result = Object.assign(result, styles[key]);
    }
  });

  return result;
}

/**
 * Safely merges typography styles with custom overrides
 * Handles fontWeight conflicts properly
 * @param typographyStyle Base typography style from theme
 * @param overrides Custom style overrides
 */
export function mergeTypographyStyles(
  typographyStyle: TextStyle,
  overrides?: Partial<TextStyle>
): TextStyle {
  if (!overrides) return typographyStyle;

  // Create a clean merge without fontWeight conflicts
  const { fontWeight: _themeWeight, ...themeRest } = typographyStyle;
  const { fontWeight: overrideWeight, ...overrideRest } = overrides;

  return {
    ...themeRest,
    ...overrideRest,
    // Override fontWeight takes precedence, fallback to theme
    fontWeight: overrideWeight || _themeWeight,
  };
}

/* ================================
   ACCESSIBILITY HELPERS
   ================================ */

/**
 * Creates standard accessibility props from base component props
 * @param props Base component props
 */
export function createAccessibilityProps(props: BaseComponentProps) {
  return {
    testID: props.testID,
    accessibilityLabel: props.accessibilityLabel,
    accessible: !!(props.accessibilityLabel || props.testID),
  };
}

/**
 * Creates accessibility props for pressable components
 * @param props Component props
 * @param role Accessibility role
 */
export function createPressableAccessibilityProps(
  props: BaseComponentProps & { disabled?: boolean },
  role: 'button' | 'link' | 'tab' = 'button'
) {
  return {
    ...createAccessibilityProps(props),
    accessibilityRole: role,
    accessibilityState: {
      disabled: props.disabled,
    },
  };
}

/* ================================
   COMPONENT FACTORY UTILITIES
   ================================ */

/**
 * Creates a themed component factory function
 * @param defaultStyleCreator Default style creator for the component
 */
export function createThemedComponentFactory<TProps extends BaseComponentProps>(
  defaultStyleCreator: StyleCreator<TProps>
) {
  return function createThemedComponent<TComponentProps extends TProps>(
    Component: React.ComponentType<TComponentProps>,
    customStyleCreator?: StyleCreator<TComponentProps>
  ) {
    return React.forwardRef<any, TComponentProps>((props, ref) => {
      const styleCreator = customStyleCreator || defaultStyleCreator;
      const styles = useThemedStyles(styleCreator, props);

      return <Component ref={ref} {...props} style={styles} />;
    });
  };
}

/* ================================
   VARIANT SYSTEM UTILITIES
   ================================ */

/**
 * Creates a variant resolver for components
 * @param variants Object mapping variant names to style creators
 * @param defaultVariant Default variant to use
 */
export function createVariantResolver<TProps>(
  variants: Record<string, StyleCreator<TProps>>,
  defaultVariant: string
) {
  return (variant: string = defaultVariant, theme: Theme, props: TProps) => {
    const styleCreator = variants[variant] || variants[defaultVariant];
    return styleCreator(theme, props);
  };
}

/**
 * Creates size-based styles using theme sizing tokens
 * @param theme Theme object
 * @param size Size variant
 * @param component Component type for getting appropriate tokens
 */
export function createSizeStyles(
  theme: Theme,
  size: 'small' | 'medium' | 'large' = 'medium',
  component: keyof Theme['components']
) {
  const componentTokens = theme.components[component];

  // Handle different component token structures
  if (component === 'button') {
    const buttonTokens = componentTokens as any;
    return {
      height: buttonTokens.height[size],
      paddingHorizontal: buttonTokens.padding.horizontal,
      paddingVertical: buttonTokens.padding.vertical,
    };
  }

  // Default fallback for other components
  return {
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
  };
}

/* ================================
   INTERACTION STATE UTILITIES
   ================================ */

/**
 * Hook for managing component interaction states
 * @param disabled Whether the component is disabled
 */
export function useInteractionState(disabled = false) {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const handlePressIn = React.useCallback(() => {
    if (!disabled) setIsPressed(true);
  }, [disabled]);

  const handlePressOut = React.useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleFocus = React.useCallback(() => {
    if (!disabled) setIsFocused(true);
  }, [disabled]);

  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
  }, []);

  return {
    isPressed,
    isFocused,
    interactionProps: {
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}

/* ================================
   COMPONENT WRAPPER HOC
   ================================ */

/**
 * Higher-order component that adds theme awareness to any component
 * @param Component Component to wrap
 * @param styleCreator Style creator function
 */
export function withTheme<TProps extends ThemeAwareProps<any>>(
  Component: React.ComponentType<TProps>,
  styleCreator?: StyleCreator<TProps>
) {
  const WrappedComponent = React.forwardRef<any, Omit<TProps, 'theme'>>(
    (props, ref) => {
      const theme = useTheme();

      // Always call useThemedStyles, but with a no-op creator if none provided
      const styles = useThemedStyles(styleCreator || (() => ({})), props);

      return (
        <Component
          ref={ref}
          {...(props as TProps)}
          theme={theme}
          style={styleCreator ? styles : undefined}
        />
      );
    }
  );

  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/* ================================
   COMMON STYLE CREATORS
   ================================ */

/**
 * Creates standard container styles
 */
export const createContainerStyles = (theme: Theme, props: any) => ({
  backgroundColor: props.backgroundColor || 'transparent',
  padding: props.padding ? (theme.spacing.padding as any)[props.padding] : 0,
  margin: props.margin ? (theme.spacing.margin as any)[props.margin] : 0,
  width: props.fullWidth ? '100%' : undefined,
});

/**
 * Creates standard text styles
 */
export const createTextStyles = (theme: Theme, props: any) => ({
  ...(theme.typography as any)[props.variant || 'body'],
  color: props.color || theme.colors.text.primary,
  textAlign: props.centered ? ('center' as const) : undefined,
});

/**
 * Creates standard border styles
 */
export const createBorderStyles = (theme: Theme, props: any) => ({
  borderRadius: props.rounded ? theme.borderRadius.md : 0,
  borderWidth: props.bordered ? 1 : 0,
  borderColor: props.borderColor || theme.colors.text.secondary,
});
