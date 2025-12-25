/**
 * Badge Component
 * A small status indicator component with variants and colors
 */

import React from 'react';
import type { ViewProps } from 'react-native';
import { StyleSheet } from 'react-native';

import type { Theme } from '@/theme';
import { useTheme } from '@/theme';

import {
  createAccessibilityProps,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import { Text } from './text';
import type { BaseContainerProps, ColorVariant, SizeVariant } from './types';
import { View } from './view';

/* ================================
   BADGE COMPONENT INTERFACE
   ================================ */

export interface BadgeProps extends BaseContainerProps {
  /** Badge text content */
  label?: string;
  /** Badge variant */
  variant?: 'solid' | 'outline' | 'soft';
  /** Color variant */
  colorVariant?: ColorVariant | 'neutral';
  /** Size variant */
  size?: SizeVariant;
  /** Custom icon element */
  icon?: React.ReactNode;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createBadgeStyles = (theme: Theme, props: BadgeProps) => {
  const {
    variant = 'solid',
    colorVariant = 'primary',
    size = 'medium',
  } = props;

  const { colors, borderRadius, spacing } = theme;

  // Color schemes
  const colorSchemes = {
    primary: colors.primary,
    secondary: colors.text.secondary,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    neutral: colors.text.muted,
  };

  const badgeColor = colorSchemes[colorVariant as keyof typeof colorSchemes];

  // Size variants
  const sizeStyles = {
    small: {
      paddingHorizontal: spacing.padding.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    medium: {
      paddingHorizontal: spacing.padding.sm,
      paddingVertical: spacing.padding.xs,
      borderRadius: borderRadius.md,
    },
    large: {
      paddingHorizontal: spacing.padding.md,
      paddingVertical: spacing.padding.sm,
      borderRadius: borderRadius.lg,
    },
  };

  // Variant styles
  const variantStyles = {
    solid: {
      backgroundColor: badgeColor,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: badgeColor,
    },
    soft: {
      backgroundColor: `${badgeColor}20`, // 20% opacity
      borderWidth: 0,
    },
  };

  return {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    alignSelf: 'flex-start' as const,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

const createBadgeTextStyles = (theme: Theme, props: BadgeProps) => {
  const {
    variant = 'solid',
    colorVariant = 'primary',
    size = 'medium',
  } = props;

  const { colors } = theme;

  // Color schemes
  const colorSchemes = {
    primary: colors.primary,
    secondary: colors.text.secondary,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    neutral: colors.text.muted,
  };

  const badgeColor = colorSchemes[colorVariant as keyof typeof colorSchemes];

  // Text colors based on variant
  const textColors = {
    solid: colors.semantic.white, // Always white text on colored backgrounds
    outline: badgeColor,
    soft: badgeColor,
  };

  // Typography variants based on size
  const typographyVariants = {
    small: 'overline' as const,
    medium: 'caption' as const,
    large: 'label' as const,
  };

  return {
    color: textColors[variant],
    ...(theme.typography[typographyVariants[size]] || theme.typography.caption),
    fontWeight: '600' as const,
  };
};

/* ================================
   BADGE COMPONENT
   ================================ */

export const Badge = React.forwardRef<any, BadgeProps & ViewProps>(
  (
    {
      label,
      variant = 'solid',
      colorVariant = 'primary',
      size = 'medium',
      icon,
      children,
      style: userStyle,
      ...props
    },
    ref
  ) => {
    // Generate themed styles
    const badgeStyles = useThemedStyles(createBadgeStyles, {
      variant,
      colorVariant,
      size,
    });

    const textStyles = useThemedStyles(createBadgeTextStyles, {
      variant,
      colorVariant,
      size,
    });

    const theme = useTheme();
    const styles = createStyles(theme, { hasLabel: !!label });

    // Merge with user-provided styles
    const finalStyle = mergeStyles(badgeStyles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createAccessibilityProps(props);

    // Render content
    const renderContent = () => {
      if (children) return children;

      const textElement = label ? (
        <Text style={textStyles} numberOfLines={1}>
          {label}
        </Text>
      ) : null;

      const iconElement = icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : null;

      return (
        <>
          {iconElement}
          {textElement}
        </>
      );
    };

    return (
      <View ref={ref} style={finalStyle} {...accessibilityProps} {...props}>
        {renderContent()}
      </View>
    );
  }
);

Badge.displayName = 'Badge';

/* ================================
   BADGE VARIANT COMPONENTS
   ================================ */

/**
 * Pre-configured badge variants for common use cases
 */

export const StatusBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'variant'> & ViewProps
>((props, ref) => <Badge ref={ref} variant="solid" {...props} />);
StatusBadge.displayName = 'StatusBadge';

export const PriorityBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'variant'> & ViewProps
>((props, ref) => <Badge ref={ref} variant="outline" {...props} />);
PriorityBadge.displayName = 'PriorityBadge';

/* ================================
   SEMANTIC BADGE COMPONENTS
   ================================ */

/**
 * Badges with semantic meaning
 */

export const SuccessBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'colorVariant'> & ViewProps
>((props, ref) => <Badge ref={ref} colorVariant="success" {...props} />);
SuccessBadge.displayName = 'SuccessBadge';

export const WarningBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'colorVariant'> & ViewProps
>((props, ref) => <Badge ref={ref} colorVariant="warning" {...props} />);
WarningBadge.displayName = 'WarningBadge';

export const ErrorBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'colorVariant'> & ViewProps
>((props, ref) => <Badge ref={ref} colorVariant="error" {...props} />);
ErrorBadge.displayName = 'ErrorBadge';

export const InProgressBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'colorVariant' | 'label'> & ViewProps
>((props, ref) => (
  <Badge ref={ref} colorVariant="warning" label="In Progress" {...props} />
));
InProgressBadge.displayName = 'InProgressBadge';

export const CompletedBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'colorVariant' | 'label'> & ViewProps
>((props, ref) => (
  <Badge ref={ref} colorVariant="success" label="Completed" {...props} />
));
CompletedBadge.displayName = 'CompletedBadge';

export const NotStartedBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'colorVariant' | 'label'> & ViewProps
>((props, ref) => (
  <Badge ref={ref} colorVariant="neutral" label="Not Started" {...props} />
));
NotStartedBadge.displayName = 'NotStartedBadge';

export const OverdueBadge = React.forwardRef<
  any,
  Omit<BadgeProps, 'colorVariant' | 'label'> & ViewProps
>((props, ref) => (
  <Badge ref={ref} colorVariant="error" label="Overdue" {...props} />
));
OverdueBadge.displayName = 'OverdueBadge';

const createStyles = (theme: Theme, props: { hasLabel: boolean }) =>
  StyleSheet.create({
    iconContainer: {
      marginRight: props.hasLabel ? theme.spacing.gap.xs : 0,
    },
  });
