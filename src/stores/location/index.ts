import * as Location from 'expo-location';
import { type Socket } from 'socket.io-client';
import { Alert } from 'react-native';

import type IBaseState from '@/stores/interfaces/IBaseState';
import { type InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';
import { 
  initMapSocket, 
  handleListenMapSocket, 
  sendLocationToSocket, 
  disconnectMapSocket,
  type LocationCoordinates,
  type SocketLocationUpdateEvent 
} from '@/lib/socket';
import { useDeviceInfoStore } from '@/stores/device-info';

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
  monitoringInterval: NodeJS.Timeout | null;
  locationUpdateIntervalMs: number; // Interval time in milliseconds
  
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
  error: null,
  isLoading: false,
};

const locationStore = (set: any, get: any) => ({
  ...initialState,
  
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
              { text: 'Open Settings', onPress: () => Location.openSettings() }
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

        set((state: LocationState) => {
          state.currentLocation = location;
          state.coordinates = coordinates;
          state.isLoading = false;
          state.error = null;
        });

        console.log('📍 Current location updated:', coordinates);
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
        // Pass values directly (null or number) - don't convert null to undefined
        // This ensures attributes object is created even if values are null initially
        const networkSpeed = deviceInfoState.networkSpeed;
        const batteryPercentage = deviceInfoState.batteryPercentage;
        
        console.log('📍 Device info state:', {
          networkSpeed: deviceInfoState.networkSpeed,
          batteryPercentage: deviceInfoState.batteryPercentage,
          isCheckingNetworkSpeed: deviceInfoState.isCheckingNetworkSpeed,
          isCheckingBattery: deviceInfoState.isCheckingBattery,
          batteryError: deviceInfoState.batteryError,
        });
        console.log('📍 Sending with:', { networkSpeed, batteryPercentage });
        
        // Pass null values directly (not undefined) so attributes object is created
        // This ensures attributes are included even if values are null initially
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
          console.log('📩 Received location update from other user:', event);
          // Handle location updates from other users if needed
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

      sendLocationToSocket(state.socket, state.coordinates, networkMbps, batteryPercentage);
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
