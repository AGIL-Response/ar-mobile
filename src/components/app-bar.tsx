/**
 * AppBar Component
 * A flexible header/navigation bar component for consistent app navigation
 */

import React from 'react';
import type { ViewProps } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Theme } from '@/theme';

import { Badge } from './badge';
import {
  createAccessibilityProps,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import { Icon, iconNames } from './icon';
import { Text } from './text';
import type { BaseContainerProps } from './types';
import { View } from './view';

/* ================================
   APPBAR COMPONENT INTERFACE
   ================================ */

export type AppBarTitleAlign = 'left' | 'center' | 'right';
export interface AppBarProps extends Omit<BaseContainerProps, 'padding'> {
  /** AppBar variant */
  variant?: 'header' | 'bottom-navigation' | 'status-bar';
  /** Title text */
  title?: string;
  /** Title font family */
  titleFontFamily?: string;
  /** Title alignment */
  titleAlign?: AppBarTitleAlign;
  /** Left side content (back button, logo, etc.) */
  leftContent?: React.ReactNode;
  /** Right side content (actions, avatar, etc.) */
  rightContent?: React.ReactNode;
  /** Center content (search bar, custom title, etc.) */
  centerContent?: React.ReactNode;
  /** Whether to include safe area padding */
  safeArea?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Elevation/shadow level */
  elevation?: 'none' | 'low' | 'medium' | 'high';
  /** Show default back button when leftContent is not provided */
  showBackButton?: boolean;
  /** Callback for back button press (required when showBackButton is true) */
  onBackPress?: () => void;
}

export interface StatusBarProps extends Omit<AppBarProps, 'variant'> {
  /** Current time display */
  time?: string;
  /** Signal strength indicator */
  signal?: 'cellular' | 'wifi' | 'offline';
  /** Battery level (0-100) */
  batteryLevel?: number;
}

export interface NavigationItemProps {
  /** Icon element */
  icon?: React.ReactNode;
  /** Item label */
  label?: string;
  /** Whether item is active */
  active?: boolean;
  /** Badge content */
  badge?: string | number;
  /** Press handler */
  onPress?: () => void;
  /** Test ID */
  testID?: string;
}

export interface BottomNavigationProps extends Omit<AppBarProps, 'variant'> {
  /** Navigation items */
  items: NavigationItemProps[];
  /** Currently active item index */
  activeIndex?: number;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createAppBarStyles = (theme: Theme, props: AppBarProps) => {
  const { variant = 'header', elevation = 'low' } = props;

  const { colors, spacing } = theme;

  // Base styles
  const baseStyles = {
    backgroundColor: props.backgroundColor || colors.background.primary,
    width: '100%',
  };

  // Variant-specific styles
  const variantStyles = {
    'status-bar': {
      height: 44,
      paddingHorizontal: spacing.padding.md,
      paddingTop: spacing.padding.xs,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    header: {
      minHeight: 56,
      paddingHorizontal: spacing.padding.md,
      paddingVertical: spacing.padding.sm,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 16,
      borderBottomWidth: 1,
      backgroundColor: colors.background.secondary,
    },
    'bottom-navigation': {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      paddingTop: spacing.padding.sm,
      paddingBottom: spacing.padding.lg,
      paddingHorizontal: spacing.padding.md,
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
      alignItems: 'center' as const,
      borderTopWidth: 1,
      borderTopColor: colors.surface.border,
    },
  };

  // Elevation styles
  const elevationStyles = {
    none: {},
    low: {
      shadowColor: colors.semantic.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.semantic.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    high: {
      shadowColor: colors.semantic.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant],
    ...elevationStyles[elevation],
  };
};

const createContentStyles = (theme: Theme, props: AppBarProps) => {
  const { variant = 'header' } = props;
  const { spacing } = theme;

  return {
    left: {
      flex: variant === 'header' ? 0 : 1,
      alignItems: 'flex-start' as const,
    },
    center: {
      flex: variant === 'header' ? 1 : 0,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: spacing.padding.sm,
    },
    right: {
      flex: variant === 'header' ? 0 : 1,
      alignItems: 'flex-end' as const,
    },
  };
};

const createNavigationItemStyles = (theme: Theme, active: boolean) => {
  const { colors, spacing } = theme;

  return {
    container: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.padding.xs,
      paddingHorizontal: spacing.padding.sm,
      minWidth: 60,
      position: 'relative' as const,
    },
    label: {
      marginTop: spacing.padding.xs / 2,
      color: active ? colors.primary : colors.text.secondary,
    },
  };
};

/* ================================
   APPBAR COMPONENT
   ================================ */

export const AppBar = React.forwardRef<any, AppBarProps & ViewProps>(
  (
    {
      variant = 'header',
      title,
      titleAlign = 'center',
      leftContent,
      rightContent,
      centerContent,
      safeArea = true,
      elevation = 'low',
      showBackButton = false,
      onBackPress,
      children,
      style: userStyle,
      ...props
    },
    ref
  ) => {
    // Generate themed styles
    const appBarStyles = useThemedStyles(createAppBarStyles, {
      variant,
      elevation,
      safeArea,
      backgroundColor: props.backgroundColor,
    });

    const contentStyles = useThemedStyles(createContentStyles, { variant });

    // Get theme colors for back button
    const theme = useThemedStyles((theme: Theme) => theme, {});

    // Merge with user-provided styles
    const finalStyle = mergeStyles(appBarStyles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createAccessibilityProps(props);

    // Create default back button if needed
    const getLeftContent = () => {
      if (leftContent) return leftContent;
      if (showBackButton && onBackPress) {
        return (
          <TouchableOpacity onPress={onBackPress}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
              }}
            >
              <Icon
                name={iconNames.chevron_left}
                size={24}
                color={theme.colors.text.icon}
              />
            </View>
          </TouchableOpacity>
        );
      }
      return null;
    };

    // Render content based on variant
    const renderContent = () => {
      if (children) return children;

      if (variant === 'status-bar') {
        return (
          <>
            <View style={contentStyles.left}>{getLeftContent()}</View>
            <View style={contentStyles.center}>
              {centerContent ||
                (title && <Text variant="caption">{title}</Text>)}
            </View>
            <View style={contentStyles.right}>{rightContent}</View>
          </>
        );
      }

      return (
        <View
          style={{
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={contentStyles.left}>
            {leftContent ||
              (titleAlign === 'left' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {getLeftContent()}
                  {title && (
                    <View style={{ marginLeft: getLeftContent() ? 8 : 0 }}>
                      <Text
                        variant="h3"
                        style={{ fontFamily: props.titleFontFamily }}
                      >
                        {title}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                getLeftContent()
              ))}
          </View>

          <View style={contentStyles.center}>
            {titleAlign === 'center'
              ? centerContent || (
                  <Text
                    variant="h3"
                    style={{ fontFamily: props.titleFontFamily }}
                  >
                    {title}
                  </Text>
                )
              : centerContent}
          </View>

          <View style={contentStyles.right}>
            {titleAlign === 'right' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  variant="h3"
                  style={{ fontFamily: props.titleFontFamily }}
                >
                  {title}
                </Text>
                {rightContent}
              </View>
            ) : (
              rightContent || (showBackButton && <View style={{ width: 32 }} />)
            )}
          </View>
        </View>
      );
    };

    const Container = safeArea ? SafeAreaView : View;

    return (
      <Container
        ref={ref}
        style={finalStyle}
        {...accessibilityProps}
        {...props}
      >
        {renderContent()}
      </Container>
    );
  }
);

AppBar.displayName = 'AppBar';

/* ================================
   NAVIGATION ITEM COMPONENT
   ================================ */

export const NavigationItem = React.forwardRef<
  any,
  NavigationItemProps & ViewProps
>(
  (
    { icon, label, active = false, badge, onPress, style: userStyle, ...props },
    ref
  ) => {
    const itemStyles = useThemedStyles(createNavigationItemStyles, active);
    const finalStyle = mergeStyles(itemStyles.container, userStyle);

    return (
      <View ref={ref} style={finalStyle} onTouchEnd={onPress} {...props}>
        {/* Icon */}
        <View style={{ position: 'relative' }}>
          {icon}
          {badge && (
            <View style={{ position: 'absolute', top: -6, right: -6 }}>
              <Badge
                label={badge.toString()}
                size="small"
                colorVariant={
                  typeof badge === 'number' && badge > 0 ? 'error' : 'neutral'
                }
              />
            </View>
          )}
        </View>

        {/* Label */}
        {label && (
          <Text variant="overline" style={itemStyles.label}>
            {label}
          </Text>
        )}
      </View>
    );
  }
);

NavigationItem.displayName = 'NavigationItem';

/* ================================
   BOTTOM NAVIGATION COMPONENT
   ================================ */

export const BottomNavigation = React.forwardRef<
  any,
  BottomNavigationProps & ViewProps
>(({ items, activeIndex = 0, ...props }, ref) => {
  return (
    <AppBar ref={ref} variant="bottom-navigation" {...props}>
      {items.map((item, index) => (
        <NavigationItem key={index} {...item} active={index === activeIndex} />
      ))}
    </AppBar>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

/* ================================
   STATUS BAR COMPONENT
   ================================ */

export const StatusBar = React.forwardRef<any, StatusBarProps & ViewProps>(
  (
    { time = '9:41', signal = 'cellular', batteryLevel = 100, ...props },
    ref
  ) => {
    return (
      <AppBar
        ref={ref}
        variant="status-bar"
        leftContent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {/* Signal indicator - would be replaced with actual icons */}
            <Text variant="caption">
              {signal === 'cellular'
                ? '●●●●'
                : signal === 'wifi'
                  ? 'WiFi'
                  : '○○○○'}
            </Text>
          </View>
        }
        centerContent={<Text variant="label">{time}</Text>}
        rightContent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {/* Battery indicator */}
            <Text variant="caption">{batteryLevel}%</Text>
            <Text variant="caption">🔋</Text>
          </View>
        }
        {...props}
      />
    );
  }
);

StatusBar.displayName = 'StatusBar';

/* ================================
   APPBAR VARIANT COMPONENTS
   ================================ */

/**
 * Pre-configured AppBar variants for common use cases
 */

export const HeaderBar = React.forwardRef<
  any,
  Omit<AppBarProps, 'variant'> & ViewProps
>((props, ref) => <AppBar ref={ref} variant="header" {...props} />);
HeaderBar.displayName = 'HeaderBar';

export const SimpleHeader = React.forwardRef<
  any,
  Omit<AppBarProps, 'variant' | 'leftContent' | 'rightContent'> & {
    showBack?: boolean;
    onBack?: () => void;
  } & ViewProps
>(({ showBack = false, onBack, ...props }, ref) => (
  <HeaderBar
    ref={ref}
    leftContent={
      showBack ? (
        <Text onPress={onBack} variant="button">
          ← Back
        </Text>
      ) : undefined
    }
    {...props}
  />
));
SimpleHeader.displayName = 'SimpleHeader';
