/**
 * FloatingActionButton Component
 * A floating action button for primary actions in the interface
 */

import React from 'react';
import type { ViewProps } from 'react-native';
import { Pressable } from 'react-native';

import type { Theme } from '@/theme';

import {
  createAccessibilityProps,
  mergeStyles,
  mergeTypographyStyles,
  useThemedStyles,
} from './base-component';
import { Text } from './text';
import type { BaseComponentProps, ColorVariant, SizeVariant } from './types';
import { View } from './view';

/* ================================
   FAB COMPONENT INTERFACE
   ================================ */

export interface FloatingActionButtonProps extends BaseComponentProps {
  /** Button press handler */
  onPress?: () => void;
  /** Icon element */
  icon?: React.ReactNode;
  /** Button label (for extended FAB) */
  label?: string;
  /** Size variant */
  size?: SizeVariant | 'mini';
  /** Color variant */
  colorVariant?: ColorVariant;
  /** Whether button is extended with label */
  extended?: boolean;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Position variant */
  position?:
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'top-right'
    | 'top-left';
  /** Custom positioning offsets */
  offset?: {
    bottom?: number;
    top?: number;
    left?: number;
    right?: number;
  };
  /** Custom style */
  style?: any;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createFABStyles = (theme: Theme, props: FloatingActionButtonProps) => {
  const {
    size = 'medium',
    colorVariant = 'primary',
    extended = false,
    disabled = false,
    position = 'bottom-right',
    offset = {},
  } = props;

  const { colors, spacing, borderRadius } = theme;

  // Color schemes
  const colorSchemes = {
    primary: colors.primary,
    secondary: colors.text.secondary,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
  };

  const backgroundColor = colorSchemes[colorVariant];

  // Size variants
  const sizeStyles = {
    mini: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    small: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    medium: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    large: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
  };

  // Extended FAB overrides
  const extendedStyles = extended
    ? {
        width: undefined,
        paddingHorizontal: spacing.padding.lg,
        borderRadius: borderRadius.full,
        flexDirection: 'row' as const,
        gap: spacing.gap.sm,
      }
    : {};

  // Position styles
  const positionStyles = {
    'bottom-right': {
      position: 'absolute' as const,
      bottom: offset.bottom || spacing.padding.xl,
      right: offset.right || spacing.padding.md,
    },
    'bottom-left': {
      position: 'absolute' as const,
      bottom: offset.bottom || spacing.padding.xl,
      left: offset.left || spacing.padding.md,
    },
    'bottom-center': {
      position: 'absolute' as const,
      bottom: offset.bottom || spacing.padding.xl,
      alignSelf: 'center' as const,
    },
    'top-right': {
      position: 'absolute' as const,
      top: offset.top || spacing.padding.xl,
      right: offset.right || spacing.padding.md,
    },
    'top-left': {
      position: 'absolute' as const,
      top: offset.top || spacing.padding.xl,
      left: offset.left || spacing.padding.md,
    },
  };

  // Base styles
  const baseStyles = {
    backgroundColor: disabled ? colors.text.disabled : backgroundColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: colors.semantic.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  };

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...extendedStyles,
    ...positionStyles[position],
  };
};

const createFABTextStyles = (
  theme: Theme,
  props: FloatingActionButtonProps
) => {
  const { disabled = false } = props;
  const { colors } = theme;

  const baseTypography = theme.typography.button || theme.typography.label;

  return mergeTypographyStyles(baseTypography, {
    color: disabled ? colors.text.muted : colors.semantic.white,
    fontWeight: '600' as const,
  });
};

/* ================================
   FAB COMPONENT
   ================================ */

export const FloatingActionButton = React.forwardRef<
  any,
  FloatingActionButtonProps & ViewProps
