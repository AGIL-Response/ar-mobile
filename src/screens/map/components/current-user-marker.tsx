/**
 * CurrentUserMarker Component
 * Enhanced marker for the logged-in responder with pulsing animation and radar ring
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Avatar } from '@/components';
import { useTheme, type Theme } from '@/theme';
import { View } from '@/components';

interface CurrentUserMarkerProps {
  /** File ID for the avatar image */
  fileId: string;
  /** User status (active, idle, inactive, unknown) */
  status?: string;
  /** Size of the avatar */
  size?: 'xs' | 'small' | 'medium' | 'large' | 'xl';
}

/**
 * CurrentUserMarker - Enhanced marker for the logged-in responder
 * Features:
 * - Distinct blue radar-style ring
 * - Pulsing animation for visibility
 * - Blue border to differentiate from other responders
 */
export function CurrentUserMarker({
  fileId,
  status = 'unknown',
  size = 'small',
}: CurrentUserMarkerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Animation values for pulsing effect
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const radarScale = useSharedValue(1);
  const radarOpacity = useSharedValue(0.4);
  const radarScale2 = useSharedValue(1);
  const radarOpacity2 = useSharedValue(0.4);

  useEffect(() => {
    // Pulsing animation for the outer ring
    pulseScale.value = withRepeat(
      withTiming(1.3, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    pulseOpacity.value = withRepeat(
      withTiming(0.2, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Radar ring animation (slower, more subtle - expands outward and fades)
    // Uses sequence to reset smoothly after each cycle
    radarScale.value = withRepeat(
      withSequence(
        withTiming(1.5, {
          duration: 2000,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(1, {
          duration: 0, // Instant reset
        })
      ),
      -1,
      false
    );

    radarOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, {
          duration: 0, // Start at full opacity
        }),
        withTiming(0, {
          duration: 2000,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0.4, {
          duration: 0, // Instant reset
        })
      ),
      -1,
      false
    );

    // Second radar ring with delay for layered effect
    radarScale2.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1000, // Delay before starting
        }),
        withTiming(1.5, {
          duration: 2000,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(1, {
          duration: 0, // Instant reset
        })
      ),
      -1,
      false
    );

    radarOpacity2.value = withRepeat(
      withSequence(
        withTiming(0, {
          duration: 1000, // Delay before starting
        }),
        withTiming(0.4, {
          duration: 0, // Start at full opacity
        }),
        withTiming(0, {
          duration: 2000,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0.4, {
          duration: 0, // Instant reset
        })
      ),
      -1,
      false
    );
  }, [pulseScale, pulseOpacity, radarScale, radarOpacity, radarScale2, radarOpacity2]);

  // Animated styles for pulsing ring
  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Animated styles for radar ring
  const radarRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radarScale.value }],
    opacity: radarOpacity.value,
  }));

  // Animated styles for second radar ring
  const radarRingStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: radarScale2.value }],
    opacity: radarOpacity2.value,
  }));

  // Get dimensions based on avatar size
  const markerDimensions = getMarkerDimensions(size);

  return (
    <View style={[styles.container, { width: markerDimensions.containerSize, height: markerDimensions.containerSize }]}>
      {/* Outer radar ring 1 - blue, expanding and fading */}
      <Animated.View
        style={[
          styles.radarRing,
          {
            width: markerDimensions.radarSize,
            height: markerDimensions.radarSize,
            borderRadius: markerDimensions.radarSize / 2,
            borderWidth: markerDimensions.radarBorderWidth,
          },
          radarRingStyle,
        ]}
      />

      {/* Outer radar ring 2 - blue, expanding and fading with delay */}
      <Animated.View
        style={[
          styles.radarRing,
          {
            width: markerDimensions.radarSize,
            height: markerDimensions.radarSize,
            borderRadius: markerDimensions.radarSize / 2,
            borderWidth: markerDimensions.radarBorderWidth,
          },
          radarRingStyle2,
        ]}
      />

      {/* Pulsing ring - blue, pulsing effect */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: markerDimensions.pulseSize,
            height: markerDimensions.pulseSize,
            borderRadius: markerDimensions.pulseSize / 2,
            borderWidth: markerDimensions.pulseBorderWidth,
          },
          pulseRingStyle,
        ]}
      />

      {/* Static blue border ring */}
      <View
        style={[
          styles.staticRing,
          {
            width: markerDimensions.staticSize,
            height: markerDimensions.staticSize,
            borderRadius: markerDimensions.staticSize / 2,
            borderWidth: markerDimensions.staticBorderWidth,
          },
        ]}
      />

      {/* Avatar with blue border indicator */}
      <View style={styles.avatarContainer}>
        <Avatar
          fileId={fileId}
          status={status}
          size={size}
          isMapAvatar={false}
          style={styles.avatarBorder}
        />
      </View>
    </View>
  );
}

/**
 * Get marker dimensions based on avatar size
 */
function getMarkerDimensions(size: CurrentUserMarkerProps['size']) {
  const dimensions = {
    small: {
      containerSize: 80,
      radarSize: 80,
      radarBorderWidth: 2,
      pulseSize: 64,
      pulseBorderWidth: 2,
      staticSize: 64,
      staticBorderWidth: 2,
    },
    medium: {
      containerSize: 96,
      radarSize: 96,
      radarBorderWidth: 2,
      pulseSize: 76,
      pulseBorderWidth: 2,
      staticSize: 64,
      staticBorderWidth: 2,
    },
    large: {
      containerSize: 112,
      radarSize: 112,
      radarBorderWidth: 2,
      pulseSize: 88,
      pulseBorderWidth: 3,
      staticSize: 76,
      staticBorderWidth: 3,
    },
    xs: {
      containerSize: 64,
      radarSize: 64,
      radarBorderWidth: 1.5,
      pulseSize: 52,
      pulseBorderWidth: 1.5,
      staticSize: 40,
      staticBorderWidth: 1.5,
    },
    xl: {
      containerSize: 128,
      radarSize: 128,
      radarBorderWidth: 2,
      pulseSize: 100,
      pulseBorderWidth: 3,
      staticSize: 88,
      staticBorderWidth: 3,
    },
  };

  return dimensions[size || 'small'];
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    radarRing: {
      position: 'absolute',
      borderColor: theme.colors.semantic.blue,
      backgroundColor: 'transparent',
    },
    pulseRing: {
      position: 'absolute',
      borderColor: theme.colors.semantic.blue,
      backgroundColor: 'transparent',
    },
    staticRing: {
      position: 'absolute',
      borderColor: theme.colors.semantic.blue,
      backgroundColor: 'transparent',
    },
    avatarContainer: {
      zIndex: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarBorder: {
      borderWidth: 3,
      borderColor: theme.colors.semantic.blue,
    },
  });
