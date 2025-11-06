/**
 * Avatar Component
 * A user profile picture component with online status and fallback options
 */

import React from 'react';
import type { ImageProps, ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';

import type { Theme } from '@/theme';

import {
  createAccessibilityProps,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import { Text } from './text';
import type { BaseComponentProps, SizeVariant } from './types';
import { View } from './view';
import { type FileSourceProps, withFileSource } from './withFileSource';

/* ================================
   AVATAR COMPONENT INTERFACE
   ================================ */

export interface AvatarProps extends BaseComponentProps {
  /** Image source for the avatar */
  source?: ImageSourcePropType;
  /** File ID to load image from */
  fileId?: string;
  /** Size variant */
  size?: SizeVariant | 'xs' | 'xl';
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Online status indicator */
  showStatus?: boolean;
  /** Whether user is online */
  isOnline?: boolean;
  /** Custom badge content */
  badge?: React.ReactNode;
  /** Border variant */
  variant?: 'default' | 'bordered' | 'none';
}

/* ================================
   STYLE CREATORS
   ================================ */

const createAvatarStyles = (theme: Theme, props: AvatarProps) => {
  const { size = 'medium', variant = 'default' } = props;

  const { colors, borderRadius } = theme;

  // Size variants
  const sizeStyles = {
    xs: { width: 24, height: 24 },
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  };

  // Variant styles
  const variantStyles = {
    default: {
      backgroundColor: colors.background.tertiary,
    },
    bordered: {
      backgroundColor: colors.background.tertiary,
      borderWidth: 2,
      borderColor: colors.surface.border,
    },
    none: {
      backgroundColor: 'transparent',
    },
  };

  return {
    ...sizeStyles[size],
    borderRadius: borderRadius.full,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
    ...variantStyles[variant],
  };
};

const createStatusIndicatorStyles = (theme: Theme, props: AvatarProps) => {
  const { size = 'medium', isOnline = false } = props;

  const { colors, borderRadius } = theme;

  // Status indicator sizes based on avatar size
  const statusSizes = {
    xs: { width: 6, height: 6, right: -1, bottom: -1 },
    small: { width: 8, height: 8, right: 0, bottom: 0 },
    medium: { width: 12, height: 12, right: 2, bottom: 2 },
    large: { width: 16, height: 16, right: 4, bottom: 4 },
    xl: { width: 20, height: 20, right: 6, bottom: 6 },
  };

  const statusSize = statusSizes[size];

  return {
    position: 'absolute' as const,
    width: statusSize.width,
    height: statusSize.height,
    borderRadius: borderRadius.full,
    backgroundColor: isOnline
      ? colors.semantic.success
      : colors.utility.mediumGray,
    borderWidth: 2,
    borderColor: colors.background.primary,
    right: statusSize.right,
    bottom: statusSize.bottom,
    zIndex: 1,
  };
};

const createFallbackTextStyles = (theme: Theme, props: AvatarProps) => {
  const { size = 'medium' } = props;

  const { colors } = theme;

  // Typography variants based on size
  const typographyVariants = {
    xs: 'overline' as const,
    small: 'caption' as const,
    medium: 'label' as const,
    large: 'h3' as const,
    xl: 'h2' as const,
  };

  return {
    color: colors.text.primary,
    ...(theme.typography[typographyVariants[size]] || theme.typography.label),
    fontWeight: '600' as const,
  };
};

/* ================================
   AVATAR BASE COMPONENT (Internal)
   ================================ */

interface AvatarBaseProps extends AvatarProps, FileSourceProps {}

const AvatarBase = React.forwardRef<
  any,
  AvatarBaseProps & Omit<ImageProps, 'source'>
>(
  (
    {
      source: directSource,
      sourceResult,
      isLoading,
      error,
      size = 'medium',
      fallback,
      showStatus = false,
      isOnline = false,
      badge,
      variant = 'default',
      style: userStyle,
      ...props
    },
    ref
  ) => {
    // Generate themed styles
    const avatarStyles = useThemedStyles(createAvatarStyles, {
      size,
      variant,
    });

    const statusStyles = useThemedStyles(createStatusIndicatorStyles, {
      size,
      isOnline,
    });

    const fallbackTextStyles = useThemedStyles(createFallbackTextStyles, {
      size,
    });

    // Merge with user-provided styles
    const finalStyle = mergeStyles(avatarStyles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createAccessibilityProps(props);

    // Determine which source to use: direct source takes precedence, then sourceResult from HOC
    const source = directSource || sourceResult;

    // Render avatar content
    const renderAvatarContent = () => {
      if (source) {
        return (
          <Image
            ref={ref}
            source={source}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            {...accessibilityProps}
            {...props}
            testID="avatar-image"
          />
        );
      }

      // Show loading state if file is being loaded
      if (isLoading) {
        return (
          <Text style={fallbackTextStyles} numberOfLines={1}>
            ...
          </Text>
        );
      }

      // Show error state if file failed to load
      if (error && fallback) {
        return (
          <Text style={fallbackTextStyles} numberOfLines={1}>
            {fallback}
          </Text>
        );
      }

      if (fallback) {
        return (
          <Text style={fallbackTextStyles} numberOfLines={1}>
            {fallback}
          </Text>
        );
      }

      // Default fallback - user icon or placeholder
      return (
        <Text style={fallbackTextStyles} numberOfLines={1}>
          ?
        </Text>
      );
    };

    return (
      <View style={finalStyle}>
        {renderAvatarContent()}

        {/* Status indicator */}
        {showStatus && <View style={statusStyles} />}

        {/* Custom badge */}
        {badge && (
          <View style={{ position: 'absolute', top: -4, right: -4, zIndex: 2 }}>
            {badge}
          </View>
        )}
      </View>
    );
  }
);

AvatarBase.displayName = 'AvatarBase';

/* ================================
   AVATAR COMPONENT
   ================================ */

/**
 * Avatar component with file loading support
 * Can use either direct `source` prop or `fileId` prop to load from API
 */
// @ts-expect-error - TS2347: Type inference works correctly without explicit type arguments
// @ts-expect-error - TS2607: HOC wrapper properly supports JSX attributes
export const Avatar = withFileSource(AvatarBase, {
  autoLoad: true,
  logErrors: true,
}) as React.ForwardRefExoticComponent<
  AvatarProps & Omit<ImageProps, 'source'> & React.RefAttributes<any>
>;

Avatar.displayName = 'Avatar';

/* ================================
   AVATAR GROUP COMPONENT
   ================================ */

/**
 * Component for displaying multiple avatars in a group/stack
 */

export interface AvatarGroupProps extends BaseComponentProps {
  /** Array of avatar sources or props */
  avatars: (ImageSourcePropType | AvatarProps)[];
  /** Maximum number of avatars to show */
  max?: number;
  /** Size of avatars in the group */
  size?: SizeVariant | 'xs' | 'xl';
  /** Overlap amount in pixels */
  overlap?: number;
  /** Custom style */
  style?: any;
}

export const AvatarGroup = React.forwardRef<any, AvatarGroupProps>(
  (
    {
      avatars,
      max = 4,
      size = 'medium',
      overlap = 8,
      style: userStyle,
      ...props
    },
    ref
  ) => {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = Math.max(0, avatars.length - max);

    const containerStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    };

    const finalStyle = mergeStyles(containerStyle, userStyle);

    return (
      <View ref={ref} style={finalStyle} {...props}>
        {visibleAvatars.map((avatar, index) => (
          <View
            key={index}
            style={{
              marginLeft: index > 0 ? -overlap : 0,
              zIndex: visibleAvatars.length - index,
            }}
          >
            {typeof avatar === 'object' && 'source' in avatar ? (
              <Avatar {...avatar} size={size} />
            ) : (
              <Avatar source={avatar as ImageSourcePropType} size={size} />
            )}
          </View>
        ))}

        {remainingCount > 0 && (
          <View style={{ marginLeft: -overlap, zIndex: 0 }}>
            <Avatar
              size={size}
              fallback={`+${remainingCount}`}
              variant="bordered"
            />
          </View>
        )}
      </View>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

/* ================================
   AVATAR VARIANT COMPONENTS
   ================================ */

/**
 * Pre-configured avatar variants for common use cases
 */

export const UserAvatar = React.forwardRef<
  any,
  Omit<AvatarProps, 'showStatus'> & Omit<ImageProps, 'source'>
>((props, ref) => <Avatar ref={ref} showStatus={true} {...props} />);
UserAvatar.displayName = 'UserAvatar';

export const TeamMemberAvatar = React.forwardRef<
  any,
  Omit<AvatarProps, 'variant'> & Omit<ImageProps, 'source'>
>((props, ref) => <Avatar ref={ref} variant="bordered" {...props} />);
TeamMemberAvatar.displayName = 'TeamMemberAvatar';
