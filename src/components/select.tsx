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
import { CaretDown } from './icons';
import { ErrorText, Text } from './text';
import type { BaseComponentProps } from './types';
import { View } from './view';

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
        height: 40,
        paddingHorizontal: spacing.padding.sm,
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
  }
);

const createPlaceholderStyles = createStyleCreator<SelectProps>(
  (theme, props) => {
    const { size = 'medium' } = props;
    const { colors, typography } = theme;

    const typographyVariants = {
      small: typography.caption,
      medium: typography.body,
      large: typography.h4,
    };

    return {
      color: colors.text.muted,
      ...typographyVariants[size],
    };
  }
);

const createModalStyles = createStyleCreator<SelectProps>((theme, _props) => {
  const { colors } = theme;

  return {
    flex: 1,
    backgroundColor: colors.utility.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  };
});

const createDropdownStyles = createStyleCreator<SelectProps>(
  (theme, _props) => {
    const { colors, borderRadius } = theme;

    return {
      backgroundColor: colors.surface.card,
      borderRadius: borderRadius.lg,
      maxHeight: 300,
      width: '100%',
      shadowColor: colors.semantic.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
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
    paddingVertical: spacing.padding.md,
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
    });

    const placeholderStyles = useThemedStyles(createPlaceholderStyles, {
      size,
    });

    const modalStyles = useThemedStyles(createModalStyles, {});

    const dropdownStyles = useThemedStyles(createDropdownStyles, {});

    const labelStyles = useThemedStyles(createLabelStyles, {});

    const helperStyles = useThemedStyles(createHelperTextStyles, {
      state: actualState,
    });

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
          {...accessibilityProps}
        >
          {/* Left Icon */}
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}

          {/* Selected Value or Placeholder */}
          <View style={{ flex: 1 }}>
            {selectedOption ? (
              <Text style={textStyles}>{selectedOption.label}</Text>
            ) : (
              <Text style={placeholderStyles}>{placeholder}</Text>
            )}
          </View>

          {/* Dropdown Arrow */}
          <CaretDown
            width={16}
            height={16}
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
