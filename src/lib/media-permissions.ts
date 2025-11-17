import {
  PermissionStatus,
  useCameraPermissions,
  useMediaLibraryPermissions,
} from 'expo-image-picker';

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