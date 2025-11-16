import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  PermissionStatus,
  useCameraPermissions,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
import React from 'react';
import { getMimeTypeFromUri } from '../create';

type Props = {
  onAttachmentPicked: (uri: string, mimeType: string) => void;
};

export interface IncidentUploadModelRef {
  takePhoto: () => Promise<void>;
  uploadPhoto: () => Promise<void>;
}

export const IncidentUploadModel = React.forwardRef<
  IncidentUploadModelRef,
  Props
>(({ onAttachmentPicked }, ref) => {
  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();
  const [galleryPermissionInformation, requestGalleryPermission] =
    useMediaLibraryPermissions();

  const verifyCameraPermission = async () => {
    if (cameraPermissionInformation?.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }
    return cameraPermissionInformation?.status === PermissionStatus.GRANTED;
  };

  const verifyGalleryPermission = async () => {
    if (
      galleryPermissionInformation?.status === PermissionStatus.UNDETERMINED
    ) {
      const permissionResponse = await requestGalleryPermission();
      return permissionResponse.granted;
    }
    return galleryPermissionInformation?.status === PermissionStatus.GRANTED;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await verifyCameraPermission();
    if (!hasPermission) {
      return;
    }
    const result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.All, // Allow both images and videos
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
      videoQuality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || getMimeTypeFromUri(asset.uri);
      onAttachmentPicked(asset.uri, mimeType);
    }
  };

  const handleChooseFromGallery = async () => {
    const hasPermission = await verifyGalleryPermission();
    if (!hasPermission) {
      return;
    }
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.All, // Allow both images and videos
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
      videoQuality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || getMimeTypeFromUri(asset.uri);
      onAttachmentPicked(asset.uri, mimeType);
    }
  };

  React.useImperativeHandle(ref, () => ({
    takePhoto: handleTakePhoto,
    uploadPhoto: handleChooseFromGallery,
  }));

  return null;
});
