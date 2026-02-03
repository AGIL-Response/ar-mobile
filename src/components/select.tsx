import React, { forwardRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  type View as RNView,
} from 'react-native';

import {
  createAccessibilityProps,
  createStyleCreator,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import { ErrorText, Text } from './text';
import type { BaseComponentProps } from './types';
import { View } from './view';
import { Icon, iconNames } from './icon';
/* ================================
   TYPES & INTERFACES
   ================================ */

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  /** Select label */
  label?: string;
  /** Placeholder text when no option is selected */
  placeholder?: string;
  /** Array of options */
  options: SelectOption[];
  /** Currently selected value */
  value?: string | number;
  /** Callback when selection changes */
  onValueChange?: (value: string | number) => void;
  /** Error message to display */
  error?: string | null;
  /** Helper text to display below select */
  helperText?: string;
  /** Select size variant */
  size?: 'small' | 'medium' | 'large';
  /** Select visual variant */
  variant?: 'default' | 'outlined' | 'filled';
  /** Select state */
  state?: 'default' | 'error' | 'success' | 'disabled';
  /** Whether select is disabled */
  disabled?: boolean;
  /** Whether select is required */
  required?: boolean;
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Custom container style */
  containerStyle?: any;
  /** Custom trigger style */
  triggerStyle?: any;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createSelectContainerStyles = createStyleCreator<SelectProps>(
  (theme, _props) => {
    const { spacing } = theme;

    return {
      marginBottom: spacing.gap.lg,
    };
  }
);

const createSelectTriggerStyles = createStyleCreator<SelectProps>(
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
        height: 32,
        paddingHorizontal: spacing.padding.lg,
      },
      medium: {
        height: components.input.height,
        paddingHorizontal: components.input.padding.horizontal,
      },
      large: {
        height: 56,
        paddingHorizontal: spacing.padding.lg,
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
        borderWidth: 2,
        borderColor: colors.surface.border,
      },
      filled: {
        backgroundColor: colors.background.primary,
        borderWidth: 2,
        borderColor: colors.surface.muted,
      },
    };

    // State variants
    const stateStyles = {
      default: {},
      error: {
        borderColor: colors.semantic.error,
        borderWidth: 2,
      },
      success: {
        borderColor: colors.semantic.success,
        borderWidth: 2,
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
      justifyContent: 'space-between',
      borderRadius: components.input.borderRadius,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles[disabled ? 'disabled' : state],
    };
  }
);

const createSelectTextStyles = createStyleCreator<SelectProps>(
  (theme, props) => {
    const { size = 'medium', disabled = false, variant = 'default' } = props;
    const { colors, typography } = theme;

    // Size-based typography
    const typographyVariants = {
      small: typography.caption,
      medium: typography.body,
      large: typography.h4,
    };

    const sizeLineHeights = {
      small: 30, // Match container height
      medium: 48, // Match container height
      large: 56, // Match container height
    };

    // For filled variant, use primary text color to match dark background
    const textColor = variant === 'filled' 
      ? (disabled ? colors.text.muted : colors.text.primary)
      : (disabled ? colors.text.muted : colors.text.secondary);

    return {
      color: textColor,
      ...typographyVariants[size],
      lineHeight: sizeLineHeights[size],
      textAlignVertical: 'center', // Android-specific
    };
  }
);

const createPlaceholderStyles = createStyleCreator<SelectProps>(
  (theme, props) => {
    const { size = 'medium', variant = 'default' } = props;
    const { colors, typography } = theme;

    const typographyVariants = {
      small: typography.caption,
      medium: typography.body,
      large: typography.h4,
    };

    const sizeLineHeights = {
      small: 30, // Match container height
      medium: 48, // Match container height
      large: 56, // Match container height
    };

    // For filled variant, use muted text color to match dark background
    const placeholderColor = variant === 'filled' 
      ? colors.text.muted 
      : colors.text.placeholder;

    return {
      color: placeholderColor,
      ...typographyVariants[size],
      lineHeight: sizeLineHeights[size],
      textAlignVertical: 'center', // Android-specific
    };
  }
);

const createModalStyles = createStyleCreator<SelectProps>((theme, _props) => {
  return {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  };
});

const createDropdownStyles = createStyleCreator<SelectProps>(
  (theme, _props) => {
    const { colors } = theme;

    return {
      backgroundColor: colors.background.primary,
      borderRadius: 4,
      maxHeight: 300,
      width: '100%',
      borderWidth: 2,
      borderColor: colors.surface.muted,
      shadowColor: colors.semantic.black,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    };
  }
);

const createTextContainerStyles = createStyleCreator<SelectProps>(
  (theme, props) => {
    return {
      flex: 1,
      justifyContent: 'center',
    };
  }
);

const createOptionStyles = createStyleCreator<{
  selected?: boolean;
  disabled?: boolean;
}>((theme, props) => {
  const { selected = false, disabled = false } = props;
  const { colors, spacing } = theme;

  return {
    paddingHorizontal: spacing.padding.lg,
    paddingVertical: spacing.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.divider,
    backgroundColor: selected ? colors.primary : 'transparent',
    opacity: disabled ? 0.5 : 1,
  };
});

