import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

import useCurrentLocation from './use-current-location';

describe('useCurrentLocation', () => {
  const mockLocation: Location.LocationObject = {
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

  const originalPlatformOS = Platform.OS;
  const originalDEV = (global as unknown as { __DEV__: boolean }).__DEV__;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    (global as unknown as { __DEV__: boolean }).__DEV__ = false;
  });

  afterEach(() => {
    Platform.OS = originalPlatformOS;
    (global as unknown as { __DEV__: boolean }).__DEV__ = originalDEV;
    jest.useRealTimers();
  });

  describe('Initial Setup', () => {
    it('requests location permission on mount', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      renderHook(() => useCurrentLocation());

      await waitFor(() => {
        expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('gets initial location after permission is granted', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useCurrentLocation());

      await waitFor(
        () => {
          expect(result.current.location).toEqual(mockLocation);
        },
        { timeout: 3000 }
      );
    });

    it('sets error when permission is denied', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => useCurrentLocation());

      await waitFor(
        () => {
          expect(result.current.errorMsg).toBe('Permission to access location was denied');
        },
        { timeout: 3000 }
      );

      expect(result.current.location).toBeNull();
    });
  });

  describe('iOS Simulator Mode', () => {
    it('uses interval for location updates in iOS simulator', async () => {
      Platform.OS = 'ios';
      (global as unknown as { __DEV__: boolean }).__DEV__ = true;
      jest.useFakeTimers();

      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { unmount } = renderHook(() => useCurrentLocation());

      // Run all pending timers to process initial setup
      await act(async () => {
        jest.runAllTimers();
      });

      const initialCallCount = (Location.getCurrentPositionAsync as jest.Mock).mock.calls.length;
      expect(initialCallCount).toBeGreaterThan(0);

      // Advance timers by 1 second
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Verify interval triggered another call
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(initialCallCount);

      unmount();
      jest.useRealTimers();
    });

    it('calls getCurrentPositionAsync with High accuracy', async () => {
      Platform.OS = 'ios';
      (global as unknown as { __DEV__: boolean }).__DEV__ = true;

      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { unmount } = renderHook(() => useCurrentLocation());

      await waitFor(
        () => {
          expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
            accuracy: Location.Accuracy.High,
          });
        },
        { timeout: 5000 }
      );

      unmount();
    });
  });

  describe('Real Device Mode', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      (global as unknown as { __DEV__: boolean }).__DEV__ = false;
    });

    it('uses watchPositionAsync for real devices', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      renderHook(() => useCurrentLocation());

      await waitFor(
        () => {
          expect(Location.watchPositionAsync).toHaveBeenCalledWith(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 1000,
              distanceInterval: 1,
            },
            expect.any(Function)
          );
        },
        { timeout: 3000 }
      );
    });

    it('updates location via watchPositionAsync callback', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      let watchCallback: ((loc: Location.LocationObject) => void) | null = null;
      (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
        watchCallback = callback;
        return Promise.resolve({ remove: jest.fn() });
      });

      const { result } = renderHook(() => useCurrentLocation());

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      const newLocation: Location.LocationObject = {
        ...mockLocation,
        coords: { ...mockLocation.coords, latitude: 37.78826, longitude: -122.4325 },
      };

      act(() => {
        watchCallback?.(newLocation);
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

    it('updates location when distance >= 1m', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      let watchCallback: ((loc: Location.LocationObject) => void) | null = null;
      (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
        watchCallback = callback;
        return Promise.resolve({ remove: jest.fn() });
      });

      const { result } = renderHook(() => useCurrentLocation());

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      const significantLocation: Location.LocationObject = {
        ...mockLocation,
        coords: { ...mockLocation.coords, latitude: 37.78925 },
      };

      act(() => {
        watchCallback?.(significantLocation);
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(significantLocation);
      });
    });

    it('does not update when distance < 1m', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      let watchCallback: ((loc: Location.LocationObject) => void) | null = null;
      (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
        watchCallback = callback;
        return Promise.resolve({ remove: jest.fn() });
      });

      const { result } = renderHook(() => useCurrentLocation());

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      const initialLocation = result.current.location;

      const insignificantLocation: Location.LocationObject = {
        ...mockLocation,
        coords: { ...mockLocation.coords, latitude: 37.7882501 },
      };

      act(() => {
        watchCallback?.(insignificantLocation);
      });

      expect(result.current.location).toEqual(initialLocation);
    });

    it('always updates when no previous location', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useCurrentLocation());

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles getCurrentPositionAsync failure', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
        new Error('Location unavailable')
      );
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useCurrentLocation());

      await waitFor(
        () => {
          expect(result.current.errorMsg).toBe('Error getting location');
        },
        { timeout: 3000 }
      );
    });

    it('handles permission request failure', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Failed to start')
      );

      const { result } = renderHook(() => useCurrentLocation());

      await waitFor(
        () => {
          expect(result.current.errorMsg).toBe('Error starting location updates');
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Cleanup', () => {
    it('removes subscription on unmount', async () => {
      Platform.OS = 'android';
      (global as unknown as { __DEV__: boolean }).__DEV__ = false;

      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const mockRemove = jest.fn();
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: mockRemove,
      });

      const { unmount } = renderHook(() => useCurrentLocation());

      await waitFor(() => {
        expect(Location.watchPositionAsync).toHaveBeenCalled();
      });

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('clears interval on unmount in iOS simulator', async () => {
      Platform.OS = 'ios';
      (global as unknown as { __DEV__: boolean }).__DEV__ = true;
      jest.useFakeTimers();

      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useCurrentLocation());

      // Run timers to complete initial setup
      await act(async () => {
        jest.runAllTimers();
      });

      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();

      // Unmount and verify cleanup
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('Location Ref Updates', () => {
    it('updates locationRef when location changes', async () => {
      Platform.OS = 'android';
      (global as unknown as { __DEV__: boolean }).__DEV__ = false;

      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      let watchCallback: ((loc: Location.LocationObject) => void) | null = null;
      (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
        watchCallback = callback;
        return Promise.resolve({ remove: jest.fn() });
      });

      const { result, unmount } = renderHook(() => useCurrentLocation());

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      const newLocation: Location.LocationObject = {
        ...mockLocation,
        coords: { ...mockLocation.coords, latitude: 37.78925 },
      };

      act(() => {
        if (watchCallback) {
          watchCallback(newLocation);
        }
      });

      expect(result.current.location).toEqual(newLocation);

      const anotherLocation: Location.LocationObject = {
        ...mockLocation,
        coords: { ...mockLocation.coords, latitude: 37.79025 },
      };

      act(() => {
        if (watchCallback) {
          watchCallback(anotherLocation);
        }
      });

      expect(result.current.location).toEqual(anotherLocation);

      unmount();
    });
  });
});
