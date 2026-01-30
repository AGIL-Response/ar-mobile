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
import { MarkerView } from '@rnmapbox/maps';
import { Svg, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Avatar } from '@/components';
import { useTheme, type Theme } from '@/theme';
import { View } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';
import { useUsersStore } from '@/stores/users';
import { useDeviceHeading } from '@/lib/hooks/use-device-heading';

interface CurrentUserMarkerProps {
  /** Size of the avatar */
  size?: 'xs' | 'small' | 'medium' | 'large' | 'xl';
}

/**
 * CurrentUserMarker - Enhanced marker for the logged-in responder
 * Features:
 * - Distinct blue radar-style ring
 * - Pulsing animation for visibility
 * - Blue border to differentiate from other responders
 * - Directional radar cone based on device heading
 * - Automatically handles location and user data
 */
export function CurrentUserMarker({ size = 'small' }: CurrentUserMarkerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const currentUser = useAuthStore((state) => state.user);
  const locationCoordinates = useLocationStore((state) => state.coordinates);
  const users = useUsersStore((state) => state.users);
  const { heading } = useDeviceHeading();

  // Device location marker for current user
  const deviceLocationCoordinates = useMemo<[number, number] | null>(() => {
    if (!locationCoordinates || !currentUser?.avatarId) {
      return null;
    }
    // Use device GPS location from location store
    return [
      locationCoordinates.longitude,
      locationCoordinates.latitude,
    ];
  }, [locationCoordinates, currentUser?.avatarId]);

  // Get current user's status from users store if available
  const currentUserStatus = useMemo(() => {
    if (!currentUser?.id) {
      return 'unknown';
    }
    const userInStore = users.find((user) => user.id === currentUser.id);
    return userInStore?.status || 'unknown';
  }, [currentUser?.id, users]);

  // Animation values for pulsing effect (must be called before early return)
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

  // Get device heading for directional radar cone
  const deviceHeading = useMemo(() => {
    if (!heading) {
      return null;
    }
    // Use true heading if available, otherwise use magnetic heading
    return heading.trueHeading ?? heading.magneticHeading;
  }, [heading]);

  // Animated style for directional radar cone rotation
  const radarConeRotation = useSharedValue(deviceHeading ?? 0);
  
  useEffect(() => {
    if (deviceHeading !== null) {
      radarConeRotation.value = withTiming(deviceHeading, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [deviceHeading, radarConeRotation]);

  const radarConeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarConeRotation.value}deg` }],
  }));

  // Get dimensions based on avatar size
  const markerDimensions = getMarkerDimensions(size);

  // Don't render if we don't have coordinates or avatar (after all hooks)
  if (!deviceLocationCoordinates || !currentUser?.avatarId) {
    return null;
  }

  return (
    <MarkerView
      key="current-user-device-location-marker"
      coordinate={deviceLocationCoordinates}
      allowOverlapWithPuck={false}
      allowOverlap
    >
      <View style={[styles.container, { width: markerDimensions.containerSize, height: markerDimensions.containerSize }]}>
        {/*/!* Outer radar ring 1 - blue, expanding and fading *!/*/}
        {/*<Animated.View*/}
        {/*  style={[*/}
        {/*    styles.radarRing,*/}
        {/*    {*/}
        {/*      width: markerDimensions.radarSize,*/}
        {/*      height: markerDimensions.radarSize,*/}
        {/*      borderRadius: markerDimensions.radarSize / 2,*/}
        {/*      borderWidth: markerDimensions.radarBorderWidth,*/}
        {/*    },*/}
        {/*    radarRingStyle,*/}
        {/*  ]}*/}
        {/*/>*/}

        {/*/!* Outer radar ring 2 - blue, expanding and fading with delay *!/*/}
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

        {/*/!* Pulsing ring - blue, pulsing effect *!/*/}
        {/*<Animated.View*/}
        {/*  style={[*/}
        {/*    styles.pulseRing,*/}
        {/*    {*/}
        {/*      width: markerDimensions.pulseSize,*/}
        {/*      height: markerDimensions.pulseSize,*/}
        {/*      borderRadius: markerDimensions.pulseSize / 2,*/}
        {/*      borderWidth: markerDimensions.pulseBorderWidth,*/}
        {/*    },*/}
        {/*    pulseRingStyle,*/}
        {/*  ]}*/}
        {/*/>*/}

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
            fileId={currentUser.avatarId}
            status={currentUserStatus}
            size={size}
            isMapAvatar={false}
            style={styles.avatarBorder}
          />
        </View>

        {/* Directional radar cone - shows device facing direction */}
        {deviceHeading !== null && (
          <Animated.View
            style={[
              styles.radarConeContainer,
              {
                width: markerDimensions.containerSize * 1.5,
                height: markerDimensions.containerSize * 1.5,
                marginTop: -(markerDimensions.containerSize * 1.5) / 2,
                marginLeft: -(markerDimensions.containerSize * 1.5) / 2,
              },
              radarConeStyle,
            ]}
            pointerEvents="none"
          >
            <Svg
              width={markerDimensions.containerSize * 1.5}
              height={markerDimensions.containerSize * 1.5}
              viewBox={`0 0 ${markerDimensions.containerSize * 1.5} ${markerDimensions.containerSize * 1.5}`}
            >
              <Defs>
                <RadialGradient
                  id="radarConeGradient"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <Stop offset="0%" stopColor={theme.colors.semantic.blue} stopOpacity="1" />
                  <Stop offset="100%" stopColor={theme.colors.semantic.blue} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Path
                d={createRadarConePath(
                  (markerDimensions.containerSize * 1.5) / 2,
                  (markerDimensions.containerSize * 1.5) / 2,
                  markerDimensions.containerSize * 0.5,
                  50 // cone angle in degrees
                )}
                fill="url(#radarConeGradient)"
              />
            </Svg>
          </Animated.View>
        )}
      </View>
    </MarkerView>
  );
}

/**
 * Create SVG path for radar cone shape
 * @param centerX - X coordinate of center
 * @param centerY - Y coordinate of center
 * @param radius - Radius of the cone
 * @param angleDegrees - Angle of the cone in degrees
 */
function createRadarConePath(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number
): string {
  const halfAngle = angleDegrees / 2;
  const startAngle = -halfAngle;
  const endAngle = halfAngle;

  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  // Calculate start and end points
  const startX = centerX + radius * Math.sin(startRad);
  const startY = centerY - radius * Math.cos(startRad);
  const endX = centerX + radius * Math.sin(endRad);
  const endY = centerY - radius * Math.cos(endRad);

  // Create arc path (large arc flag = 0 for angles < 180)
  const largeArcFlag = angleDegrees > 180 ? 1 : 0;

  return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
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
    radarConeContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
  });
