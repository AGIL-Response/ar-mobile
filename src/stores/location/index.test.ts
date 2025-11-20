// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/location');

import { act, renderHook } from '@testing-library/react-native';
const { PermissionStatus } = require('expo-location');

import { useLocationStore } from './index';

const LocationModule = require('expo-location');
const SocketModule = require('@/lib/socket');

jest.mock('react-native', () => ({
  __esModule: true,
  Alert: {
    alert: jest.fn(),
  },
}));
jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(console, 'warn').mockImplementation();

const AlertModule = require('react-native').Alert;

describe('LocationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useLocationStore.getState().reset?.();
    jest.spyOn(console, 'warn').mockImplementation();
    LocationModule.getCurrentPositionAsync.mockResolvedValue({
      coords: { longitude: 123, latitude: 45 },
      timestamp: Date.now(),
    });
    LocationModule.requestForegroundPermissionsAsync.mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    LocationModule.getForegroundPermissionsAsync.mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    LocationModule.openSettings.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    useLocationStore.getState().reset?.();
    const state = useLocationStore.getState();
    if (state.monitoringInterval) {
      clearInterval(state.monitoringInterval);
    }
    if (state.isMonitoring) {
      state.actions.stopLocationMonitoring();
    }
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useLocationStore());

      expect(result.current.currentLocation).toBeNull();
      expect(result.current.coordinates).toBeNull();
      expect(result.current.hasLocationPermission).toBeNull();
      expect(result.current.socket).toBeNull();
      expect(result.current.isSocketConnected).toBe(false);
      expect(result.current.isMonitoring).toBe(false);
      expect(result.current.monitoringInterval).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('requestLocationPermission', () => {
    it('grants permission and updates state', async () => {
      const { PermissionStatus } = require('expo-location');
      (
        LocationModule.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: PermissionStatus.GRANTED,
      });

      const { result } = renderHook(() => useLocationStore());

      await act(async () => {
        const granted =
          await result.current.actions.requestLocationPermission();
        expect(granted).toBe(true);
      });

      expect(result.current.hasLocationPermission).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(AlertModule.alert).not.toHaveBeenCalled();
    });

    it('denies permission and shows alert', async () => {
      const { PermissionStatus } = require('expo-location');
      (
        LocationModule.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: PermissionStatus.DENIED,
      });
      (LocationModule.openSettings as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useLocationStore());

      await act(async () => {
        const granted =
          await result.current.actions.requestLocationPermission();
        expect(granted).toBe(false);
      });

      expect(result.current.hasLocationPermission).toBe(false);
      expect(result.current.error).toBe('Location permission denied');
      expect(AlertModule.alert).toHaveBeenCalled();
    });

    it('handles permission request error', async () => {
      (
        LocationModule.requestForegroundPermissionsAsync as jest.Mock
      ).mockRejectedValue(new Error('Permission error'));

      const { result } = renderHook(() => useLocationStore());

      await act(async () => {
        const granted =
          await result.current.actions.requestLocationPermission();
        expect(granted).toBe(false);
      });

      expect(result.current.hasLocationPermission).toBe(false);
      expect(result.current.error).toBe('Permission error');
    });
  });

  describe('checkLocationPermission', () => {
    it('returns true when permission is granted', async () => {
      const { PermissionStatus } = require('expo-location');
      (
        LocationModule.getForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: PermissionStatus.GRANTED,
      });

      const { result } = renderHook(() => useLocationStore());

      await act(async () => {
        const hasPermission =
          await result.current.actions.checkLocationPermission();
        expect(hasPermission).toBe(true);
      });

      expect(result.current.hasLocationPermission).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('returns false when permission is denied', async () => {
      const { PermissionStatus } = require('expo-location');
      (
        LocationModule.getForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: PermissionStatus.DENIED,
      });

      const { result } = renderHook(() => useLocationStore());

      await act(async () => {
        const hasPermission =
          await result.current.actions.checkLocationPermission();
        expect(hasPermission).toBe(false);
      });

      expect(result.current.hasLocationPermission).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('gets location when permission granted', async () => {
      const mockLocation = {
        coords: {
          longitude: 123.456,
          latitude: 45.678,
          altitude: 100,
        },
        timestamp: Date.now(),
      };

      const { result } = renderHook(() => useLocationStore());

      // First, set the permission by calling checkLocationPermission
      (
        LocationModule.getForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: PermissionStatus.GRANTED,
      });

      await act(async () => {
        await result.current.actions.checkLocationPermission();
      });

      // Verify permission was set
      expect(result.current.hasLocationPermission).toBe(true);

      const getCurrentPositionSpy =
        LocationModule.getCurrentPositionAsync as jest.Mock;
      getCurrentPositionSpy.mockResolvedValue(mockLocation);

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      expect(getCurrentPositionSpy).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
      expect(result.current.currentLocation).toEqual(mockLocation);
      expect(result.current.coordinates).toEqual({
        longitude: 123.456,
        latitude: 45.678,
        altitude: 100,
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('returns early if permission not granted', async () => {
      const { result } = renderHook(() => useLocationStore());

      act(() => {
        useLocationStore.setState({ hasLocationPermission: false });
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      expect(result.current.error).toBe('Location permission not granted');
      expect(LocationModule.getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('handles location error', async () => {
      const { result } = renderHook(() => useLocationStore());

      act(() => {
        useLocationStore.setState({ hasLocationPermission: true });
      });

      (LocationModule.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
        new Error('Location unavailable')
      );

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      expect(result.current.error).toBe('Location unavailable');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('startLocationMonitoring', () => {
    it('starts monitoring with permission', async () => {
      const mockLocation = {
        coords: { longitude: 123, latitude: 45 },
      };

      const { result } = renderHook(() => useLocationStore());

      const { PermissionStatus } = require('expo-location');
      (
        LocationModule.getForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: PermissionStatus.GRANTED,
      });
      (LocationModule.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      await act(async () => {
        await result.current.actions.startLocationMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);
      expect(result.current.monitoringInterval).toBeTruthy();
      expect(LocationModule.getCurrentPositionAsync).toHaveBeenCalled();
    });

    it('requests permission if not granted', async () => {
      const { result } = renderHook(() => useLocationStore());

      const { PermissionStatus } = require('expo-location');
      (
        LocationModule.getForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: PermissionStatus.DENIED,
      });
      (
        LocationModule.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: PermissionStatus.DENIED,
      });

      await act(async () => {
        await result.current.actions.startLocationMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);
      expect(
        LocationModule.requestForegroundPermissionsAsync
      ).toHaveBeenCalled();
    });

    it('does not start if already monitoring', async () => {
      const { result } = renderHook(() => useLocationStore());

      // Use setState to properly update the store's internal state
      act(() => {
        useLocationStore.setState({ isMonitoring: true });
      });

      await act(async () => {
        await result.current.actions.startLocationMonitoring();
      });

      expect(
        LocationModule.getForegroundPermissionsAsync
      ).not.toHaveBeenCalled();
    });
  });

  describe('stopLocationMonitoring', () => {
    it('stops monitoring and clears interval', () => {
      const { result } = renderHook(() => useLocationStore());
      const mockInterval = setInterval(() => {}, 1000);

      act(() => {
        useLocationStore.setState({
          isMonitoring: true,
          monitoringInterval: mockInterval,
        });
      });

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      act(() => {
        result.current.actions.stopLocationMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);
      expect(result.current.monitoringInterval).toBeNull();
      expect(clearIntervalSpy).toHaveBeenCalledWith(mockInterval);

      clearIntervalSpy.mockRestore();
    });
  });

  describe('connectToWebSocket', () => {
    it('connects to websocket successfully', () => {
      const mockSocket = {
        on: jest.fn(),
        connected: false,
      } as any;

      (SocketModule.initMapSocket as jest.Mock).mockReturnValue(mockSocket);
      (SocketModule.handleListenMapSocket as jest.Mock).mockImplementation(
        (socket, callback) => {
          // Simulate socket setup
        }
      );

      const { result } = renderHook(() => useLocationStore());

      act(() => {
        result.current.actions.connectToWebSocket('token123');
      });

      expect(SocketModule.initMapSocket).toHaveBeenCalledWith('token123');
      expect(result.current.socket).toEqual(mockSocket);
      expect(mockSocket.on).toHaveBeenCalledWith(
        'connect',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'connect_error',
        expect.any(Function)
      );
    });

    it('does not connect if already connected', () => {
      const existingSocket = { connected: true } as any;
      const { result } = renderHook(() => useLocationStore());

      act(() => {
        useLocationStore.setState({ socket: existingSocket });
      });

      act(() => {
        result.current.actions.connectToWebSocket('token123');
      });

      expect(SocketModule.initMapSocket).not.toHaveBeenCalled();
    });
  });

  describe('disconnectFromWebSocket', () => {
    it('disconnects websocket', () => {
      const mockSocket = { id: 'socket1' } as any;
      (SocketModule.disconnectMapSocket as jest.Mock).mockImplementation(
        () => {}
      );

      const { result } = renderHook(() => useLocationStore());

      act(() => {
        useLocationStore.setState({
          socket: mockSocket,
          isSocketConnected: true,
        });
      });

      act(() => {
        result.current.actions.disconnectFromWebSocket();
      });

      expect(SocketModule.disconnectMapSocket).toHaveBeenCalledWith(mockSocket);
      expect(result.current.socket).toBeNull();
      expect(result.current.isSocketConnected).toBe(false);
    });
  });

  describe('sendLocationUpdate', () => {
    it('sends location when socket connected and coordinates available', () => {
      const mockSocket = { id: 'socket1' } as any;
      const mockCoordinates = { longitude: 123, latitude: 45 };
      (SocketModule.sendLocationToSocket as jest.Mock).mockImplementation(
        () => {}
      );

      const { result } = renderHook(() => useLocationStore());

      act(() => {
        useLocationStore.setState({
          socket: mockSocket,
          isSocketConnected: true,
          coordinates: mockCoordinates,
        });
      });

      act(() => {
        result.current.actions.sendLocationUpdate();
      });

      expect(SocketModule.sendLocationToSocket).toHaveBeenCalledWith(
        mockSocket,
        mockCoordinates
      );
    });

    it('does not send if socket not connected', () => {
      const { result } = renderHook(() => useLocationStore());

      act(() => {
        useLocationStore.setState({
          socket: { id: 'socket1' } as any,
          isSocketConnected: false,
          coordinates: { longitude: 123, latitude: 45 },
        });
      });

      act(() => {
        result.current.actions.sendLocationUpdate();
      });

      expect(SocketModule.sendLocationToSocket).not.toHaveBeenCalled();
    });

    it('does not send if coordinates not available', () => {
      const { result } = renderHook(() => useLocationStore());

      act(() => {
        useLocationStore.setState({
          socket: { id: 'socket1' } as any,
          isSocketConnected: true,
          coordinates: null,
        });
      });

      act(() => {
        result.current.actions.sendLocationUpdate();
      });

      expect(SocketModule.sendLocationToSocket).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('clears error state', () => {
      const { result } = renderHook(() => useLocationStore());

      act(() => {
        result.current.error = 'Some error';
      });

      act(() => {
        result.current.actions.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets store and cleans up resources', () => {
      const mockInterval = setInterval(() => {}, 1000);
      const mockSocket = { id: 'socket1' } as any;
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      (SocketModule.disconnectMapSocket as jest.Mock).mockImplementation(
        () => {}
      );

      const { result } = renderHook(() => useLocationStore());

      // Use setState to properly update the store's internal state
      act(() => {
        useLocationStore.setState({
          monitoringInterval: mockInterval,
          socket: mockSocket,
          isMonitoring: true,
          coordinates: { longitude: 123, latitude: 45 },
        });
      });

      act(() => {
        result.current.actions.reset();
      });

      expect(clearIntervalSpy).toHaveBeenCalledWith(mockInterval);
      expect(SocketModule.disconnectMapSocket).toHaveBeenCalledWith(mockSocket);
      expect(result.current.monitoringInterval).toBeNull();
      expect(result.current.socket).toBeNull();
      expect(result.current.coordinates).toBeNull();

      clearIntervalSpy.mockRestore();
    });
  });
});
