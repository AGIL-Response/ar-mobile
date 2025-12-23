import { renderHook } from '@testing-library/react-native';
import {
  PermissionStatus,
  useCameraPermissions,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
import * as Location from 'expo-location';

import {
  useCameraPermission,
  useMediaLibraryPermission,
  useLocationPermission,
} from './media-permissions';

// Mock expo-location
jest.mock('expo-location', () => ({
  PermissionStatus: {
    UNDETERMINED: 'undetermined',
    DENIED: 'denied',
    GRANTED: 'granted',
  },
  useForegroundPermissions: jest.fn(),
}));

describe('Media Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCameraPermission', () => {
    it('requests permission when status is UNDETERMINED and returns true when granted', async () => {
      const requestCameraPermission = jest.fn().mockResolvedValue({
        granted: true,
        canAskAgain: true,
        expires: 'never',
        status: PermissionStatus.GRANTED,
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestCameraPermission,
      ]);

      const { result } = renderHook(() => useCameraPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestCameraPermission).toHaveBeenCalled();
      expect(hasPermission).toBe(true);
    });

    it('requests permission when status is UNDETERMINED and returns false when denied', async () => {
      const requestCameraPermission = jest.fn().mockResolvedValue({
        granted: false,
        canAskAgain: false,
        expires: 'never',
        status: PermissionStatus.DENIED,
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestCameraPermission,
      ]);

      const { result } = renderHook(() => useCameraPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestCameraPermission).toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('returns true when permission is already GRANTED without requesting', async () => {
      const requestCameraPermission = jest.fn();

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.GRANTED },
        requestCameraPermission,
      ]);

      const { result } = renderHook(() => useCameraPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestCameraPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(true);
    });

    it('returns false when permission is already DENIED without requesting', async () => {
      const requestCameraPermission = jest.fn();

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.DENIED },
        requestCameraPermission,
      ]);

      const { result } = renderHook(() => useCameraPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestCameraPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('handles null camera permission status', async () => {
      const requestCameraPermission = jest.fn();

      (useCameraPermissions as jest.Mock).mockReturnValue([
        null,
        requestCameraPermission,
      ]);

      const { result } = renderHook(() => useCameraPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestCameraPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('handles undefined camera permission status', async () => {
      const requestCameraPermission = jest.fn();

      (useCameraPermissions as jest.Mock).mockReturnValue([
        undefined,
        requestCameraPermission,
      ]);

      const { result } = renderHook(() => useCameraPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestCameraPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('returns a function that can be called multiple times', async () => {
      const requestCameraPermission = jest.fn().mockResolvedValue({
        granted: true,
        status: PermissionStatus.GRANTED,
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestCameraPermission,
      ]);

      const { result } = renderHook(() => useCameraPermission());

      const checkPermission = result.current;

      const hasPermission1 = await checkPermission();
      const hasPermission2 = await checkPermission();

      expect(hasPermission1).toBe(true);
      expect(hasPermission2).toBe(true);
      expect(requestCameraPermission).toHaveBeenCalledTimes(2);
    });
  });

  describe('useMediaLibraryPermission', () => {
    it('requests permission when status is UNDETERMINED and returns true when granted', async () => {
      const requestMediaLibraryPermission = jest.fn().mockResolvedValue({
        granted: true,
        canAskAgain: true,
        expires: 'never',
        status: PermissionStatus.GRANTED,
      });

      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestMediaLibraryPermission,
      ]);

      const { result } = renderHook(() => useMediaLibraryPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestMediaLibraryPermission).toHaveBeenCalled();
      expect(hasPermission).toBe(true);
    });

    it('requests permission when status is UNDETERMINED and returns false when denied', async () => {
      const requestMediaLibraryPermission = jest.fn().mockResolvedValue({
        granted: false,
        canAskAgain: false,
        expires: 'never',
        status: PermissionStatus.DENIED,
      });

      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestMediaLibraryPermission,
      ]);

      const { result } = renderHook(() => useMediaLibraryPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestMediaLibraryPermission).toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('returns true when permission is already GRANTED without requesting', async () => {
      const requestMediaLibraryPermission = jest.fn();

      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.GRANTED },
        requestMediaLibraryPermission,
      ]);

      const { result } = renderHook(() => useMediaLibraryPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestMediaLibraryPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(true);
    });

    it('returns false when permission is already DENIED without requesting', async () => {
      const requestMediaLibraryPermission = jest.fn();

      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.DENIED },
        requestMediaLibraryPermission,
      ]);

      const { result } = renderHook(() => useMediaLibraryPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestMediaLibraryPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('handles null media library permission status', async () => {
      const requestMediaLibraryPermission = jest.fn();

      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        null,
        requestMediaLibraryPermission,
      ]);

      const { result } = renderHook(() => useMediaLibraryPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestMediaLibraryPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('handles undefined media library permission status', async () => {
      const requestMediaLibraryPermission = jest.fn();

      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        undefined,
        requestMediaLibraryPermission,
      ]);

      const { result } = renderHook(() => useMediaLibraryPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestMediaLibraryPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('returns a function that can be called multiple times', async () => {
      const requestMediaLibraryPermission = jest.fn().mockResolvedValue({
        granted: true,
        status: PermissionStatus.GRANTED,
      });

      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestMediaLibraryPermission,
      ]);

      const { result } = renderHook(() => useMediaLibraryPermission());

      const checkPermission = result.current;

      const hasPermission1 = await checkPermission();
      const hasPermission2 = await checkPermission();

      expect(hasPermission1).toBe(true);
      expect(hasPermission2).toBe(true);
      expect(requestMediaLibraryPermission).toHaveBeenCalledTimes(2);
    });
  });

  describe('useLocationPermission', () => {
    it('requests permission when status is UNDETERMINED and returns true when granted', async () => {
      const requestPermission = jest.fn().mockResolvedValue({
        granted: true,
        canAskAgain: true,
        expires: 'never',
        status: Location.PermissionStatus.GRANTED,
      });

      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        { status: Location.PermissionStatus.UNDETERMINED },
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestPermission).toHaveBeenCalled();
      expect(hasPermission).toBe(true);
    });

    it('requests permission when status is UNDETERMINED and returns false when denied', async () => {
      const requestPermission = jest.fn().mockResolvedValue({
        granted: false,
        canAskAgain: false,
        expires: 'never',
        status: Location.PermissionStatus.DENIED,
      });

      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        { status: Location.PermissionStatus.UNDETERMINED },
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestPermission).toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('returns true when permission is already GRANTED without requesting', async () => {
      const requestPermission = jest.fn();

      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        { status: Location.PermissionStatus.GRANTED },
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(true);
    });

    it('returns false when permission is already DENIED without requesting', async () => {
      const requestPermission = jest.fn();

      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        { status: Location.PermissionStatus.DENIED },
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('handles null location permission status', async () => {
      const requestPermission = jest.fn();

      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        null,
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('handles undefined location permission status', async () => {
      const requestPermission = jest.fn();

      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        undefined,
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(requestPermission).not.toHaveBeenCalled();
      expect(hasPermission).toBe(false);
    });

    it('returns a function that can be called multiple times', async () => {
      const requestPermission = jest.fn().mockResolvedValue({
        granted: true,
        status: Location.PermissionStatus.GRANTED,
      });

      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        { status: Location.PermissionStatus.UNDETERMINED },
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;

      const hasPermission1 = await checkPermission();
      const hasPermission2 = await checkPermission();

      expect(hasPermission1).toBe(true);
      expect(hasPermission2).toBe(true);
      expect(requestPermission).toHaveBeenCalledTimes(2);
    });

    it('uses different PermissionStatus for location (from expo-location)', async () => {
      const requestPermission = jest.fn();

      // Note: Location.PermissionStatus.GRANTED is used, not the expo-image-picker one
      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        { status: Location.PermissionStatus.GRANTED },
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;
      const hasPermission = await checkPermission();

      expect(hasPermission).toBe(true);
    });
  });

  describe('Hook Behavior', () => {
    it('each hook returns a function that works correctly across re-renders', async () => {
      const requestCameraPermission = jest.fn().mockResolvedValue({
        granted: true,
        status: PermissionStatus.GRANTED,
      });
      
      (useCameraPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestCameraPermission,
      ]);

      const { result, rerender } = renderHook(() => useCameraPermission());

      const checkPermission1 = result.current;
      const hasPermission1 = await checkPermission1();
      
      rerender({});
      
      const checkPermission2 = result.current;
      const hasPermission2 = await checkPermission2();

      // Both should work correctly even if they're different references
      expect(hasPermission1).toBe(true);
      expect(hasPermission2).toBe(true);
    });

    it('hooks work independently from each other', async () => {
      const requestCameraPermission = jest.fn().mockResolvedValue({
        granted: true,
        status: PermissionStatus.GRANTED,
      });
      const requestMediaLibraryPermission = jest.fn().mockResolvedValue({
        granted: false,
        status: PermissionStatus.DENIED,
      });
      const requestLocationPermission = jest.fn().mockResolvedValue({
        granted: true,
        status: Location.PermissionStatus.GRANTED,
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestCameraPermission,
      ]);
      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestMediaLibraryPermission,
      ]);
      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        { status: Location.PermissionStatus.UNDETERMINED },
        requestLocationPermission,
      ]);

      const { result: cameraResult } = renderHook(() => useCameraPermission());
      const { result: mediaResult } = renderHook(() => useMediaLibraryPermission());
      const { result: locationResult } = renderHook(() => useLocationPermission());

      const hasCamera = await cameraResult.current();
      const hasMedia = await mediaResult.current();
      const hasLocation = await locationResult.current();

      expect(hasCamera).toBe(true);
      expect(hasMedia).toBe(false);
      expect(hasLocation).toBe(true);

      expect(requestCameraPermission).toHaveBeenCalledTimes(1);
      expect(requestMediaLibraryPermission).toHaveBeenCalledTimes(1);
      expect(requestLocationPermission).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('handles camera permission request error', async () => {
      const requestCameraPermission = jest
        .fn()
        .mockRejectedValue(new Error('Permission request failed'));

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestCameraPermission,
      ]);

      const { result } = renderHook(() => useCameraPermission());

      const checkPermission = result.current;

      await expect(checkPermission()).rejects.toThrow('Permission request failed');
    });

    it('handles media library permission request error', async () => {
      const requestMediaLibraryPermission = jest
        .fn()
        .mockRejectedValue(new Error('Permission request failed'));

      (useMediaLibraryPermissions as jest.Mock).mockReturnValue([
        { status: PermissionStatus.UNDETERMINED },
        requestMediaLibraryPermission,
      ]);

      const { result } = renderHook(() => useMediaLibraryPermission());

      const checkPermission = result.current;

      await expect(checkPermission()).rejects.toThrow('Permission request failed');
    });

    it('handles location permission request error', async () => {
      const requestPermission = jest
        .fn()
        .mockRejectedValue(new Error('Permission request failed'));

      (Location.useForegroundPermissions as jest.Mock).mockReturnValue([
        { status: Location.PermissionStatus.UNDETERMINED },
        requestPermission,
      ]);

      const { result } = renderHook(() => useLocationPermission());

      const checkPermission = result.current;

      await expect(checkPermission()).rejects.toThrow('Permission request failed');
    });
  });
});
