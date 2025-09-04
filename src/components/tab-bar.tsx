/**
 * TabBar Component
 * A horizontal tab navigation component for switching between views
 */

import React from 'react';
import type { ViewProps } from 'react-native';
import { Pressable } from 'react-native';

import type { Theme } from '@/theme';

import {
  createAccessibilityProps,
  createStyleCreator,
  mergeStyles,
  mergeTypographyStyles,
  useThemedStyles,
} from './base-component';
import { Text } from './text';
import type { BaseContainerProps } from './types';
import { View } from './view';

/* ================================
   TABBAR COMPONENT INTERFACE
   ================================ */

export interface TabItem {
  /** Tab label */
  label: string;
  /** Tab value/key */
  value: string;
  /** Whether tab is disabled */
  disabled?: boolean;
  /** Badge content */
  badge?: string | number;
  /** Custom icon element */
  icon?: React.ReactNode;
}

export interface TabBarProps extends Omit<BaseContainerProps, 'padding'> {
  /** Array of tab items */
  items: TabItem[];
  /** Currently active tab value */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (value: string) => void;
  /** Tab variant */
  variant?: 'default' | 'pills' | 'underline' | 'segment';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether tabs should fill available width */
  fillWidth?: boolean;
  /** Custom spacing between tabs */
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

export interface TabItemProps {
  /** Tab data */
  item: TabItem;
  /** Whether tab is active */
  active: boolean;
  /** Tab variant */
  variant: TabBarProps['variant'];
  /** Size variant */
  size: TabBarProps['size'];
  /** Press handler */
  onPress: () => void;
  /** Whether tab should fill width */
  fillWidth?: boolean;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createTabBarStyles = createStyleCreator<TabBarProps>(
  (theme: Theme, props) => {
    const { variant = 'default', fillWidth = true, spacing = 'medium' } = props;

    const { colors, spacing: themeSpacing, borderRadius } = theme;

    // Base container styles
    const baseStyles = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      width: fillWidth ? '100%' : undefined,
    };

    // Variant-specific container styles
    const variantStyles = {
      default: {
        backgroundColor: colors.surface.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface.border,
      },
      pills: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: themeSpacing.padding.xs,
      },
      underline: {
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: colors.surface.border,
      },
      segment: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.surface.border,
        padding: 2,
      },
    };

    // Spacing styles
    const spacingStyles = {
      none: { gap: 0 },
      small: { gap: themeSpacing.gap.xs },
      medium: { gap: themeSpacing.gap.sm },
      large: { gap: themeSpacing.gap.md },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
      ...spacingStyles[spacing],
    };
  }
);

