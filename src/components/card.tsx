/**
 * Card Component
 * A themed container component for grouping related content
 */

import React from 'react';
import type { ViewProps } from 'react-native';

import type { Theme } from '@/theme';

import {
  createAccessibilityProps,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import type { BaseContainerProps } from './types';
import { View } from './view';

/* ================================
   CARD COMPONENT INTERFACE
   ================================ */

export interface CardProps extends Omit<BaseContainerProps, 'padding'> {
  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** Whether the card is interactive */
  interactive?: boolean;
  /** Custom padding override */
  padding?: 'none' | 'small' | 'medium' | 'large';
}

/* ================================
   STYLE CREATORS
   ================================ */

const createCardStyles = (theme: Theme, props: CardProps) => {
  const {
    variant = 'default',
    interactive = false,
    padding = 'medium',
    fullWidth = true,
  } = props;

  const { colors, borderRadius, spacing } = theme;

  // Base card styles
  const baseStyles = {
    borderRadius: borderRadius.lg,
    overflow: 'hidden' as const,
    width: fullWidth ? '100%' : undefined,
  };

  // Padding variants
  const paddingStyles = {
    none: {},
    small: {
      paddingHorizontal: spacing.padding.sm,
      paddingVertical: spacing.padding.xs,
    },
    medium: {
      paddingHorizontal: spacing.padding.md,
      paddingVertical: spacing.padding.sm,
    },
    large: {
      paddingHorizontal: spacing.padding.lg,
      paddingVertical: spacing.padding.md,
    },
  };

  // Card variants
  const variantStyles = {
    default: {
      backgroundColor: colors.surface.card,
      borderWidth: 2,
      borderColor: colors.surface.border,
    },
    elevated: {
      backgroundColor: colors.surface.card,
      shadowColor: colors.semantic.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.surface.border,
    },
    filled: {
      backgroundColor: colors.background.secondary,
      borderWidth: 0,
    },
  };

  // Interactive states
  const interactiveStyles = interactive
    ? {
        opacity: 1,
        // Note: Press states would be handled by wrapping in Pressable
      }
    : {};

  return {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...interactiveStyles,
  };
};

/* ================================
   CARD COMPONENT
   ================================ */

export const Card = React.forwardRef<any, CardProps & ViewProps>(
  (
    {
      variant = 'default',
      interactive = false,
      padding = 'medium',
      children,
      style: userStyle,
      ...props
    },
    ref
  ) => {
    // Generate themed styles
    const styles = useThemedStyles(createCardStyles, {
      variant,
      interactive,
      padding,
      fullWidth: props.fullWidth,
    });

    // Merge with user-provided styles
    const finalStyle = mergeStyles(styles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createAccessibilityProps(props);

    return (
      <View ref={ref} style={finalStyle} {...accessibilityProps} {...props}>
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

/* ================================
   CARD VARIANT COMPONENTS
   ================================ */

/**
 * Pre-configured card variants for common use cases
 */

export const TaskCard = React.forwardRef<
  any,
  Omit<CardProps, 'variant'> & ViewProps
>((props, ref) => <Card ref={ref} variant="default" {...props} />);
TaskCard.displayName = 'TaskCard';

export const IncidentCard = React.forwardRef<
  any,
  Omit<CardProps, 'variant'> & ViewProps
>((props, ref) => <Card ref={ref} variant="elevated" {...props} />);
IncidentCard.displayName = 'IncidentCard';

export const MemberCard = React.forwardRef<
  any,
  Omit<CardProps, 'variant'> & ViewProps
>((props, ref) => <Card ref={ref} variant="default" {...props} />);
MemberCard.displayName = 'MemberCard';

export const InteractiveCard = React.forwardRef<
  any,
  Omit<CardProps, 'interactive'> & ViewProps
>((props, ref) => <Card ref={ref} interactive={true} {...props} />);
InteractiveCard.displayName = 'InteractiveCard';
