import * as Location from 'expo-location';
import { type Socket } from 'socket.io-client';
import { Alert, Linking } from 'react-native';

import type IBaseState from '@/stores/interfaces/IBaseState';
import { type InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore , coordinatesChanged, attributesChanged } from '@/stores/utils';
import {
  initMapSocket,
  handleListenMapSocket,
  sendLocationToSocket,
  disconnectMapSocket,
  type LocationCoordinates,
  type SocketLocationUpdateEvent
} from '@/lib/socket';
import { useDeviceInfoStore } from '@/stores/device-info';
import { useUsersStore } from '@/stores/users';

export interface LocationState extends IBaseState {
  // Location data
  currentLocation: Location.LocationObject | null;
  coordinates: LocationCoordinates | null;

  // Permission status
  hasLocationPermission: boolean | null; // null = not checked, true = granted, false = denied

  // WebSocket connection
  socket: Socket | null;
  isSocketConnected: boolean;

  // Monitoring state
  isMonitoring: boolean;
  monitoringInterval: ReturnType<typeof setInterval> | null;
  locationUpdateIntervalMs: number; // Interval time in milliseconds

  lastSentCoordinates: LocationCoordinates | null;
  lastSentAttributes: { networkMbps?: number | null; batteryPercentage?: number | null } | null;

  // Error handling
  error: string | null;
  isLoading: boolean;

  actions: {
    // Permission management
    requestLocationPermission: () => Promise<boolean>;
    checkLocationPermission: () => Promise<boolean>;

    // Location management
    getCurrentLocation: () => Promise<void>;
    startLocationMonitoring: () => Promise<void>;
    stopLocationMonitoring: () => void;
    setLocationUpdateIntervalMs: (intervalMs: number) => void;

    // WebSocket management
    connectToWebSocket: (accessToken: string) => void;
    disconnectFromWebSocket: () => void;
    sendLocationUpdate: (
      networkMbps?: number | null,
      batteryPercentage?: number | null
    ) => void;

    // Utility actions
    clearError: () => void;
    reset: () => void;
  };
}

const initialState: InitStateType<LocationState> = {
  currentLocation: null,
  coordinates: null,
  hasLocationPermission: null,
  socket: null,
  isSocketConnected: false,
  isMonitoring: false,
  monitoringInterval: null,
  locationUpdateIntervalMs: 10000, // 10 seconds default
  lastSentCoordinates: null,
  lastSentAttributes: null,
  error: null,
  isLoading: false,
};

