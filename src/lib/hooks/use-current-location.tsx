import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Minimum distance in meters to trigger an update
const MIN_DISTANCE_CHANGE = 1;

type Coordinates = {
  latitude: number;
  longitude: number;
};

function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

function hasSignificantChange(
  current: Location.LocationObject | null,
  newLocation: Location.LocationObject
): boolean {
  if (!current) return true;

  const distance = calculateDistance(
    {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    },
    {
      latitude: newLocation.coords.latitude,
      longitude: newLocation.coords.longitude,
    }
  );

  return distance >= MIN_DISTANCE_CHANGE;
}

function updateLocation(
  setLocation: (loc: Location.LocationObject) => void,
  setErrorMsg: (msg: string | null) => void,
  locationRef: React.MutableRefObject<Location.LocationObject | null>
) {
  return async () => {
    try {
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (hasSignificantChange(locationRef.current, newLocation)) {
        setLocation(newLocation);
        console.log(
          `\x1b[34m📍 Location Updated (${calculateDistance(
            {
              latitude: locationRef.current?.coords.latitude ?? 0,
              longitude: locationRef.current?.coords.longitude ?? 0,
            },
            {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            }
          ).toFixed(2)}m):`,
          `${JSON.stringify(newLocation, undefined, 2)}\x1b[0m`
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Error getting location');
    }
  };
}

function setupLocationWatch(
  setLocation: (loc: Location.LocationObject) => void,
  locationRef: React.MutableRefObject<Location.LocationObject | null>
) {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: MIN_DISTANCE_CHANGE,
    },
    (newLocation) => {
      if (hasSignificantChange(locationRef.current, newLocation)) {
        setLocation(newLocation);
        console.log(
          `\x1b[34m📍 Location Updated (${calculateDistance(
            {
              latitude: locationRef.current?.coords.latitude ?? 0,
              longitude: locationRef.current?.coords.longitude ?? 0,
            },
            {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            }
          ).toFixed(2)}m):`,
          `${JSON.stringify(newLocation, undefined, 2)}\x1b[0m`
        );
      }
    }
  );
}

export default function useCurrentLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const locationRef = useRef<Location.LocationObject | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const startLocationUpdates = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // Get initial location
        await updateLocation(setLocation, setErrorMsg, locationRef)();

        // For simulator, use interval to check location
        if (Platform.OS === 'ios' && __DEV__) {
          intervalId = setInterval(
            updateLocation(setLocation, setErrorMsg, locationRef),
            1000
          );
        } else {
          // For real devices, use watchPositionAsync
          locationSubscription = await setupLocationWatch(
            setLocation,
            locationRef
          );
        }
      } catch (error) {
        console.error('Error starting location updates:', error);
        setErrorMsg('Error starting location updates');
      }
    };

    startLocationUpdates();

    // Cleanup
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Update ref when location changes
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  return { location, errorMsg };
}
