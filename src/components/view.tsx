/**
 * View Component
 * A theme-aware container component with layout utilities and spacing
 */

import React from 'react';
import type { ViewProps as RNViewProps } from 'react-native';
import { View as RNView } from 'react-native';

import type { Theme } from '@/theme';
import { useTheme } from '@/theme';

import {
  createAccessibilityProps,
  createContainerStyles,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import type { BaseContainerProps } from './types';

/* ================================
   VIEW COMPONENT INTERFACE
   ================================ */

interface ViewProps extends BaseContainerProps {
  /** Flex direction */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** Justify content alignment */
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  /** Align items alignment */
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  /** Flex wrap */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Flex value */
  flex?: number;
  /** Gap between children */
  gap?: keyof Theme['spacing']['gap'];
  /** Whether to center content (shorthand for justify center + align center) */
  centered?: boolean;
  /** Whether to apply safe area padding */
  safeArea?: boolean;
  /** Border radius variant */
  rounded?: keyof Theme['borderRadius'];
  /** Whether to apply border */
  bordered?: boolean;
  /** Border color override */
  borderColor?: string;
  /** Shadow variant */
  shadow?: keyof Theme['shadows'];
}

/* ================================
   STYLE CREATORS
   ================================ */

const createViewStyles = (theme: Theme, props: ViewProps) => {
  const {
    direction = 'column',
    justify,
    align,
    wrap,
    flex,
    gap,
    centered = false,
    fullWidth = false,
    safeArea = false,
    rounded,
    bordered = false,
    borderColor,
    shadow,
    backgroundColor,
  } = props;

  const baseStyles = createContainerStyles(theme, props);

  // Layout styles
  const layoutStyles = {
    flexDirection: direction,
    justifyContent: centered ? 'center' : justify,
    alignItems: centered ? 'center' : align,
    flexWrap: wrap,
    flex,
    gap: gap ? theme.spacing.gap[gap] : undefined,
    width: fullWidth ? '100%' : undefined,
  };

  // Visual styles
  const visualStyles = {
    backgroundColor: backgroundColor || baseStyles.backgroundColor,
    borderRadius: rounded ? theme.borderRadius[rounded] : undefined,
    borderWidth: bordered ? 1 : undefined,
    borderColor: borderColor || theme.colors.text.secondary,
    ...((shadow && theme.shadows && (theme.shadows as any)[shadow]) || {}),
  };

  return {
    ...baseStyles,
    ...layoutStyles,
    ...visualStyles,
  };
};

/* ================================
   VIEW COMPONENT
   ================================ */

export const View = React.forwardRef<RNView, ViewProps & RNViewProps>(
  (
    {
      direction = 'column',
      justify,
      align,
      wrap,
      flex,
      gap,
      centered = false,
      fullWidth = false,
      safeArea = false,
      rounded,
      bordered = false,
      borderColor,
      shadow,
      backgroundColor,
      padding,
      margin,
      style: userStyle,
      children,
      ...props
    },
    ref
  ) => {
    // Generate themed styles
    const styles = useThemedStyles(createViewStyles, {
      direction,
      justify,
      align,
      wrap,
      flex,
      gap,
      centered,
      fullWidth,
      safeArea,
      rounded,
      bordered,
      borderColor,
      shadow,
      backgroundColor,
      padding,
      margin,
    });

    // Merge with user-provided styles
    const finalStyle = mergeStyles(styles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createAccessibilityProps(props);

    return (
      <RNView ref={ref} style={finalStyle} {...accessibilityProps} {...props}>
        {children}
      </RNView>
    );
  }
);

View.displayName = 'View';

/* ================================
   VIEW VARIANT COMPONENTS
   ================================ */

/**
 * Pre-configured view variants for common layouts
 */

export const Row = React.forwardRef<
  RNView,
  Omit<ViewProps, 'direction'> & RNViewProps
>((props, ref) => <View ref={ref} direction="row" {...props} />);
Row.displayName = 'Row';

export const Column = React.forwardRef<
  RNView,
  Omit<ViewProps, 'direction'> & RNViewProps
>((props, ref) => <View ref={ref} direction="column" {...props} />);
Column.displayName = 'Column';

export const Center = React.forwardRef<
  RNView,
  Omit<ViewProps, 'centered'> & RNViewProps
>((props, ref) => <View ref={ref} centered {...props} />);
Center.displayName = 'Center';

export const Container = React.forwardRef<
  RNView,
  Omit<ViewProps, 'fullWidth' | 'padding'> & RNViewProps
>((props, ref) => <View ref={ref} fullWidth padding="xl" {...props} />);
Container.displayName = 'Container';

// Card component moved to ./card.tsx for better organization and features

export const Surface = React.forwardRef<
  RNView,
  Omit<ViewProps, 'backgroundColor'> & RNViewProps
>((props, ref) => {
  const theme = useTheme();
  return (
    <View ref={ref} backgroundColor={theme.colors.surface.card} {...props} />
  );
});
Surface.displayName = 'Surface';

export const Screen = React.forwardRef<
  RNView,
  Omit<ViewProps, 'flex' | 'safeArea' | 'backgroundColor'> & RNViewProps
>((props, ref) => {
  const theme = useTheme();
  return (
    <View
      ref={ref}
      flex={1}
      safeArea
      backgroundColor={theme.colors.background.primary}
      {...props}
    />
  );
});
Screen.displayName = 'Screen';
