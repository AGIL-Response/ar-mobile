import React, { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import {
  createAccessibilityProps,
  createStyleCreator,
  mergeStyles,
  mergeTypographyStyles,
  useThemedStyles,
} from './base-component';
import { ErrorText, Text } from './text';
import type { BaseComponentProps } from './types';
import { View } from './view';

/* ================================
   TYPES & INTERFACES
   ================================ */

export interface TextAreaProps
  extends BaseComponentProps,
    Omit<
      TextInputProps,
      'style' | 'multiline' | 'accessibilityRole' | 'accessibilityState'
    > {
  /** TextArea label */
  label?: string;
  /** Error message to display */
  error?: string | null;
  /** Helper text to display below textarea */
  helperText?: string;
  /** TextArea size variant */
  size?: 'small' | 'medium' | 'large';
  /** TextArea visual variant */
  variant?: 'default' | 'outlined' | 'filled';
  /** TextArea state */
  state?: 'default' | 'error' | 'success' | 'disabled';
  /** Whether textarea is disabled */
  disabled?: boolean;
  /** Whether textarea is required */
  required?: boolean;
  /** Number of visible text lines */
  rows?: number;
  /** Whether to auto-grow height with content */
  autoGrow?: boolean;
  /** Maximum height when auto-growing */
  maxHeight?: number;
  /** Whether to show character count */
  showCharacterCount?: boolean;
  /** Maximum number of characters */
  maxLength?: number;
  /** Custom container style */
  containerStyle?: any;
  /** Custom textarea style */
  textAreaStyle?: any;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createTextAreaContainerStyles = createStyleCreator<TextAreaProps>(
  (theme, props) => {
    const { spacing } = theme;

    return {
      marginBottom: spacing.gap.lg,
    };
  }
);

const createTextAreaWrapperStyles = createStyleCreator<TextAreaProps>(
  (theme, props) => {
    const {
      size = 'medium',
      variant = 'default',
      state = 'default',
      disabled = false,
      rows = 4,
    } = props;
    const { colors, spacing, borderRadius, components } = theme;

    // Calculate height based on rows and size
    const lineHeightMap = {
      small: 20,
      medium: 24,
      large: 28,
    };

    const paddingMap = {
      small: spacing.padding.lg,
      medium: spacing.padding.xxl,
      large: spacing.padding.xxxl,
    };

    const lineHeight = lineHeightMap[size];
    const padding = paddingMap[size];
    const minHeight = lineHeight * rows + padding * 2;

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
        backgroundColor: colors.surface.card,
        borderWidth: 0,
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
      minHeight,
      padding,
      borderRadius: components.input.borderRadius,
      ...variantStyles[variant],
      ...stateStyles[disabled ? 'disabled' : state],
    };
  }
);

const createTextAreaTextStyles = createStyleCreator<TextAreaProps>(
  (theme, props) => {
    const { size = 'medium', disabled = false, rows = 4 } = props;
    const { colors, typography } = theme;

    // Size-based typography
    const typographyVariants = {
      small: typography.caption,
      medium: typography.body,
      large: typography.h4,
    };

    const lineHeightMap = {
      small: 20,
      medium: 24,
      large: 28,
    };

    return mergeTypographyStyles(typographyVariants[size], {
      color: disabled ? colors.text.muted : colors.text.primary,
      textAlignVertical: 'top',
      lineHeight: lineHeightMap[size],
    });
  }
);

const createLabelStyles = createStyleCreator<TextAreaProps>((theme, props) => {
  const { spacing } = theme;

  return {
    marginBottom: spacing.gap.xs,
  };
});

const createHelperTextStyles = createStyleCreator<TextAreaProps>(
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

const createCharacterCountStyles = createStyleCreator<TextAreaProps>(
  (theme, props) => {
    const { maxLength } = props;
    const { colors, spacing } = theme;

    return {
      marginTop: spacing.gap.xs,
      alignSelf: 'flex-end',
      color: colors.text.muted,
    };
  }
);

const createFooterRowStyles = createStyleCreator<TextAreaProps>(
  (theme, props) => {
    return {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    };
  }
);

/* ================================
   TEXTAREA COMPONENT
   ================================ */

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'medium',
      variant = 'default',
      state = 'default',
      disabled = false,
      required = false,
      rows = 4,
      autoGrow = false,
      maxHeight = 200,
      showCharacterCount = false,
      maxLength,
      containerStyle,
      textAreaStyle,
      placeholderTextColor,
      testID,
      accessible = true,
      accessibilityLabel,
      accessibilityHint,
      value,
      ...textInputProps
    },
    ref
  ) => {
    // Determine actual state based on error and disabled
    const actualState = error ? 'error' : disabled ? 'disabled' : state;

    // Calculate character count
    const characterCount = value ? value.length : 0;
    const isOverLimit = maxLength ? characterCount > maxLength : false;

    // Generate themed styles
    const containerStyles = useThemedStyles(createTextAreaContainerStyles, {});

    const wrapperStyles = useThemedStyles(createTextAreaWrapperStyles, {
      size,
      variant,
      state: actualState,
      disabled,
      rows,
    });

    const textStyles = useThemedStyles(createTextAreaTextStyles, {
      size,
      disabled,
      rows,
    });

    const labelStyles = useThemedStyles(createLabelStyles, {});

    const helperStyles = useThemedStyles(createHelperTextStyles, {
      state: actualState,
    });

    const characterCountStyles = useThemedStyles(createCharacterCountStyles, {
      maxLength,
    });

    const footerRowStyles = useThemedStyles(createFooterRowStyles, {});

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
      accessibilityRole: 'text',
    });

    // Merge styles
    const finalContainerStyle = mergeStyles(containerStyles, containerStyle);
    const finalTextAreaStyle = mergeStyles(textStyles, textAreaStyle);

    // Dynamic height for auto-grow
    const dynamicWrapperStyle = autoGrow
      ? {
          ...wrapperStyles,
          maxHeight,
          minHeight: wrapperStyles.minHeight,
        }
      : wrapperStyles;

    return (
      <View style={finalContainerStyle}>
        {/* Label */}
        {label && (
          <Text variant="label" style={labelStyles}>
            {label}
            {required && <Text color="error"> *</Text>}
          </Text>
        )}

        {/* TextArea */}
        <TextInput
          ref={ref}
          style={[dynamicWrapperStyle, finalTextAreaStyle]}
          multiline
          editable={!disabled}
          placeholderTextColor={defaultPlaceholderColor}
          maxLength={maxLength}
          value={value}
          {...accessibilityProps}
          {...textInputProps}
        />

        {/* Footer Row (Error/Helper Text + Character Count) */}
        {(error || helperText || showCharacterCount) && (
          <View style={footerRowStyles}>
            {/* Error Message or Helper Text */}
            <View style={{ flex: 1 }}>
              {error && (
                <ErrorText variant="caption" style={helperStyles}>
                  {error}
                </ErrorText>
              )}
              {helperText && !error && (
                <Text variant="caption" style={helperStyles}>
                  {helperText}
                </Text>
              )}
            </View>

            {/* Character Count */}
            {showCharacterCount && (
              <Text
                variant="caption"
                style={[
                  characterCountStyles,
                  isOverLimit && { color: 'error' },
                ]}
              >
                {characterCount}
                {maxLength && `/${maxLength}`}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

TextArea.displayName = 'TextArea';

/* ================================
   SEMANTIC COMPONENTS
   ================================ */

export const CommentTextArea = forwardRef<
  TextInput,
  Omit<TextAreaProps, 'rows' | 'autoGrow' | 'showCharacterCount'>
>((props, ref) => (
  <TextArea
    ref={ref}
    rows={3}
    autoGrow={true}
    showCharacterCount={true}
    maxLength={500}
    placeholder="Add a comment..."
    {...props}
  />
));

export const DescriptionTextArea = forwardRef<
  TextInput,
  Omit<TextAreaProps, 'rows' | 'showCharacterCount'>
>((props, ref) => (
  <TextArea
    ref={ref}
    rows={5}
    showCharacterCount={true}
    maxLength={1000}
    placeholder="Enter description..."
    {...props}
  />
));

export const NoteTextArea = forwardRef<
  TextInput,
  Omit<TextAreaProps, 'rows' | 'autoGrow'>
>((props, ref) => (
  <TextArea
    ref={ref}
    rows={4}
    autoGrow={true}
    maxHeight={150}
    placeholder="Add notes..."
    {...props}
  />
));

/* ================================
   EXPORTS
   ================================ */

export default TextArea;