const createOptionTextStyles = createStyleCreator<{
  selected?: boolean;
  disabled?: boolean;
}>((theme, props) => {
  const { selected = false, disabled = false } = props;
  const { colors, typography } = theme;

  return {
    ...typography.body,
    color: selected
      ? colors.semantic.white
      : disabled
        ? colors.text.muted
        : colors.text.primary,
  };
});

const createLabelStyles = createStyleCreator<SelectProps>((theme, _props) => {
  const { spacing } = theme;

  return {
    marginBottom: spacing.gap.xs,
  };
});

const createHelperTextStyles = createStyleCreator<SelectProps>(
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
   OPTION COMPONENT
   ================================ */

interface OptionProps {
  option: SelectOption;
  isSelected: boolean;
  isLast: boolean;
  onSelect: (value: string | number) => void;
}

const OptionItem: React.FC<OptionProps> = ({
  option,
  isSelected,
  isLast,
  onSelect,
}) => {
  const isDisabled = option.disabled || false;

  const optionStyles = useThemedStyles(createOptionStyles, {
    selected: isSelected,
    disabled: isDisabled,
  });

  const optionTextStyles = useThemedStyles(createOptionTextStyles, {
    selected: isSelected,
    disabled: isDisabled,
  });

  return (
    <Pressable
      key={option.value}
      style={[optionStyles, isLast && { borderBottomWidth: 0 }]}
      onPress={() => !isDisabled && onSelect(option.value)}
      disabled={isDisabled}
    >
      <Text style={optionTextStyles}>{option.label}</Text>
    </Pressable>
  );
};

/* ================================
   SELECT COMPONENT
   ================================ */

export const Select = forwardRef<RNView, SelectProps>(
  (
    {
      label,
      placeholder = 'Select an option',
      options = [],
      value,
      onValueChange,
      error,
      helperText,
      size = 'medium',
      variant = 'default',
      state = 'default',
      disabled = false,
      required = false,
      leftIcon,
      containerStyle,
      triggerStyle,
      testID,
      accessible = true,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    // Determine actual state based on error and disabled
    const actualState = error ? 'error' : disabled ? 'disabled' : state;

    // Find selected option
    const selectedOption = options.find((option) => option.value === value);

    // Generate themed styles
    const containerStyles = useThemedStyles(createSelectContainerStyles, {});

    const triggerStyles = useThemedStyles(createSelectTriggerStyles, {
      size,
      variant,
      state: actualState,
      disabled,
    });

    const textStyles = useThemedStyles(createSelectTextStyles, {
      size,
      disabled,
      variant,
    });

    const placeholderStyles = useThemedStyles(createPlaceholderStyles, {
      size,
      variant,
    });

    const modalStyles = useThemedStyles(createModalStyles, {});

    const dropdownStyles = useThemedStyles(createDropdownStyles, {});

    const labelStyles = useThemedStyles(createLabelStyles, {});

    const helperStyles = useThemedStyles(createHelperTextStyles, {
      state: actualState,
    });

    const textContainerStyles = useThemedStyles(createTextContainerStyles, {});

    // Get theme for icon color
    const theme = useThemedStyles((theme) => theme, {});

    // Create accessibility props
    const accessibilityProps = createAccessibilityProps({
      testID,
      accessible,
      accessibilityLabel: accessibilityLabel || label,
      accessibilityHint,
      accessibilityRole: 'button',
      accessibilityState: { disabled },
    });

    // Handle option selection
    const handleSelectOption = (optionValue: string | number) => {
      onValueChange?.(optionValue);
      setIsOpen(false);
    };

    // Merge styles
    const finalContainerStyle = mergeStyles(containerStyles, containerStyle);
    const finalTriggerStyle = mergeStyles(triggerStyles, triggerStyle);

    return (
      <View style={finalContainerStyle} ref={ref} {...props}>
        {/* Label */}
        {label && (
          <Text variant="label" style={labelStyles}>
            {label}
            {required && <Text color="error"> *</Text>}
          </Text>
        )}

        {/* Select Trigger */}
        <Pressable
          style={finalTriggerStyle}
          onPress={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          accessibilityRole="button"
          {...accessibilityProps}
        >
          {/* Left Icon */}
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}

          {/* Selected Value or Placeholder */}
          <View style={textContainerStyles}>
            {selectedOption ? (
              <Text style={textStyles}>{selectedOption.label}</Text>
            ) : (
              <Text style={placeholderStyles}>{placeholder}</Text>
            )}
          </View>

          {/* Dropdown Arrow */}
          <Icon
            name={iconNames.caret_down}
            size={16}
            color={theme.colors.text.primary}
            style={{
              marginLeft: 8,
              opacity: disabled ? 0.5 : 1,
            }}
          />
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

        {/* Dropdown Modal */}
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <Pressable style={modalStyles} onPress={() => setIsOpen(false)}>
            <Pressable
              style={dropdownStyles}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {options.map((option, index) => (
                  <OptionItem
                    key={option.value}
                    option={option}
                    isSelected={option.value === value}
                    isLast={index === options.length - 1}
                    onSelect={handleSelectOption}
                  />
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }
);

Select.displayName = 'Select';

/* ================================
   EXPORTS
   ================================ */

export default Select;
