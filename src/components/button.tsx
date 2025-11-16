/**
 * Button Component
 * A theme-aware button component with variants, sizes, and interaction states
 */

import React from 'react';
import type { PressableProps } from 'react-native';
import { ActivityIndicator, Pressable, View } from 'react-native';

import type { Theme } from '@/theme';

import {
  createPressableAccessibilityProps,
  createSizeStyles,
  mergeStyles,
  useInteractionState,
  useThemedStyles,
} from './base-component';
import { Text } from './text';
import type {
  BasePressableProps,
  ColorVariant,
  SizeVariant,
  VisualVariant,
} from './types';

/* ================================
   BUTTON COMPONENT INTERFACE
   ================================ */

interface ButtonProps extends BasePressableProps {
  /** Button text content */
  title?: string;
  /** Visual style variant */
  variant?: VisualVariant;
  /** Color variant */
  colorVariant?: ColorVariant;
  /** Size variant */
  size?: SizeVariant;
  /** Whether button takes full width */
  fullWidth?: boolean;
  /** Icon to display (JSX element) */
  icon?: React.ReactNode;
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right';
  /** Custom content (overrides title and icon) */
  children?: React.ReactNode;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createButtonStyles = (
  theme: Theme,
  props: ButtonProps & { isPressed: boolean; isFocused: boolean }
) => {
  const {
    variant = 'solid',
    colorVariant = 'primary',
    size = 'medium',
    disabled = false,
    fullWidth = false,
    isPressed,
    isFocused,
  } = props;

  // Get base size styles
  const sizeStyles = createSizeStyles(theme, size, 'button');

  // Get color variants
  const colors = theme.colors;

  // Define color schemes based on available theme colors
  const colorSchemes = {
    primary: colors.primary,
    secondary: colors.text.secondary,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    disabled: colors.button.disabled,
  };

  const buttonBorderColor = {
    disabled: colors.button.border,
  };

  const buttonColor = colorSchemes[colorVariant];

  // Base button styles
  const baseStyles = {
    ...sizeStyles,
    borderRadius: theme.components.button.borderRadius,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: fullWidth ? ('100%' as any) : undefined,
    opacity: disabled ? 0.6 : 1,
    paddingBottom: 5,
  };

  // Variant-specific styles
  const variantStyles = {
    solid: {
      backgroundColor: buttonColor,
      borderWidth: buttonBorderColor[colorVariant] ? 1 : 0,
      borderColor: buttonBorderColor[colorVariant] || 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: buttonColor,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    link: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      height: undefined,
    },
  };

  // Interaction states
  const interactionStyles = {
    pressed: variant === 'solid' ? { opacity: 0.8 } : { opacity: 0.6 },
    focused: {
      shadowColor: buttonColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
  };

  // Combine all styles
  let finalStyles = { ...baseStyles, ...variantStyles[variant] };

  if (isPressed) {
    finalStyles = { ...finalStyles, ...interactionStyles.pressed };
  }

  if (isFocused) {
    finalStyles = { ...finalStyles, ...interactionStyles.focused };
  }

  return finalStyles;
};

const createButtonTextStyles = (theme: Theme, props: ButtonProps) => {
  const {
    variant = 'solid',
    colorVariant = 'primary',
    size = 'medium',
  } = props;

  const colors = theme.colors;
  const colorSchemes = {
    primary: colors.primary,
    secondary: colors.text.secondary,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    disabled: colors.text.disabled,
  };

  const buttonColor = colorSchemes[colorVariant];

  // Text color based on variant
  const textColors = {
    solid: colors.semantic.white, // Always white text on colored button backgrounds
    outline: buttonColor,
    ghost: buttonColor,
    link: buttonColor,
  };

  // Typography variant based on size
  const typographyVariants = {
    small: 'caption' as const,
    medium: 'body' as const,
    large: 'h3' as const,
  };

  return {
    color: textColors[variant],
    ...(theme.typography[typographyVariants[size]] || theme.typography.label),
  };
};

/* ================================
   BUTTON COMPONENT
   ================================ */

export const Button = React.forwardRef<any, ButtonProps & PressableProps>(
  (
    {
      title,
      variant = 'solid',
      colorVariant = 'primary',
      size = 'medium',
      disabled = false,
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      children,
      style: userStyle,
      onPress,
      ...props
    },
    ref
  ) => {
    // Manage interaction states
    const { isPressed, isFocused, interactionProps } =
      useInteractionState(disabled);

    // Generate themed styles
    const buttonStyles = useThemedStyles(createButtonStyles, {
      variant,
      colorVariant,
      size,
      disabled,
      loading,
      fullWidth,
      isPressed,
      isFocused,
    });

    const textStyles = useThemedStyles(createButtonTextStyles, {
      variant,
      colorVariant,
      size,
    });

    // Merge with user-provided styles
    const finalStyle = mergeStyles(buttonStyles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createPressableAccessibilityProps(
      { ...props, disabled: Boolean(disabled || loading) },
      'button'
    );

    // Handle press
    const handlePress = React.useCallback(() => {
      if (!disabled && !loading && onPress) {
        onPress();
      }
    }, [disabled, loading, onPress]);

    // Render content
    const renderContent = () => {
      if (children) return children;

      const textElement = title ? (
        <Text style={textStyles} numberOfLines={1}>
          {title}
        </Text>
      ) : null;

      const iconElement = icon ? <React.Fragment>{icon}</React.Fragment> : null;

      const loadingElement = loading ? (
        <ActivityIndicator
          size="small"
          color={textStyles.color}
          style={{ marginRight: title ? 8 : 0 }}
        />
      ) : null;

      if (loading && loadingElement) {
        return (
          <React.Fragment>
            {loadingElement}
            {textElement}
          </React.Fragment>
        );
      }

      if (iconPosition === 'left') {
        return (
          <React.Fragment>
            {iconElement}
            {iconElement && textElement && <View style={{ width: 8 }} />}
            {textElement}
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          {textElement}
          {iconElement && textElement && <View style={{ width: 8 }} />}
          {iconElement}
        </React.Fragment>
      );
    };

    return (
      <Pressable
        ref={ref}
        style={finalStyle}
        onPress={handlePress}
        disabled={disabled || loading}
        {...accessibilityProps}
        {...interactionProps}
        {...props}
      >
        {renderContent()}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

/* ================================
   BUTTON VARIANT COMPONENTS
   ================================ */

/**
 * Pre-configured button variants for common use cases
 */

export const PrimaryButton = React.forwardRef<
  any,
  Omit<ButtonProps, 'colorVariant'> & PressableProps
>((props, ref) => <Button ref={ref} colorVariant="primary" {...props} />);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = React.forwardRef<
  any,
  Omit<ButtonProps, 'colorVariant'> & PressableProps
>((props, ref) => <Button ref={ref} colorVariant="secondary" {...props} />);
SecondaryButton.displayName = 'SecondaryButton';

export const OutlineButton = React.forwardRef<
  any,
  Omit<ButtonProps, 'variant'> & PressableProps
>((props, ref) => <Button ref={ref} variant="outline" {...props} />);
OutlineButton.displayName = 'OutlineButton';

export const GhostButton = React.forwardRef<
  any,
  Omit<ButtonProps, 'variant'> & PressableProps
>((props, ref) => <Button ref={ref} variant="ghost" {...props} />);
GhostButton.displayName = 'GhostButton';

export const LinkButton = React.forwardRef<
  any,
  Omit<ButtonProps, 'variant'> & PressableProps
>((props, ref) => <Button ref={ref} variant="link" {...props} />);
LinkButton.displayName = 'LinkButton';

/* ================================
   SEMANTIC BUTTON COMPONENTS
   ================================ */

/**
 * Buttons with semantic meaning
 */

export const SuccessButton = React.forwardRef<
  any,
  Omit<ButtonProps, 'colorVariant'> & PressableProps
>((props, ref) => <Button ref={ref} colorVariant="success" {...props} />);
SuccessButton.displayName = 'SuccessButton';

export const WarningButton = React.forwardRef<
  any,
  Omit<ButtonProps, 'colorVariant'> & PressableProps
>((props, ref) => <Button ref={ref} colorVariant="warning" {...props} />);
WarningButton.displayName = 'WarningButton';

export const ErrorButton = React.forwardRef<
  any,
  Omit<ButtonProps, 'colorVariant'> & PressableProps
>((props, ref) => <Button ref={ref} colorVariant="error" {...props} />);
ErrorButton.displayName = 'ErrorButton';
