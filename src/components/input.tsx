import React, { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import {
  createAccessibilityProps,
  createStyleCreator,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import { ErrorText, Text } from './text';
import type { BaseComponentProps } from './types';
import { View } from './view';

/* ================================
   TYPES & INTERFACES
   ================================ */

export interface InputProps
  extends BaseComponentProps,
    Omit<TextInputProps, 'style' | 'accessibilityRole' | 'accessibilityState'> {
  /** Input label */
  label?: string;
  /** Error message to display */
  error?: string | null;
  /** Helper text to display below input */
  helperText?: string;
  /** Input size variant */
  size?: 'small' | 'medium' | 'large';
  /** Input visual variant */
  variant?: 'default' | 'outlined' | 'filled';
  /** Input state */
  state?: 'default' | 'error' | 'success' | 'disabled';
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether input is required */
  required?: boolean;
  /** Custom container style */
  containerStyle?: any;
  /** Custom input style */
  inputStyle?: any;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createInputContainerStyles = createStyleCreator<InputProps>(
  (theme, _props) => {
    const { spacing } = theme;

    return {
      marginBottom: spacing.gap.lg,
    };
  }
);

const createInputWrapperStyles = createStyleCreator<InputProps>(
  (theme, props) => {
    const {
      size = 'medium',
      variant = 'default',
      state = 'default',
      disabled = false,
    } = props;
    const { colors, spacing, components } = theme;

    // Size variants
    const sizeStyles = {
      small: {
        height: 40,
        paddingHorizontal: spacing.padding.sm,
      },
      medium: {
        height: components.input.height,
        paddingHorizontal: spacing.padding.xxl,
      },
      large: {
        height: 56,
        paddingHorizontal: spacing.padding.xxxl,
      },
    };

    // Visual variants
    const variantStyles = {
      default: {
        backgroundColor: colors.surface.input,
        borderWidth: components.input.borderWidth,
        borderColor: colors.surface.border,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.surface.border,
      },
      filled: {
        backgroundColor: colors.surface.card,
        borderWidth: 0,
      },
    };

    // State variants
    const stateStyles = {
      default: {},
      error: {
        borderColor: colors.semantic.error,
        borderWidth: 1,
      },
      success: {
        borderColor: colors.semantic.success,
        borderWidth: 1,
      },
      disabled: {
        backgroundColor: colors.surface.disabled || colors.utility.lightGray,
        borderColor: colors.surface.border,
        opacity: 0.6,
      },
    };

    return {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: components.input.borderRadius,
      justifyContent: 'center',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles[disabled ? 'disabled' : state],
    };
  }
);

const createInputTextStyles = createStyleCreator<InputProps>((theme, props) => {
  const { size = 'medium', disabled = false } = props;
  const { colors, typography } = theme;

  // Size-based typography
  const typographyVariants = {
    small: typography.caption,
    medium: typography.body,
    large: typography.h4,
  };

  return {
    flex: 1,
    color: disabled ? colors.text.muted : colors.text.primary,
    ...typographyVariants[size],
  };
});

const createLabelStyles = createStyleCreator<InputProps>((theme, _props) => {
  const { colors, spacing } = theme;

  return {
    marginBottom: spacing.gap.xs,
    color: colors.text.primary,
  };
});

const createIconStyles = createStyleCreator<InputProps>((theme, _props) => {
  const { spacing } = theme;

  return {
    marginHorizontal: spacing.padding.xs,
  };
});

const createHelperTextStyles = createStyleCreator<InputProps>(
  (theme, props) => {
    const { state = 'default' } = props;
    const { colors, spacing } = theme;

    const stateColors = {
      default: colors.text.secondary,
      error: colors.semantic.error,
      success: colors.semantic.success,
      disabled: colors.text.muted,
    };

    return {
      marginTop: spacing.gap.xs,
      color: stateColors[state],
    };
  }
);

/* ================================
   INPUT COMPONENT
   ================================ */

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'medium',
      variant = 'default',
      state = 'default',
      leftIcon,
      rightIcon,
      disabled = false,
      required = false,
      containerStyle,
      inputStyle,
      placeholderTextColor,
      testID,
      accessible = true,
      accessibilityLabel,
      accessibilityHint,
      ...textInputProps
    },
    ref
  ) => {
    // Determine actual state based on error and disabled
    const actualState = error ? 'error' : disabled ? 'disabled' : state;

    // Generate themed styles
    const containerStyles = useThemedStyles(createInputContainerStyles, {
      size,
      variant,
      state: actualState,
      disabled,
    });

    const wrapperStyles = useThemedStyles(createInputWrapperStyles, {
      size,
      variant,
      state: actualState,
      disabled,
    });

    const textStyles = useThemedStyles(createInputTextStyles, {
      size,
      disabled,
    });

    const labelStyles = useThemedStyles(createLabelStyles, {
      required,
    });

    const iconStyles = useThemedStyles(createIconStyles, {});

    const helperStyles = useThemedStyles(createHelperTextStyles, {
      state: actualState,
    });

    // Get theme for default placeholder color
    const theme = useThemedStyles((theme) => theme, {});
    const defaultPlaceholderColor =
      placeholderTextColor || theme.colors.text.placeholder;

    // Create accessibility props
    const accessibilityProps = createAccessibilityProps({
      testID,
      accessible,
      accessibilityLabel: accessibilityLabel || label,
      accessibilityHint,
    });

    // Merge styles
    const finalContainerStyle = mergeStyles(containerStyles, containerStyle);
    const finalInputStyle = mergeStyles(textStyles, inputStyle);

    return (
      <View style={finalContainerStyle}>
        {/* Label */}
        {label && (
          <Text variant="label" style={labelStyles}>
            {label}
            {required && <Text color="error"> *</Text>}
          </Text>
        )}

        {/* Input Wrapper */}
        <View
          style={wrapperStyles}
          testID={testID ? `${testID}-wrapper` : undefined}
        >
          {/* Left Icon */}
          {leftIcon && <View style={iconStyles}>{leftIcon}</View>}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={finalInputStyle}
            editable={!disabled}
            placeholderTextColor={defaultPlaceholderColor}
            {...accessibilityProps}
            {...textInputProps}
          />

          {/* Right Icon */}
          {rightIcon && <View style={iconStyles}>{rightIcon}</View>}
        </View>

        {/* Error Message */}
        {error && (
          <ErrorText variant="caption" style={helperStyles}>
            {error}
          </ErrorText>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <Text variant="caption" style={helperStyles}>
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

/* ================================
   SEMANTIC COMPONENTS
   ================================ */

export const EmailInput = forwardRef<
  TextInput,
  Omit<InputProps, 'keyboardType' | 'autoCapitalize' | 'autoComplete'>
>((props, ref) => (
  <Input
    ref={ref}
    keyboardType="email-address"
    autoCapitalize="none"
    autoComplete="email"
    {...props}
  />
));

export const PasswordInput = forwardRef<
  TextInput,
  Omit<InputProps, 'secureTextEntry' | 'autoCapitalize' | 'autoComplete'>
>((props, ref) => (
  <Input
    ref={ref}
    secureTextEntry
    autoCapitalize="none"
    autoComplete="password"
    {...props}
  />
));

export const NumberInput = forwardRef<
  TextInput,
  Omit<InputProps, 'keyboardType'>
>((props, ref) => <Input ref={ref} keyboardType="numeric" {...props} />);

export const PhoneInput = forwardRef<
  TextInput,
  Omit<InputProps, 'keyboardType' | 'autoComplete'>
>((props, ref) => (
  <Input ref={ref} keyboardType="phone-pad" autoComplete="tel" {...props} />
));

export const SearchInput = forwardRef<
  TextInput,
  Omit<InputProps, 'autoCapitalize' | 'autoCorrect'>
>((props, ref) => (
  <Input ref={ref} autoCapitalize="none" autoCorrect={false} {...props} />
));

/* ================================
   EXPORTS
   ================================ */

export default Input;
