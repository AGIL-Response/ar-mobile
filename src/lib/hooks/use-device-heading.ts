/**
 * useDeviceHeading Hook
 * Tracks device heading/bearing using expo-location
 */

import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export interface DeviceHeading {
  /** Magnetic heading in degrees (0-360) */
  magneticHeading: number;
  /** True heading in degrees (0-360) - requires location permission */
  trueHeading: number | null;
  /** Heading accuracy in degrees */
  accuracy: number;
}

export function useDeviceHeading() {
  const [heading, setHeading] = useState<DeviceHeading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startHeadingUpdates = async () => {
      try {
        // Check if heading is available
        const hasHeading = await Location.hasServicesEnabledAsync();
        if (!hasHeading) {
          setError('Device heading services not available');
          return;
        }

        // Request location permission (needed for true heading)
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission required for heading');
          return;
        }

        // Watch heading updates
        subscriptionRef.current = await Location.watchHeadingAsync(
          (headingData) => {
            if (isMounted) {
              setHeading({
                magneticHeading: headingData.magHeading,
                trueHeading: headingData.trueHeading ?? null,
                accuracy: headingData.accuracy,
              });
              setError(null);
            }
          }
        );
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to start heading updates');
        }
      }
    };

    startHeadingUpdates();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return { heading, error };
}
