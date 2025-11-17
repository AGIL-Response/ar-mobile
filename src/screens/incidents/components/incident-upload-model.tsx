import React from 'react';

import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
} from 'expo-image-picker';

import {
  useCameraPermission,
  useMediaLibraryPermission,
} from '@/lib/media-permissions';
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
  const verifyCameraPermission = useCameraPermission();
  const verifyGalleryPermission = useMediaLibraryPermission();

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
