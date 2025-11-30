import {
  PermissionStatus,
  useCameraPermissions,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
import * as Location from 'expo-location';

export function useCameraPermission() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  return async () => {
    if (cameraPermission?.status === PermissionStatus.UNDETERMINED) {
      const response = await requestCameraPermission();
      return response.granted;
    }
    return cameraPermission?.status === PermissionStatus.GRANTED;
  };
}

export function useMediaLibraryPermission() {
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    useMediaLibraryPermissions();

  return async () => {
    if (mediaLibraryPermission?.status === PermissionStatus.UNDETERMINED) {
      const response = await requestMediaLibraryPermission();
      return response.granted;
    }
    return mediaLibraryPermission?.status === PermissionStatus.GRANTED;
  };
}

export function useLocationPermission() {
  const [status, requestPermission] = Location.useForegroundPermissions();
  return async () => {
    if (status?.status === PermissionStatus.UNDETERMINED) {
      const response = await requestPermission();
      return response.granted;
    }
    return status?.status === Location.PermissionStatus.GRANTED;
  };
}