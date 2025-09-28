import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View } from '@/components';
import { Modal } from '@/components/modal';
import { useTheme } from '@/theme';
import {
  useCameraPermissions,
  launchCameraAsync,
  PermissionStatus,
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
type Props = {
  ref: React.RefObject<any>;
  onImagePicked: (image: string) => void;
};

export const IncidentUploadModel = React.forwardRef<any, Props>(
  ({ onImagePicked }, ref) => {
    const theme = useTheme();

    const [cameraPermissionInformation, requestPermission] =
      useCameraPermissions();
    const [galleryPermissionInformation, requestGalleryPermission] =
      useMediaLibraryPermissions();

    const verifyCameraPermission = async () => {
      if (
        cameraPermissionInformation?.status === PermissionStatus.UNDETERMINED
      ) {
        const permissionResponse = await requestPermission();
        return permissionResponse.granted;
      }
      return true;
    };

    const verifyGalleryPermission = async () => {
      if (
        galleryPermissionInformation?.status === PermissionStatus.UNDETERMINED
      ) {
        const permissionResponse = await requestGalleryPermission();
        return permissionResponse.granted;
      }
      return true;
    };

    const handleTakePhoto = async () => {
      const hasPermission = await verifyCameraPermission();
      if (!hasPermission) {
        return;
      }
      const image = await launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!image.canceled) {
        console.log(image.assets[0].uri);
        onImagePicked(image.assets[0].uri);
      }
    };

    const handleChooseFromGallery = async () => {
      const hasPermission = await verifyGalleryPermission();
      if (!hasPermission) {
        return;
      }
      const image = await launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!image.canceled) {
        console.log(image.assets[0].uri);
        onImagePicked(image.assets[0].uri);
      }
    };

    return (
      <Modal ref={ref}>
        <View style={{ flex: 1, padding: 20 }}>
          <TouchableOpacity
            onPress={handleTakePhoto}
            style={{ marginBottom: 20 }}
          >
            <Text variant="h4">Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleChooseFromGallery}>
            <Text variant="h4">Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
);
