/**
 * Avatar Component
 * A user profile picture component with online status and fallback options
 */

import React from 'react';
import type { ImageProps, ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';

import { type Theme } from '@/theme';

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
  /** User status for border color (active, idle, inactive) */
  status?: string;
  /** Whether this is a map avatar with glowing rings */
  isMapAvatar?: boolean;
  /** Color for the rings (defaults to warning/orange) */
  ringColor?: string;
  /** Opacity of the outer glow ring */
  outerRingOpacity?: number;
}

export interface MapAvatarProps extends Omit<AvatarProps, 'size'> {
  /** Size of the avatar (not the entire marker) */
  avatarSize?: AvatarProps['size'];
  /** Whether the marker is pressable */
  onPress?: () => void;
  /** Color for the rings (defaults to warning/orange) */
  ringColor?: string;
  /** Opacity of the outer glow ring */
  outerRingOpacity?: number;
}

/* ================================
   STATUS COLOR HELPER
   ================================ */

/**
 * Get status border color based on user status
 * @param status - User status string (active, idle, inactive)
 * @returns Color string for border
 */
type StatusColorType = 'border' | 'outerRing' | 'innerRing';
type StatusColorKey = 'active' | 'idle' | 'inactive' | 'unknown' | 'default';

const statusColorMap: Record<
  StatusColorType,
  Record<StatusColorKey, string>
> = {
  border: {
    active: '#42A542', // Green for active
    idle: '#FA8C16', // Yellow/Orange for idle
    inactive: '#FF3C3C', // Red for inactive
    unknown: '#9CA3AF', // Gray for unknown status
    default: '#6B7280', // Gray for unknown/no status
  },
  outerRing: {
    active: '#42A54233', // Green for active
    idle: '#FA8C1633', // Yellow/Orange for idle
    inactive: '#FF3C3C33', // Red with transparency
    unknown: '#9CA3AF33', // Default gray with transparency
    default: '#6B728033',
  },
  innerRing: {
    active: '#42A5421A', // Green for active
    idle: '#FA8C161A', // Yellow/Orange for idle
    inactive: '#FF3C3C1A', // Red with transparency
    unknown: '#9CA3AF1A', // Default gray with transparency
    default: '#6B72801A',
  },
};