const createTabItemStyles = createStyleCreator<TabItemProps>(
  (theme: Theme, props) => {
    const {
      active,
      variant = 'default',
      size = 'medium',
      fillWidth = false,
    } = props;
    const { colors, spacing, borderRadius } = theme;

    // Base tab item styles
    const baseStyles = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      gap: spacing.gap.xs,
      flex: fillWidth ? 1 : undefined,
      minWidth: fillWidth ? undefined : 60,
    };

    // Size variants
    const sizeStyles = {
      small: {
        paddingHorizontal: spacing.padding.sm,
        paddingVertical: spacing.padding.xs,
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: spacing.padding.md,
        paddingVertical: spacing.padding.sm,
        minHeight: 40,
      },
      large: {
        paddingHorizontal: spacing.padding.lg,
        paddingVertical: spacing.padding.md,
        minHeight: 48,
      },
    };

    // Variant-specific styles
    const variantStyles = {
      default: {
        borderBottomWidth: active ? 2 : 0,
        borderBottomColor: active ? colors.primary : 'transparent',
        backgroundColor: 'transparent',
      },
      pills: {
        borderRadius: borderRadius.md,
        backgroundColor: active ? colors.primary : 'transparent',
      },
      underline: {
        borderBottomWidth: active ? 3 : 0,
        borderBottomColor: active ? colors.primary : 'transparent',
        backgroundColor: 'transparent',
      },
      segment: {
        borderRadius: borderRadius.sm,
        backgroundColor: active ? colors.primary : 'transparent',
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  }
);

const createTabTextStyles = createStyleCreator<TabItemProps>(
  (theme: Theme, props) => {
    const { active, variant = 'default', size = 'medium' } = props;
    const { colors } = theme;

    // Typography variants based on size
    const typographyVariants = {
      small: 'caption' as const,
      medium: 'label' as const,
      large: 'button' as const,
    };

    // Text colors based on variant and state
    const getTextColor = () => {
      if (variant === 'pills' || variant === 'segment') {
        return active ? colors.semantic.white : colors.text.primary;
      }
      return active ? colors.primary : colors.text.secondary;
    };

    const baseTypography =
      theme.typography[typographyVariants[size]] || theme.typography.label;

    return mergeTypographyStyles(baseTypography, {
      color: getTextColor(),
      fontWeight: active ? '600' : '400',
    });
  }
);

/* ================================
   TAB ITEM COMPONENT
   ================================ */

const TabItemComponent = React.forwardRef<any, TabItemProps & ViewProps>(
  (
    {
      item,
      active,
      variant,
      size,
      onPress,
      fillWidth,
      style: userStyle,
      ...props
    },
    ref
  ) => {
    const itemStyles = useThemedStyles(createTabItemStyles, {
      active,
      variant,
      size,
      fillWidth,
    });

    const textStyles = useThemedStyles(createTabTextStyles, {
      active,
      variant,
      size,
    });

    const finalStyle = mergeStyles(itemStyles, userStyle);

    const accessibilityProps = createAccessibilityProps({
      accessibilityRole: 'tab',
      accessibilityState: { selected: active },
      accessibilityLabel: item.label,
      ...props,
    });

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => [finalStyle, pressed && { opacity: 0.7 }]}
        onPress={onPress}
        disabled={item.disabled}
        {...accessibilityProps}
        {...props}
      >
        {/* Icon */}
        {item.icon && <View>{item.icon}</View>}

        {/* Label */}
        <Text style={textStyles} numberOfLines={1}>
          {item.label}
        </Text>

        {/* Badge */}
        {item.badge && (
          <View
            style={{
              backgroundColor: '#ef4444', // colors.semantic.error equivalent
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              paddingHorizontal: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#ffffff', // colors.semantic.white equivalent
                fontSize: 10,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {item.badge.toString()}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }
);

TabItemComponent.displayName = 'TabItem';

/* ================================
   TABBAR COMPONENT
   ================================ */

export const TabBar = React.forwardRef<any, TabBarProps & ViewProps>(
  (
    {
      items,
      activeTab,
      onTabChange,
      variant = 'default',
      size = 'medium',
      fillWidth = true,
      spacing = 'medium',
      style: userStyle,
      ...props
    },
    ref
  ) => {
    // Generate themed styles
    const tabBarStyles = useThemedStyles(createTabBarStyles, {
      variant,
      size,
      fillWidth,
      spacing,
    });

    // Merge with user-provided styles
    const finalStyle = mergeStyles(tabBarStyles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createAccessibilityProps({
      accessibilityRole: 'tablist',
      ...props,
    });

    const handleTabPress = (item: TabItem) => {
      if (!item.disabled && onTabChange) {
        onTabChange(item.value);
      }
    };

    return (
      <View ref={ref} style={finalStyle} {...accessibilityProps} {...props}>
        {items.map((item, _index) => (
          <TabItemComponent
            key={item.value}
            item={item}
            active={activeTab === item.value}
            variant={variant}
            size={size}
            fillWidth={fillWidth}
            onPress={() => handleTabPress(item)}
          />
        ))}
      </View>
    );
  }
);

TabBar.displayName = 'TabBar';

/* ================================
   TABBAR VARIANT COMPONENTS
   ================================ */

/**
 * Pre-configured TabBar variants for common use cases
 */

export const DefaultTabs = React.forwardRef<
  any,
  Omit<TabBarProps, 'variant'> & ViewProps
>((props, ref) => <TabBar ref={ref} variant="default" {...props} />);
DefaultTabs.displayName = 'DefaultTabs';

export const PillTabs = React.forwardRef<
  any,
  Omit<TabBarProps, 'variant'> & ViewProps
>((props, ref) => <TabBar ref={ref} variant="pills" {...props} />);
PillTabs.displayName = 'PillTabs';

export const UnderlineTabs = React.forwardRef<
  any,
  Omit<TabBarProps, 'variant'> & ViewProps
>((props, ref) => <TabBar ref={ref} variant="underline" {...props} />);
UnderlineTabs.displayName = 'UnderlineTabs';

export const SegmentTabs = React.forwardRef<
  any,
  Omit<TabBarProps, 'variant'> & ViewProps
>((props, ref) => <TabBar ref={ref} variant="segment" {...props} />);
SegmentTabs.displayName = 'SegmentTabs';