>(
  (
    {
      onPress,
      icon,
      label,
      size = 'medium',
      colorVariant = 'primary',
      extended = false,
      disabled = false,
      position = 'bottom-right',
      offset,
      style: userStyle,
      ...props
    },
    ref
  ) => {
    // Generate themed styles
    const fabStyles = useThemedStyles(createFABStyles, {
      size,
      colorVariant,
      extended,
      disabled,
      position,
      offset,
    });

    const textStyles = useThemedStyles(createFABTextStyles, { disabled });

    // Merge with user-provided styles
    const finalStyle = mergeStyles(fabStyles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createAccessibilityProps({
      accessibilityRole: 'button',
      accessibilityLabel: label || 'Floating action button',
      accessibilityState: { disabled },
      ...props,
    });

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => [
          finalStyle,
          pressed &&
            !disabled && { opacity: 0.8, transform: [{ scale: 0.95 }] },
        ]}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        {...accessibilityProps}
        {...props}
      >
        {/* Icon */}
        {icon && <View style={{ opacity: disabled ? 0.5 : 1 }}>{icon}</View>}

        {/* Label for extended FAB */}
        {extended && label && (
          <Text style={textStyles} numberOfLines={1}>
            {label}
          </Text>
        )}
      </Pressable>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

/* ================================
   FAB VARIANT COMPONENTS
   ================================ */

/**
 * Pre-configured FAB variants for common use cases
 */

export const FAB = FloatingActionButton; // Short alias

export const MiniFAB = React.forwardRef<
  any,
  Omit<FloatingActionButtonProps, 'size'> & ViewProps
>((props, ref) => <FloatingActionButton ref={ref} size="mini" {...props} />);
MiniFAB.displayName = 'MiniFAB';

export const ExtendedFAB = React.forwardRef<
  any,
  Omit<FloatingActionButtonProps, 'extended'> & ViewProps
>((props, ref) => (
  <FloatingActionButton ref={ref} extended={true} {...props} />
));
ExtendedFAB.displayName = 'ExtendedFAB';

export const PrimaryFAB = React.forwardRef<
  any,
  Omit<FloatingActionButtonProps, 'colorVariant'> & ViewProps
>((props, ref) => (
  <FloatingActionButton ref={ref} colorVariant="primary" {...props} />
));
PrimaryFAB.displayName = 'PrimaryFAB';

export const SuccessFAB = React.forwardRef<
  any,
  Omit<FloatingActionButtonProps, 'colorVariant'> & ViewProps
>((props, ref) => (
  <FloatingActionButton ref={ref} colorVariant="success" {...props} />
));
SuccessFAB.displayName = 'SuccessFAB';

export const ErrorFAB = React.forwardRef<
  any,
  Omit<FloatingActionButtonProps, 'colorVariant'> & ViewProps
>((props, ref) => (
  <FloatingActionButton ref={ref} colorVariant="error" {...props} />
));
ErrorFAB.displayName = 'ErrorFAB';

/* ================================
   FAB GROUP COMPONENT
   ================================ */

/**
 * Component for grouping multiple FABs
 */

export interface FABGroupProps extends BaseComponentProps {
  /** Array of FAB configurations */
  actions: {
    icon: React.ReactNode;
    label?: string;
    onPress: () => void;
    colorVariant?: ColorVariant;
  }[];
  /** Whether the group is open */
  open?: boolean;
  /** Toggle handler */
  onToggle?: () => void;
  /** Main FAB icon */
  icon?: React.ReactNode;
  /** Position of the group */
  position?: FloatingActionButtonProps['position'];
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const FABGroup = React.forwardRef<any, FABGroupProps & ViewProps>(
  (
    {
      actions,
      open = false,
      onToggle,
      icon,
      position = 'bottom-right',
      direction = 'up',
      style: userStyle,
      ...props
    },
    ref
  ) => {
    const spacing = 16; // Distance between FABs

    const getActionPosition = (index: number) => {
      const offset = (index + 1) * (56 + spacing); // FAB size + spacing

      switch (direction) {
        case 'up':
          return { bottom: offset };
        case 'down':
          return { top: offset };
        case 'left':
          return { right: offset };
        case 'right':
          return { left: offset };
        default:
          return { bottom: offset };
      }
    };

    return (
      <View ref={ref} style={userStyle} {...props}>
        {/* Main FAB */}
        <FloatingActionButton
          icon={icon}
          onPress={onToggle}
          position={position}
          style={{
            transform: [{ rotate: open ? '45deg' : '0deg' }],
          }}
        />

        {/* Action FABs */}
        {open &&
          actions.map((action, index) => (
            <FloatingActionButton
              key={index}
              icon={action.icon}
              onPress={action.onPress}
              colorVariant={action.colorVariant || 'secondary'}
              size="small"
              position={position}
              offset={getActionPosition(index)}
              style={{
                opacity: open ? 1 : 0,
              }}
            />
          ))}
      </View>
    );
  }
);

FABGroup.displayName = 'FABGroup';
