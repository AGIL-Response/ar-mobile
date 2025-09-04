import React, { forwardRef } from 'react';
import {
  Pressable,
  type PressableProps,
  type View as RNView,
} from 'react-native';

import {
  createAccessibilityProps,
  createStyleCreator,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import { Check, Minus } from './icons';
import { ErrorText, Text } from './text';
import type { BaseComponentProps } from './types';
import { View } from './view';

/* ================================
   TYPES & INTERFACES
   ================================ */

export interface CheckboxProps
  extends BaseComponentProps,
    Omit<PressableProps, 'style' | 'accessibilityRole' | 'accessibilityState'> {
  /** Checkbox label */
  label?: string;
  /** Checkbox description */
  description?: string;
  /** Error message to display */
  error?: string | null;
  /** Helper text to display below checkbox */
  helperText?: string;
  /** Checkbox size variant */
  size?: 'small' | 'medium' | 'large';
  /** Checkbox visual variant */
  variant?: 'default' | 'outlined' | 'filled';
  /** Checkbox state */
  state?: 'default' | 'error' | 'success' | 'disabled';
  /** Whether checkbox is checked */
  checked?: boolean;
  /** Whether checkbox is in indeterminate state */
  indeterminate?: boolean;
  /** Whether checkbox is disabled */
  disabled?: boolean;
  /** Whether checkbox is required */
  required?: boolean;
  /** Callback when checkbox state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Position of the label relative to checkbox */
  labelPosition?: 'left' | 'right';
  /** Custom container style */
  containerStyle?: any;
  /** Custom checkbox style */
  checkboxStyle?: any;
  /** Custom label style */
  labelStyle?: any;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createCheckboxContainerStyles = createStyleCreator<CheckboxProps>(
  (theme, props) => {
    const { labelPosition = 'right' } = props;
    const { spacing } = theme;

    return {
      flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.gap.lg,
    };
  }
);

const createCheckboxBoxStyles = createStyleCreator<CheckboxProps>(
  (theme, props) => {
    const {
      size = 'medium',
      variant = 'default',
      state = 'default',
      checked = false,
      indeterminate = false,
      disabled = false,
    } = props;
    const { colors, borderRadius } = theme;

    // Size variants
    const sizeStyles = {
      small: {
        width: 16,
        height: 16,
      },
      medium: {
        width: 20,
        height: 20,
      },
      large: {
        width: 24,
        height: 24,
      },
    };

    // Base styles
    const baseStyles = {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.xs,
      borderWidth: 2,
    };

    // Visual variants for unchecked state
    const variantStyles = {
      default: {
        backgroundColor: 'transparent',
        borderColor: colors.surface.border,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: colors.surface.border,
      },
      filled: {
        backgroundColor: colors.surface.input,
        borderColor: colors.surface.border,
      },
    };

    // Checked/indeterminate state overrides
    const checkedStyles =
      checked || indeterminate
        ? {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          }
        : {};

    // State variants
    const stateStyles = {
      default: {},
      error: {
        borderColor: colors.semantic.error,
        ...(checked || indeterminate
          ? { backgroundColor: colors.semantic.error }
          : {}),
      },
      success: {
        borderColor: colors.semantic.success,
        ...(checked || indeterminate
          ? { backgroundColor: colors.semantic.success }
          : {}),
      },
      disabled: {
        opacity: 0.6,
        borderColor: colors.surface.border,
        ...(checked || indeterminate
          ? { backgroundColor: colors.utility.mediumGray }
          : {}),
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...checkedStyles,
      ...stateStyles[disabled ? 'disabled' : state],
    };
  }
);

const createCheckboxIconStyles = createStyleCreator<CheckboxProps>(
  (theme, props) => {
    const { disabled = false } = props;
    const { colors } = theme;

    return {
      color: disabled ? colors.text.muted : colors.semantic.white,
    };
  }
);

const createCheckboxContentStyles = createStyleCreator<CheckboxProps>(
  (theme, props) => {
    const { labelPosition = 'right', size = 'medium' } = props;
    const { spacing } = theme;

    const marginMap = {
      small: spacing.gap.xs,
      medium: spacing.gap.sm,
      large: spacing.gap.md,
    };

    return {
      flex: 1,
      marginLeft: labelPosition === 'right' ? marginMap[size] : 0,
      marginRight: labelPosition === 'left' ? marginMap[size] : 0,
    };
  }
);

const createCheckboxLabelStyles = createStyleCreator<CheckboxProps>(
  (theme, props) => {
    const { size = 'medium', disabled = false } = props;
    const { colors, typography } = theme;

    const typographyVariants = {
      small: typography.caption,
      medium: typography.body,
      large: typography.h4,
    };

    return {
      color: disabled ? colors.text.muted : colors.text.primary,
      ...typographyVariants[size],
    };
  }
);

const createCheckboxDescriptionStyles = createStyleCreator<CheckboxProps>(
  (theme, props) => {
    const { disabled = false } = props;
    const { colors, typography, spacing } = theme;

    return {
      ...typography.caption,
      color: disabled ? colors.text.muted : colors.text.secondary,
      marginTop: spacing.gap.xs,
    };
  }
);

const createHelperTextStyles = createStyleCreator<CheckboxProps>(
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
   CHECKBOX COMPONENT
   ================================ */

export const Checkbox = forwardRef<RNView, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      helperText,
      size = 'medium',
      variant = 'default',
      state = 'default',
      checked = false,
      indeterminate = false,
      disabled = false,
      required = false,
      onCheckedChange,
      labelPosition = 'right',
      containerStyle,
      checkboxStyle,
      labelStyle,
      testID,
      accessible = true,
      accessibilityLabel,
      accessibilityHint,
      onPress,
      ...pressableProps
    },
    ref
  ) => {
    // Determine actual state based on error and disabled
    const actualState = error ? 'error' : disabled ? 'disabled' : state;

    // Generate themed styles
    const containerStyles = useThemedStyles(createCheckboxContainerStyles, {
      labelPosition,
    });

    const boxStyles = useThemedStyles(createCheckboxBoxStyles, {
      size,
      variant,
      state: actualState,
      checked,
      indeterminate,
      disabled,
    });

    const iconStyles = useThemedStyles(createCheckboxIconStyles, {
      size,
      disabled,
    });

    const contentStyles = useThemedStyles(createCheckboxContentStyles, {
      labelPosition,
      size,
    });

    const labelStyles = useThemedStyles(createCheckboxLabelStyles, {
      size,
      disabled,
    });

    const descriptionStyles = useThemedStyles(createCheckboxDescriptionStyles, {
      disabled,
    });

    const helperStyles = useThemedStyles(createHelperTextStyles, {
      state: actualState,
    });

    // Create accessibility props
    const accessibilityProps = createAccessibilityProps({
      testID,
      accessible,
      accessibilityLabel: accessibilityLabel || label,
      accessibilityHint,
      accessibilityRole: 'checkbox',
      accessibilityState: {
        checked: indeterminate ? 'mixed' : checked,
        disabled,
      },
    });

    // Handle press
    const handlePress = (event: any) => {
      if (!disabled) {
        onCheckedChange?.(!checked);
        onPress?.(event);
      }
    };

    // Determine which icon to show
    const renderIcon = () => {
      const iconSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;

      if (indeterminate) {
        return <Minus width={iconSize} height={iconSize} style={iconStyles} />;
      }

      if (checked) {
        return <Check width={iconSize} height={iconSize} style={iconStyles} />;
      }

      return null;
    };

    // Merge styles
    const finalContainerStyle = mergeStyles(containerStyles, containerStyle);
    const finalCheckboxStyle = mergeStyles(boxStyles, checkboxStyle);
    const finalLabelStyle = mergeStyles(labelStyles, labelStyle);

    return (
      <View style={finalContainerStyle} ref={ref}>
        <Pressable
          style={[finalContainerStyle, { marginBottom: 0 }]}
          onPress={handlePress}
          disabled={disabled}
          {...accessibilityProps}
          {...pressableProps}
        >
          {/* Checkbox Box */}
          <View style={finalCheckboxStyle}>{renderIcon()}</View>

          {/* Label and Description */}
          {(label || description) && (
            <View style={contentStyles}>
              {label && (
                <Text style={finalLabelStyle}>
                  {label}
                  {required && <Text color="error"> *</Text>}
                </Text>
              )}
              {description && (
                <Text style={descriptionStyles}>{description}</Text>
              )}
            </View>
          )}
        </Pressable>

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

Checkbox.displayName = 'Checkbox';

/* ================================
   CHECKBOX GROUP COMPONENT
   ================================ */

export interface CheckboxGroupProps extends BaseComponentProps {
  /** Group label */
  label?: string;
  /** Error message to display */
  error?: string | null;
  /** Helper text to display below group */
  helperText?: string;
  /** Array of checkbox options */
  options: {
    label: string;
    value: string;
    description?: string;
    disabled?: boolean;
  }[];
  /** Currently selected values */
  value?: string[];
  /** Callback when selection changes */
  onValueChange?: (values: string[]) => void;
  /** Whether group is disabled */
  disabled?: boolean;
  /** Whether group is required */
  required?: boolean;
  /** Checkbox size for all items */
  size?: 'small' | 'medium' | 'large';
  /** Custom container style */
  containerStyle?: any;
}

export const CheckboxGroup = forwardRef<RNView, CheckboxGroupProps>(
  (
    {
      label,
      error,
      helperText,
      options = [],
      value = [],
      onValueChange,
      disabled = false,
      required = false,
      size = 'medium',
      containerStyle,
      ...props
    },
    ref
  ) => {
    const handleOptionChange = (optionValue: string, checked: boolean) => {
      if (checked) {
        onValueChange?.([...value, optionValue]);
      } else {
        onValueChange?.(value.filter((v) => v !== optionValue));
      }
    };

    return (
      <View style={containerStyle} ref={ref} {...props}>
        {/* Group Label */}
        {label && (
          <Text variant="label" style={{ marginBottom: 12 }}>
            {label}
            {required && <Text color="error"> *</Text>}
          </Text>
        )}

        {/* Checkbox Options */}
        {options.map((option, index) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            disabled={disabled || option.disabled}
            size={size}
            onCheckedChange={(checked) =>
              handleOptionChange(option.value, checked)
            }
            containerStyle={
              index === options.length - 1 ? { marginBottom: 0 } : undefined
            }
          />
        ))}

        {/* Error Message */}
        {error && (
          <ErrorText variant="caption" style={{ marginTop: 8 }}>
            {error}
          </ErrorText>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <Text
            variant="caption"
            style={{ marginTop: 8, color: 'textSecondary' }}
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';

/* ================================
   SEMANTIC COMPONENTS
   ================================ */

export const AgreementCheckbox = forwardRef<
  RNView,
  Omit<CheckboxProps, 'required'>
>((props, ref) => (
  <Checkbox ref={ref} required={true} size="small" {...props} />
));

export const FeatureToggle = forwardRef<RNView, Omit<CheckboxProps, 'variant'>>(
  (props, ref) => <Checkbox ref={ref} variant="filled" {...props} />
);

export const BulkActionCheckbox = forwardRef<
  RNView,
  Omit<CheckboxProps, 'size' | 'labelPosition'>
>((props, ref) => (
  <Checkbox ref={ref} size="small" labelPosition="left" {...props} />
));

/* ================================
   EXPORTS
   ================================ */

export default Checkbox;
