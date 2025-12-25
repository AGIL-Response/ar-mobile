// Unmock the hook to test the real implementation (must be before imports)
jest.unmock('@/lib/hooks/use-location');

import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useLocation } from './use-location';

// Mock location object
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

describe('useLocation', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result, unmount } = renderHook(() => useLocation());

      // After mount completes, permission should be checked
      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.location).toBe(null);
      expect(result.current.coordinates).toBe(null);
      expect(result.current.error).toBe(null);

      unmount();
    });

    it('checks permission status on mount', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(Location.getForegroundPermissionsAsync).toHaveBeenCalled();
      });

      unmount();
    });

    it('exposes all required actions', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).not.toBe(null);
      });

      expect(result.current.actions).toHaveProperty('requestPermission');
      expect(result.current.actions).toHaveProperty('getCurrentLocation');
      expect(result.current.actions).toHaveProperty('refreshLocation');

      unmount();
    });
  });

  describe('Permission Checking', () => {
    it('sets hasPermission to true when permission is granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
      unmount();
    });

    it('sets hasPermission to false when permission is denied', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      expect(result.current.isLoading).toBe(false);
      unmount();
    });

    it('gets current location when permission is granted on mount', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      expect(result.current.coordinates).toEqual([
        mockLocation.coords.longitude,
        mockLocation.coords.latitude,
        mockLocation.coords.altitude,
      ]);

      unmount();
    });

    it('does not get location when permission is denied on mount', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
      expect(result.current.location).toBe(null);

      unmount();
    });

    it('handles error when checking permission fails', async () => {
      const error = new Error('Permission check failed');
      (Location.getForegroundPermissionsAsync as jest.Mock).mockRejectedValue(error);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      expect(result.current.error).toBe('Permission check failed');
      expect(result.current.isLoading).toBe(false);

      unmount();
    });

    it('sets loading state during permission check', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ status: Location.PermissionStatus.DENIED });
            }, 50);
          })
      );

      const { result, unmount } = renderHook(() => useLocation());

      // Should be loading initially
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Should finish loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      unmount();
    });
  });

  describe('requestPermission', () => {
    it('requests permission and sets hasPermission to true when granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      let granted;
      await act(async () => {
        granted = await result.current.actions.requestPermission();
      });

      expect(granted).toBe(true);

      await waitFor(() => {
        expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
        expect(result.current.hasPermission).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      unmount();
    });

    it('sets hasPermission to false and error when permission is denied', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      let granted;
      await act(async () => {
        granted = await result.current.actions.requestPermission();
      });

      expect(granted).toBe(false);

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
        expect(result.current.error).toBe('Location permission denied');
      });

      expect(result.current.isLoading).toBe(false);

      unmount();
    });

    it('handles error when requesting permission fails', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      const error = new Error('Request permission failed');
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(error);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      let granted;
      await act(async () => {
        granted = await result.current.actions.requestPermission();
      });

      expect(granted).toBe(false);

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
        expect(result.current.error).toBe('Request permission failed');
      });

      expect(result.current.isLoading).toBe(false);

      unmount();
    });

    it('sets loading state during permission request', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ status: Location.PermissionStatus.GRANTED });
            }, 50);
          })
      );
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      act(() => {
        result.current.actions.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      unmount();
    });

    it('returns false when requesting permission with non-Error exception', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        'String error'
      );

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      let granted;
      await act(async () => {
        granted = await result.current.actions.requestPermission();
      });

      expect(granted).toBe(false);

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to request location permission');
      });

      unmount();
    });
  });

  describe('getCurrentLocation', () => {
    it('gets current location when permission is granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      // Clear previous calls from mount
      (Location.getCurrentPositionAsync as jest.Mock).mockClear();

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      expect(result.current.coordinates).toEqual([
        mockLocation.coords.longitude,
        mockLocation.coords.latitude,
        mockLocation.coords.altitude,
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      unmount();
    });

    it('sets error when permission is not granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      expect(result.current.error).toBe('Location permission not granted');
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();

      unmount();
    });

    it('handles error when getting location fails', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      
      // First call succeeds (from mount), second call fails
      (Location.getCurrentPositionAsync as jest.Mock)
        .mockResolvedValueOnce(mockLocation)
        .mockRejectedValueOnce(new Error('Location unavailable'));

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Location unavailable');
      });

      expect(result.current.isLoading).toBe(false);

      unmount();
    });

    it('handles location without altitude', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const mockLocationNoAltitude = {
        ...mockLocation,
        coords: {
          ...mockLocation.coords,
          altitude: null,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocationNoAltitude
      );

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.coordinates).toEqual([
          mockLocation.coords.longitude,
          mockLocation.coords.latitude,
          0,
        ]);
      });

      unmount();
    });

    it('sets loading state during location fetch', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(mockLocation);
            }, 50);
          })
      );

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      act(() => {
        result.current.actions.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      unmount();
    });

    it('calls getCurrentPositionAsync with correct options', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      unmount();
    });
  });

  describe('refreshLocation', () => {
    it('refreshes location even without permission check', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const newLocation = {
        ...mockLocation,
        coords: {
          ...mockLocation.coords,
          latitude: 40.7128,
          longitude: -74.006,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(newLocation);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        await result.current.actions.refreshLocation();
      });

      await waitFor(() => {
        expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(newLocation);
      });

      expect(result.current.coordinates).toEqual([
        newLocation.coords.longitude,
        newLocation.coords.latitude,
        newLocation.coords.altitude,
      ]);

      unmount();
    });

    it('handles error when refresh location fails', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const error = new Error('Refresh failed');
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(error);

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        await result.current.actions.refreshLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Refresh failed');
      });

      expect(result.current.isLoading).toBe(false);

      unmount();
    });

    it('clears previous error on successful refresh', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      // First call fails
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Previous error')
      );

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        await result.current.actions.refreshLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Previous error');
      });

      // Second call succeeds
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      await act(async () => {
        await result.current.actions.refreshLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.location).toEqual(mockLocation);

      unmount();
    });

    it('sets loading state during refresh', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(mockLocation);
            }, 50);
          })
      );

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      act(() => {
        result.current.actions.refreshLocation();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      unmount();
    });
  });

  describe('Error Handling', () => {
    it('handles non-Error objects in permission check', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        'String error'
      );

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      expect(result.current.error).toBe('Failed to check location permission');

      unmount();
    });

    it('handles location errors with non-Error objects during mount', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue('String error');

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to get current location');
      });

      unmount();
    });

    it('handles location errors with non-Error objects in manual call', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      // First call succeeds (from mount), second call fails with non-Error
      (Location.getCurrentPositionAsync as jest.Mock)
        .mockResolvedValueOnce(mockLocation)
        .mockRejectedValueOnce('String error');

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
        expect(result.current.location).toEqual(mockLocation);
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to get current location');
      });

      unmount();
    });

    it('handles errors during refresh with non-Error objects', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
        { code: 'TIMEOUT' }
      );

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        await result.current.actions.refreshLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to get current location');
      });

      unmount();
    });
  });

  describe('State Management', () => {
    it('maintains state consistency through multiple operations', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      // Request permission
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      await act(async () => {
        await result.current.actions.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
        expect(result.current.location).toEqual(mockLocation);
      });

      // Get location again
      const newLocation = {
        ...mockLocation,
        coords: {
          ...mockLocation.coords,
          latitude: 40.0,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(newLocation);

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(newLocation);
      });

      unmount();
    });

    it('clears error on successful operation after failure', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      // First call fails
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
        new Error('GPS timeout')
      );

      const { result, unmount } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.error).toBe('GPS timeout');
      });

      // Second call succeeds
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.location).toEqual(mockLocation);
      });

      unmount();
    });
  });
});
