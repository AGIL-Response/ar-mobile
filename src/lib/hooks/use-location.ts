/**
 * useLocation Hook
 * Handles location permissions and device location retrieval
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationState {
  // Permission status
  hasPermission: boolean | null; // null = not checked yet, true = granted, false = denied
  isLoading: boolean;
  error: string | null;
  
  // Location data
  location: Location.LocationObject | null;
  coordinates: [number, number, number] | null; // [longitude, latitude, altitude]
}

export interface LocationActions {
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

export interface UseLocationReturn extends LocationState {
  actions: LocationActions;
}

export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<LocationState>({
    hasPermission: null,
    isLoading: false,
    error: null,
    location: null,
    coordinates: null,
  });

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { status } = await Location.getForegroundPermissionsAsync();
      const hasPermission = status === Location.PermissionStatus.GRANTED;
      
      setState(prev => ({ 
        ...prev, 
        hasPermission,
        isLoading: false 
      }));

      // If permission is granted, get current location
      if (hasPermission) {
        await getCurrentLocationInternal();
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        hasPermission: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check location permission'
      }));
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === Location.PermissionStatus.GRANTED;
      
      setState(prev => ({ 
        ...prev, 
        hasPermission,
        isLoading: false 
      }));

      // If permission is granted, get current location
      if (hasPermission) {
        await getCurrentLocationInternal();
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Location permission denied'
        }));
      }

      return hasPermission;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        hasPermission: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to request location permission'
      }));
      return false;
    }
  };

  const getCurrentLocationInternal = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const coordinates: [number, number, number] = [
        location.coords.longitude,
        location.coords.latitude,
        location.coords.altitude || 0,
      ];

      setState(prev => ({ 
        ...prev, 
        location,
        coordinates,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get current location'
      }));
    }
  };

  const getCurrentLocation = async () => {
    if (!state.hasPermission) {
      setState(prev => ({ 
        ...prev, 
        error: 'Location permission not granted'
      }));
      return;
    }
    await getCurrentLocationInternal();
  };

  const refreshLocation = async () => {
    await getCurrentLocationInternal();
  };

  return {
    ...state,
    actions: {
      requestPermission,
      getCurrentLocation,
      refreshLocation,
    },
  };
}
