/**
 * IconButton Component
 * A reusable circular icon button component with theme support
 * Follows design system patterns for consistency
 */

import React from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';

import type { Theme } from '@/theme';

import {
  createPressableAccessibilityProps,
  mergeStyles,
  useInteractionState,
  useThemedStyles,
} from './base-component';
import { useTheme } from '@/theme';
import { Icon, type IconName } from './icon';
import type {
  BasePressableProps,
  ColorVariant,
  SizeVariant,
} from './types';

/* ================================
   ICON BUTTON COMPONENT INTERFACE
   ================================ */

interface IconButtonProps extends BasePressableProps {
  /** Icon name to display */
  icon: IconName;
  /** Size variant */
  size?: SizeVariant;
  /** Color variant for background */
  colorVariant?: ColorVariant | 'transparent';
  /** Custom background color (overrides colorVariant) */
  backgroundColor?: string;
  /** Icon color (defaults based on variant and state) */
  iconColor?: string;
  /** Icon size (defaults based on button size) */
  iconSize?: number;
  /** Whether button is circular (default: true) */
  circular?: boolean;
  /** Custom border radius (only used if circular is false) */
  borderRadius?: number;
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
}

/* ================================
   SIZE DEFINITIONS
   ================================ */

const SIZE_MAP: Record<SizeVariant, { button: number; icon: number }> = {
  small: { button: 32, icon: 16 },
  medium: { button: 36, icon: 20 },
  large: { button: 44, icon: 26 },
};

/* ================================
   STYLE CREATORS
   ================================ */

const createIconButtonStyles = (
  theme: Theme,
  props: Omit<IconButtonProps, 'icon' | 'onPress' | 'accessibilityLabel' | 'testID' | 'style'> & { isPressed: boolean; isFocused: boolean }
) => {
  const {
    size = 'medium',
    colorVariant = 'secondary',
    backgroundColor,
    circular = true,
    borderRadius,
    disabled = false,
    isPressed,
  } = props;

  const { button: buttonSize } = SIZE_MAP[size];

  // Get background color
  let bgColor: string;
  if (backgroundColor) {
    bgColor = backgroundColor;
  } else if (colorVariant === 'transparent') {
    bgColor = 'transparent';
  } else if (colorVariant === 'primary') {
    bgColor = theme.colors.primary || '#007AFF';
  } else if (colorVariant === 'secondary') {
    bgColor = theme.colors.background.secondary;
  } else if (colorVariant === 'success') {
    bgColor = theme.colors.semantic?.success || '#10B981';
  } else if (colorVariant === 'warning') {
    bgColor = theme.colors.semantic?.warning || '#F59E0B';
  } else if (colorVariant === 'error') {
    bgColor = theme.colors.semantic?.error || '#EF4444';
  } else {
    bgColor = theme.colors.background.secondary;
  }

  // Calculate border radius
  const finalBorderRadius = circular
    ? buttonSize / 2
    : borderRadius ?? theme.components?.button?.borderRadius ?? 8;

  return {
    width: buttonSize,
    height: buttonSize,
    borderRadius: finalBorderRadius,
    backgroundColor: bgColor,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    opacity: disabled ? 0.6 : isPressed ? 0.8 : 1,
    transform: isPressed && !disabled ? [{ scale: 0.95 }] : [],
  };
};

const getIconColor = (
  theme: Theme,
  props: Pick<IconButtonProps, 'iconColor' | 'colorVariant'> & { disabled: boolean }
): string => {
  const {
    iconColor,
    colorVariant = 'secondary',
    disabled = false,
  } = props;

  // If icon color is explicitly provided, use it
  if (iconColor) {
    return iconColor;
  }

  // Determine icon color based on variant and state
  if (disabled) {
    return theme.colors.text.disabled || theme.colors.text.secondary;
  }

  if (colorVariant === 'primary') {
    return '#FFFFFF';
  }

  if (colorVariant === 'transparent') {
    return theme.colors.text.primary;
  }

  // Default: use muted text color for secondary variant
  return theme.colors.text.muted || theme.colors.text.secondary;
};

/* ================================
   ICON BUTTON COMPONENT
   ================================ */

export const IconButton = React.forwardRef<any, IconButtonProps & PressableProps>(
  (
    {
      icon,
      size = 'medium',
      colorVariant = 'secondary',
      backgroundColor,
      iconColor,
      iconSize,
      circular = true,
      borderRadius,
      disabled = false,
      style: userStyle,
      onPress,
      accessibilityLabel,
      testID,
      ...props
    },
    ref
  ) => {
    const { isPressed, isFocused, interactionProps } =
      useInteractionState(disabled);

    // Generate themed styles
    const buttonStyles = useThemedStyles(createIconButtonStyles, {
      size,
      colorVariant,
      backgroundColor,
      circular,
      borderRadius,
      disabled,
      isPressed,
      isFocused,
    });

    // Get icon color
    const theme = useTheme();
    const finalIconColor = getIconColor(theme, {
      iconColor,
      colorVariant,
      disabled,
    });

    // Get icon size
    const { icon: defaultIconSize } = SIZE_MAP[size];
    const finalIconSize = iconSize ?? defaultIconSize;

    // Merge with user-provided styles
    const finalStyle = mergeStyles(buttonStyles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createPressableAccessibilityProps(
      {
        accessibilityLabel: accessibilityLabel || `Icon button: ${icon}`,
        testID,
        disabled: Boolean(disabled),
      },
      'button'
    );

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => [
          finalStyle,
          pressed && !disabled && { opacity: 0.8, transform: [{ scale: 0.95 }] },
        ]}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        {...accessibilityProps}
        {...interactionProps}
        {...props}
      >
        <Icon name={icon} size={finalIconSize} color={finalIconColor} />
      </Pressable>
    );
  }
);

IconButton.displayName = 'IconButton';

