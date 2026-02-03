import React from 'react';
import ImagePicker from 'react-native-image-crop-picker';

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
    try {
      const hasPermission = await verifyCameraPermission();
      if (!hasPermission) {
        return;
      }

      // Open camera with cropping enabled for images
      // Videos will be returned without cropping (library handles this automatically)
      const result = await ImagePicker.openCamera({
        width: 1920,
        height: 1920,
        cropping: true, // Enabled for images, ignored for videos
        compressImageQuality: 0.9,
        includeBase64: false,
        mediaType: 'any', // Allow both images and videos
      });

      // Result will have path for both images and videos
      if (result.path) {
        const mimeType = result.mime || getMimeTypeFromUri(result.path);
        onAttachmentPicked(result.path, mimeType);
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (
        error?.message !== 'User cancelled image selection' &&
        error?.message !== 'User cancelled camera'
      ) {
        console.error('Error taking photo:', error);
      }
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const hasPermission = await verifyGalleryPermission();
      if (!hasPermission) {
        return;
      }

      // Open picker with cropping enabled for images
      // Videos will be returned without cropping (library handles this automatically)
      const result = await ImagePicker.openPicker({
        width: 1920,
        height: 1920,
        cropping: true, // Enabled for images, ignored for videos
        compressImageQuality: 0.9,
        includeBase64: false,
        mediaType: 'any', // Allow both images and videos
      });

      // Result will have path for both images and videos
      if (result.path) {
        const mimeType = result.mime || getMimeTypeFromUri(result.path);
        onAttachmentPicked(result.path, mimeType);
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (
        error?.message !== 'User cancelled image selection' &&
        error?.message !== 'User cancelled image picker'
      ) {
        console.error('Error choosing from gallery:', error);
      }
    }
  };

  React.useImperativeHandle(ref, () => ({
    takePhoto: handleTakePhoto,
    uploadPhoto: handleChooseFromGallery,
  }));

  return null;
});

IncidentUploadModel.displayName = 'IncidentUploadModel';
