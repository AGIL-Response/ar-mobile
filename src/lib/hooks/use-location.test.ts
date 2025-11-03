// Unmock the hook to test the real implementation (must be before imports)
jest.unmock('@/lib/hooks/use-location');

import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useLocation } from './use-location';

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result } = renderHook(() => useLocation());

      expect(result.current.hasPermission).toBe(null);
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.location).toBeNull();
      expect(result.current.coordinates).toBeNull();
    });

    it('checks permission status on mount', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      renderHook(() => useLocation());

      await waitFor(() => {
        expect(Location.getForegroundPermissionsAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Permission Checking', () => {
    it('sets hasPermission to true when permission is granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const mockLocation = {
        coords: {
          latitude: 37.78825,
          longitude: -122.4324,
          altitude: 5,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });
    });

    it('sets hasPermission to false when permission is denied', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });
    });

    it('gets current location when permission is granted on mount', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const mockLocation = {
        coords: {
          latitude: 37.78825,
          longitude: -122.4324,
          altitude: 5,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      expect(result.current.coordinates).toEqual([-122.4324, 37.78825, 5]);
    });

    it('handles error when checking permission fails', async () => {
      const error = new Error('Permission check failed');
      (Location.getForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        error
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      expect(result.current.error).toBe('Permission check failed');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('requests permission and sets hasPermission to true when granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const mockLocation = {
        coords: {
          latitude: 37.78825,
          longitude: -122.4324,
          altitude: 5,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        const granted = await result.current.actions.requestPermission();
        expect(granted).toBe(true);
      });

      await waitFor(() => {
        expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      expect(result.current.location).toEqual(mockLocation);
    });

    it('sets hasPermission to false and error when permission is denied', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        const granted = await result.current.actions.requestPermission();
        expect(granted).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      expect(result.current.error).toBe('Location permission denied');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when requesting permission fails', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      const error = new Error('Request permission failed');
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        const granted = await result.current.actions.requestPermission();
        expect(granted).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      expect(result.current.error).toBe('Request permission failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('sets loading state during permission request', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ status: Location.PermissionStatus.GRANTED });
            }, 100);
          })
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      act(() => {
        result.current.actions.requestPermission();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getCurrentLocation', () => {
    it('gets current location when permission is granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const mockLocation = {
        coords: {
          latitude: 37.78825,
          longitude: -122.4324,
          altitude: 10,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.location).toEqual(mockLocation);
      });

      expect(result.current.coordinates).toEqual([-122.4324, 37.78825, 10]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets error when permission is not granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      expect(result.current.error).toBe('Location permission not granted');
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('handles error when getting location fails', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      const error = new Error('Location unavailable');
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useLocation());

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
    });

    it('handles location without altitude', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const mockLocation = {
        coords: {
          latitude: 37.78825,
          longitude: -122.4324,
          altitude: null,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.coordinates).toEqual([-122.4324, 37.78825, 0]);
      });
    });

    it('sets loading state during location fetch', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const mockLocation = {
        coords: {
          latitude: 37.78825,
          longitude: -122.4324,
          altitude: 5,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(mockLocation);
            }, 100);
          })
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      act(() => {
        result.current.actions.getCurrentLocation();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('calls getCurrentPositionAsync with correct options', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const mockLocation = {
        coords: {
          latitude: 37.78825,
          longitude: -122.4324,
          altitude: 5,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });
    });
  });

  describe('refreshLocation', () => {
    it('refreshes location even without permission check', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const mockLocation = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          altitude: 5,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const { result } = renderHook(() => useLocation());

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
        expect(result.current.location).toEqual(mockLocation);
      });

      expect(result.current.coordinates).toEqual([-74.006, 40.7128, 5]);
    });

    it('handles error when refresh location fails', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const error = new Error('Refresh failed');
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useLocation());

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
    });

    it('clears previous error on successful refresh', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Previous error')
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      await act(async () => {
        await result.current.actions.refreshLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Previous error');
      });

      const mockLocation = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          altitude: 5,
        },
      };
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
        mockLocation
      );

      await act(async () => {
        await result.current.actions.refreshLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.location).toEqual(mockLocation);
    });
  });

  describe('Error Handling', () => {
    it('handles non-Error objects in catch blocks', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        'String error'
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      expect(result.current.error).toBe('Failed to check location permission');
    });

    it('handles location errors with non-Error objects', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
        'String error'
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.actions.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to get current location');
      });
    });
  });
});