const locationStore = (set: any, get: any) => ({
  ...initialState,
  lastSentCoordinates: null,
  lastSentAttributes: null,
  actions: {
    requestLocationPermission: async (): Promise<boolean> => {
      try {
        set((state: LocationState) => {
          state.isLoading = true;
          state.error = null;
        });

        const { status } = await Location.requestForegroundPermissionsAsync();
        const hasPermission = status === Location.PermissionStatus.GRANTED;

        set((state: LocationState) => {
          state.hasLocationPermission = hasPermission;
          state.isLoading = false;
        });

        if (!hasPermission) {
          set((state: LocationState) => {
            state.error = 'Location permission denied';
          });

          Alert.alert(
            'Location Permission Required',
            'This app needs location permission to track your position and share it with your team. Please enable location access in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }

        return hasPermission;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to request location permission';
        set((state: LocationState) => {
          state.hasLocationPermission = false;
          state.error = errorMessage;
          state.isLoading = false;
        });
        return false;
      }
    },

    checkLocationPermission: async (): Promise<boolean> => {
      try {
        set((state: LocationState) => {
          state.isLoading = true;
          state.error = null;
        });

        const { status } = await Location.getForegroundPermissionsAsync();
        const hasPermission = status === Location.PermissionStatus.GRANTED;

        set((state: LocationState) => {
          state.hasLocationPermission = hasPermission;
          state.isLoading = false;
        });

        return hasPermission;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to check location permission';
        set((state: LocationState) => {
          state.hasLocationPermission = false;
          state.error = errorMessage;
          state.isLoading = false;
        });
        return false;
      }
    },

    getCurrentLocation: async (): Promise<void> => {
      const state = get() as LocationState;

      if (!state.hasLocationPermission) {
        set((state: LocationState) => {
          state.error = 'Location permission not granted';
        });
        return;
      }

      try {
        set((state: LocationState) => {
          state.isLoading = true;
          state.error = null;
        });

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        });

        const coordinates: LocationCoordinates = {
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
          altitude: location.coords.altitude || undefined,
        };

        if (coordinatesChanged(state.lastSentCoordinates, coordinates)) {
          set((state: LocationState) => {
            state.currentLocation = location;
            state.coordinates = coordinates;
            state.isLoading = false;
            state.error = null;
          });
          console.log('📍 Current location updated:', coordinates);
        } else {
          set((state: LocationState) => {
            state.isLoading = false;
            state.error = null;
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
        set((state: LocationState) => {
          state.error = errorMessage;
          state.isLoading = false;
        });
        console.error('Error getting current location:', error);
      }
    },

    startLocationMonitoring: async (): Promise<void> => {
      const state = get() as LocationState;

      if (state.isMonitoring) {
        console.log('📍 Location monitoring already active');
        return;
      }

      // Check permission first
      const hasPermission = await get().actions.checkLocationPermission();
      if (!hasPermission) {
        const granted = await get().actions.requestLocationPermission();
        if (!granted) {
          return;
        }
      }

      // Get initial location
      await get().actions.getCurrentLocation();

      // Start monitoring interval
      const currentState = get() as LocationState;
      const interval = setInterval(async () => {
        await get().actions.getCurrentLocation();

        // Get network speed and battery from device info store
        const deviceInfoState = useDeviceInfoStore.getState();
        // Pass values directly (null or number) - attributes will only be sent if at least one is not null
        const networkSpeed = deviceInfoState.networkSpeed;
        const batteryPercentage = deviceInfoState.batteryPercentage;

        console.log('📍 Device info state:', {
          networkSpeed: deviceInfoState.networkSpeed,
          batteryPercentage: deviceInfoState.batteryPercentage,
          isCheckingNetworkSpeed: deviceInfoState.isCheckingNetworkSpeed,
          isCheckingBattery: deviceInfoState.isCheckingBattery,
          batteryError: deviceInfoState.batteryError,
        });
        console.log('📍 Sending location update with:', { networkSpeed, batteryPercentage });

        // Send location update - attributes will be included if networkSpeed or batteryPercentage is not null
        get().actions.sendLocationUpdate(networkSpeed, batteryPercentage);
      }, currentState.locationUpdateIntervalMs); // Use interval from state

      set((state: LocationState) => {
        state.isMonitoring = true;
        state.monitoringInterval = interval;
      });

      console.log('📍 Location monitoring started');
    },

    stopLocationMonitoring: (): void => {
      const state = get() as LocationState;

      if (state.monitoringInterval) {
        clearInterval(state.monitoringInterval);
      }

      set((state: LocationState) => {
        state.isMonitoring = false;
        state.monitoringInterval = null;
      });

      console.log('📍 Location monitoring stopped');
    },

    setLocationUpdateIntervalMs: (intervalMs: number): void => {
      set((state: LocationState) => {
        state.locationUpdateIntervalMs = intervalMs;
      });
      // Restart monitoring with new interval if already running
      const currentState = get() as LocationState;
      if (currentState.isMonitoring && currentState.monitoringInterval) {
        get().actions.stopLocationMonitoring();
        get().actions.startLocationMonitoring();
      }
    },

    connectToWebSocket: (accessToken: string): void => {
      const state = get() as LocationState;

      if (state.socket?.connected) {
        console.log('🔌 WebSocket already connected');
        return;
      }

      try {
        const socket = initMapSocket(accessToken);

        handleListenMapSocket(socket, (event: SocketLocationUpdateEvent) => {
          // console.log('📩 Received location update from other user:', event);

          // Update users in users store when location updates are received
          if (event.features && Array.isArray(event.features)) {
            event.features.forEach((feature) => {
              const userId = feature.properties?.entityId;
              const coordinates = feature.geometry?.coordinates;
              const attributes = feature.properties?.attributes;
              const status = feature.properties?.status;

              if (userId && coordinates) {
                const usersStore = useUsersStore.getState();
                usersStore.actions.updateUserLocation(
                  userId,
                  {
                    type: 'Point',
                    coordinates: coordinates,
                  },
                  attributes,
                  status
                );
              }
            });
          }
        });

        set((state: LocationState) => {
          state.socket = socket;
        });

        // Listen for connection status changes
        socket.on('connect', () => {
          set((state: LocationState) => {
            state.isSocketConnected = true;
          });
          console.log('✅ WebSocket connected successfully');
        });

        socket.on('disconnect', () => {
          set((state: LocationState) => {
            state.isSocketConnected = false;
          });
          console.log('❌ WebSocket disconnected');
        });

        socket.on('connect_error', (error: Error) => {
          set((state: LocationState) => {
            state.isSocketConnected = false;
            state.error = `WebSocket connection failed: ${error.message}`;
          });
          console.error('❌ WebSocket connection error:', error);
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to WebSocket';
        set((state: LocationState) => {
          state.error = errorMessage;
        });
        console.error('Error connecting to WebSocket:', error);
      }
    },

    disconnectFromWebSocket: (): void => {
      const state = get() as LocationState;

      if (state.socket) {
        disconnectMapSocket(state.socket);
      }

      set((state: LocationState) => {
        state.socket = null;
        state.isSocketConnected = false;
      });

      console.log('🔌 WebSocket disconnected');
    },

    sendLocationUpdate: (
      networkMbps?: number | null,
      batteryPercentage?: number | null
    ): void => {
      const state = get() as LocationState;

      if (!state.socket || !state.isSocketConnected) {
        console.warn('⚠️ Cannot send location: WebSocket not connected');
        return;
      }

      if (!state.coordinates) {
        console.warn('⚠️ Cannot send location: No coordinates available');
        return;
      }

      const newAttributes = {
        networkMbps: networkMbps ?? null,
        batteryPercentage: batteryPercentage ?? null,
      };

      // Check if coordinates or attributes have changed
      const coordsChanged = coordinatesChanged(
        state.lastSentCoordinates,
        state.coordinates
      );
      const attrsChanged = attributesChanged(
        state.lastSentAttributes,
        newAttributes
      );

      // Only send if something actually changed
      if (coordsChanged || attrsChanged) {
        sendLocationToSocket(state.socket, state.coordinates, networkMbps, batteryPercentage);

        // Update last sent values
        set((state: LocationState) => {
          state.lastSentCoordinates = { ...state.coordinates! };
          state.lastSentAttributes = { ...newAttributes };
        });

        console.log('📤 Sent location update (changed):', {
          coordinates: state.coordinates,
          attributes: newAttributes,
        });
      } else {
        console.log('⏭️ Socket emit: skipping location update (no changes detected)');
      }
    },

    clearError: (): void => {
      set((state: LocationState) => {
        state.error = null;
      });
    },

    reset: (): void => {
      const state = get() as LocationState;

      // Stop monitoring
      if (state.monitoringInterval) {
        clearInterval(state.monitoringInterval);
      }

      // Disconnect WebSocket
      if (state.socket) {
        disconnectMapSocket(state.socket);
      }

      resetStore(initialState, set);
    },
  },
});

export const useLocationStore = createStore<LocationState>(locationStore);
