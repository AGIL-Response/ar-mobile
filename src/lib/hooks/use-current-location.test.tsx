import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

import useCurrentLocation from './use-current-location';

// Mock console.log and console.error to avoid noise in test output
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('useCurrentLocation', () => {
  const mockLocation = {
    coords: {
      latitude: 37.78825,
      longitude: -122.4324,
      altitude: 5,
      accuracy: 10,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Initial Setup', () => {
    it('requests location permission on mount', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('gets initial location after permission is granted', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });
    });

    it('sets error when permission is denied', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.errorMsg).toBe(
          'Permission to access location was denied'
        );
      });

      expect(result.current.location).toBeNull();
    });
  });

  describe('iOS Simulator Mode (interval-based)', () => {
    const originalPlatform = Platform.OS;
    const originalDev = __DEV__;

    beforeAll(() => {
      Platform.OS = 'ios';
      (global as unknown as { __DEV__: boolean }).__DEV__ = true;
    });

    afterAll(() => {
      Platform.OS = originalPlatform;
      (global as unknown as { __DEV__: boolean }).__DEV__ = originalDev;
    });

    it('uses interval for location updates in iOS simulator', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      const initialCallCount = (Location.getCurrentPositionAsync as jest.Mock)
        .mock.calls.length;

      // Advance timer by 1 second (interval duration)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(
          initialCallCount + 1
        );
      });
    });

    it('calls getCurrentPositionAsync with High accuracy in iOS simulator', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
          accuracy: Location.Accuracy.High,
        });
      });
    });
  });

  describe('Real Device Mode (watchPositionAsync)', () => {
    const originalPlatform = Platform.OS;
    const originalDev = __DEV__;

    beforeAll(() => {
      Platform.OS = 'android';
      (global as unknown as { __DEV__: boolean }).__DEV__ = false;
    });

    afterAll(() => {
      Platform.OS = originalPlatform;
      (global as unknown as { __DEV__: boolean }).__DEV__ = originalDev;
    });

    it('uses watchPositionAsync for real devices', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const mockRemove = jest.fn();
      const mockWatchCallback = jest.fn();
      (Location.watchPositionAsync as jest.Mock).mockImplementation(
        (options, callback) => {
          mockWatchCallback.mockImplementation(callback);
          return Promise.resolve({ remove: mockRemove });
        }
      );

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(Location.watchPositionAsync).toHaveBeenCalled();
      });

      // Verify watchPositionAsync was called with correct options
      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        expect.any(Function)
      );
    });

    it('calls watchPositionAsync callback when location changes', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      let watchCallback: ((location: Location.LocationObject) => void) | null =
        null;
      (Location.watchPositionAsync as jest.Mock).mockImplementation(
        (options, callback) => {
          watchCallback = callback;
          return Promise.resolve({ remove: jest.fn() });
        }
      );

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(watchCallback).not.toBeNull();
      });

      const newLocation = {
        ...mockLocation,
        coords: {
          ...mockLocation.coords,
          latitude: 37.78826, // Slight change
          longitude: -122.4325,
        },
      };

      act(() => {
        if (watchCallback) {
          watchCallback(newLocation);
        }
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(newLocation);
      });
    });
  });

  describe('Distance Filtering', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      (global as unknown as { __DEV__: boolean }).__DEV__ = false;
    });

    it('updates location when distance change is significant (>= 1m)', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      let watchCallback: ((location: Location.LocationObject) => void) | null =
        null;
      (Location.watchPositionAsync as jest.Mock).mockImplementation(
        (options, callback) => {
          watchCallback = callback;
          return Promise.resolve({ remove: jest.fn() });
        }
      );

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      // Location with significant change (approximately 111 meters - well above 1m threshold)
      const newLocation = {
        ...mockLocation,
        coords: {
          ...mockLocation.coords,
          latitude: 37.78925, // ~111m change
          longitude: -122.4324,
        },
      };

      act(() => {
        if (watchCallback) {
          watchCallback(newLocation);
        }
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(newLocation);
      });
    });

    it('does not update location when distance change is insignificant (< 1m)', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      let watchCallback: ((location: Location.LocationObject) => void) | null =
        null;
      (Location.watchPositionAsync as jest.Mock).mockImplementation(
        (options, callback) => {
          watchCallback = callback;
          return Promise.resolve({ remove: jest.fn() });
        }
      );

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      const initialLocation = result.current.location;

      // Location with insignificant change (less than 1 meter)
      const newLocation = {
        ...mockLocation,
        coords: {
          ...mockLocation.coords,
          latitude: 37.7882501, // Very small change (~0.01m)
          longitude: -122.4324001,
        },
      };

      act(() => {
        if (watchCallback) {
          watchCallback(newLocation);
        }
      });

      // Location should not update
      expect(result.current.location).toEqual(initialLocation);
    });

    it('always updates location when there is no previous location', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });
    });
  });

  describe('Error Handling', () => {
    it('sets error message when getCurrentPositionAsync fails', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      const error = new Error('Location unavailable');
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(error);
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.errorMsg).toBe('Error getting location');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting location:',
        error
      );
    });

    it('sets error message when starting location updates fails', async () => {
      const error = new Error('Failed to start');
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.errorMsg).toBe('Error starting location updates');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error starting location updates:',
        error
      );
    });

    it('continues to handle errors in interval updates (iOS simulator)', async () => {
      Platform.OS = 'ios';
      (global as unknown as { __DEV__: boolean }).__DEV__ = true;

      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock)
        .mockResolvedValueOnce(mockLocation)
        .mockRejectedValueOnce(new Error('Subsequent error'));

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      // Advance timer to trigger next interval
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.errorMsg).toBe('Error getting location');
      });
    });
  });

  describe('Cleanup', () => {
    it('removes location subscription on unmount', async () => {
      Platform.OS = 'android';
      (global as unknown as { __DEV__: boolean }).__DEV__ = false;

      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const mockRemove = jest.fn();
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: mockRemove,
      });

      const { unmount } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(Location.watchPositionAsync).toHaveBeenCalled();
      });

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('clears interval on unmount (iOS simulator)', async () => {
      Platform.OS = 'ios';
      (global as unknown as { __DEV__: boolean }).__DEV__ = true;

      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Location Ref Updates', () => {
    it('updates locationRef when location changes', async () => {
      Platform.OS = 'android';
      (global as unknown as { __DEV__: boolean }).__DEV__ = false;

      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      let watchCallback: ((location: Location.LocationObject) => void) | null =
        null;
      (Location.watchPositionAsync as jest.Mock).mockImplementation(
        (options, callback) => {
          watchCallback = callback;
          return Promise.resolve({ remove: jest.fn() });
        }
      );

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      const newLocation = {
        ...mockLocation,
        coords: {
          ...mockLocation.coords,
          latitude: 37.78925, // Significant change
        },
      };

      act(() => {
        if (watchCallback) {
          watchCallback(newLocation);
        }
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(newLocation);
      });

      // Call watchCallback again with another location - it should compare
      // against the updated location, not the original
      const anotherLocation = {
        ...mockLocation,
        coords: {
          ...mockLocation.coords,
          latitude: 37.79025, // Another significant change from newLocation
        },
      };

      act(() => {
        if (watchCallback) {
          watchCallback(anotherLocation);
        }
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(anotherLocation);
      });
    });
  });
});