// Unified status-to-color function
function getStatusColorByType(type: StatusColorType, status?: string): string {
  const colorSet = statusColorMap[type];
  if (!status) {
    return colorSet.default;
  }

  const normalizedStatus = status.toLowerCase();
  let statusKey: StatusColorKey = 'unknown';

  switch (normalizedStatus) {
    case 'active':
      statusKey = 'active';
      break;
    case 'idle':
      statusKey = 'idle';
      break;
    case 'inactive':
      statusKey = 'inactive';
      break;
    default:
      statusKey = 'unknown';
  }

  return colorSet[statusKey] ?? colorSet.default;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createAvatarStyles = (theme: Theme, props: AvatarProps) => {
  const { size = 'medium', variant = 'default', status } = props;

  const { colors, borderRadius } = theme;

  // Size variants
  const sizeStyles = {
    xs: { width: 24, height: 24 },
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  };

  // Variant styles (only apply if status is not provided)
  const variantStyles = status
    ? {
        backgroundColor: colors.background.tertiary,
      }
    : {
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
      }[variant];

  return {
    ...sizeStyles[size],
    borderRadius: borderRadius.full,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
    ...variantStyles,
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

type MapAvatarSize = NonNullable<AvatarProps['size']>;

const defaultMapAvatarSize: MapAvatarSize = 'medium';

const mapAvatarDimensions: Record<
  MapAvatarSize,
  {
    outerDiameter: number;
    outerBorderWidth: number;
    innerDiameter: number;
    innerBorderWidth: number;
  }
> = {
  xs: {
    outerDiameter: 48,
    outerBorderWidth: 2,
    innerDiameter: 32,
    innerBorderWidth: 2,
  },
  small: {
    outerDiameter: 64,
    outerBorderWidth: 2,
    innerDiameter: 42,
    innerBorderWidth: 3,
  },
  medium: {
    outerDiameter: 84,
    outerBorderWidth: 3,
    innerDiameter: 58,
    innerBorderWidth: 3,
  },
  large: {
    outerDiameter: 108,
    outerBorderWidth: 3,
    innerDiameter: 80,
    innerBorderWidth: 4,
  },
  xl: {
    outerDiameter: 140,
    outerBorderWidth: 4,
    innerDiameter: 110,
    innerBorderWidth: 4,
  },
};

const getMapAvatarDimensions = (size?: MapAvatarSize) => {
  if (!size) {
    return mapAvatarDimensions[defaultMapAvatarSize];
  }
  return mapAvatarDimensions[size] ?? mapAvatarDimensions[defaultMapAvatarSize];
};

const createMapAvatarStyles = (
  theme: Theme,
  props: {
    size?: MapAvatarSize;
    ringBorderColor: string;
    outerRingColor: string;
    innerFillColor: string;
    outerRingOpacity: number;
  }
) => {
  const { outerDiameter, outerBorderWidth, innerDiameter, innerBorderWidth } =
    getMapAvatarDimensions(props.size);

  return {
    mapContainer: {
      width: outerDiameter,
      height: outerDiameter,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      position: 'relative' as const,
    },
    outerRing: {
      position: 'absolute' as const,
      width: outerDiameter,
      height: outerDiameter,
      borderRadius: outerDiameter / 2,
      borderWidth: outerBorderWidth,
      borderColor: props.ringBorderColor,
      backgroundColor: props.outerRingColor,
      opacity: props.outerRingOpacity,
    },
    innerRing: {
      width: innerDiameter,
      height: innerDiameter,
      borderRadius: innerDiameter / 2,
      borderWidth: innerBorderWidth,
      borderColor: props.ringBorderColor,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: props.innerFillColor || theme.colors.background.primary,
      overflow: 'hidden' as const,
    },
    avatarWrapper: {
      width: '100%',
      height: '100%',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
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
      status,
      style: userStyle,
      isMapAvatar = false,
      ringColor,
      outerRingOpacity = 0.4,
      ...props
    },
    ref
  ) => {
    const ringBorderColor = ringColor ?? getStatusColorByType('border', status);
    const outerRingColor = getStatusColorByType('outerRing', status);
    const innerFillColor = getStatusColorByType('innerRing', status);

    // Generate themed styles
    const avatarStyles = useThemedStyles(createAvatarStyles, {
      size,
      variant,
      status,
    });

    const statusStyles = useThemedStyles(createStatusIndicatorStyles, {
      size,
      isOnline,
    });

    const fallbackTextStyles = useThemedStyles(createFallbackTextStyles, {
      size,
    });

    // Generate map avatar styles (always call hook, but only use if isMapAvatar is true)
    const mapAvatarStyles = useThemedStyles(createMapAvatarStyles, {
      size,
      ringBorderColor,
      outerRingColor,
      innerFillColor,
      outerRingOpacity,
    });

    // Merge with user-provided styles
    const mergedStyle = mergeStyles(avatarStyles, userStyle);

    // Apply status border styles last to ensure they override user styles
    // But don't apply status border if it's a map avatar (rings handle the border)
    const finalStyle =
      isMapAvatar || !status
        ? mergedStyle
        : {
            ...mergedStyle,
            borderWidth: 3,
            borderColor: getStatusColorByType('border', status),
          };

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

    // Render avatar content
    const avatarContent = (
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

    // If map avatar, wrap in rings
    if (isMapAvatar) {
      return (
        <View style={mapAvatarStyles.mapContainer} collapsable={false}>
          <View style={mapAvatarStyles.outerRing} />
          <View style={mapAvatarStyles.innerRing}>
            <View style={mapAvatarStyles.avatarWrapper}>{avatarContent}</View>
          </View>
        </View>
      );
    }

    return avatarContent;
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
