/**
 * Hook for handling media selection (camera and gallery)
 * Single Responsibility: Manage media selection from camera/gallery
 */

import { useCameraPermission, useMediaLibraryPermission } from '@/lib/media-permissions';
import type { MediaFile } from '@/utils/media';
import { ensureFileExtension, validateMediaFile } from '@/utils/media';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Alert } from 'react-native';

/**
 * Normalize HEIC/HEIF mimeTypes to JPG
 * On iOS, when allowsEditing is enabled, HEIC images are converted to JPG
 */
const normalizeImageMimeType = (mimeType: string | null | undefined, fileName?: string): string => {
    if (!mimeType) return 'image/jpeg';

    const mimeLower = mimeType.toLowerCase();
    // Convert HEIC/HEIF to JPG
    if (mimeLower === 'image/heic' || mimeLower === 'image/heif' ||
        fileName?.toLowerCase().endsWith('.heic') || fileName?.toLowerCase().endsWith('.heif')) {
        return 'image/jpeg';
    }

    return mimeType;
};

export interface UseMediaSelectionReturn {
    takePhoto: () => Promise<MediaFile | null>;
    pickFromGallery: () => Promise<MediaFile | null>;
}

export function useMediaSelection(): UseMediaSelectionReturn {
    const verifyCameraPermission = useCameraPermission();
    const verifyMediaLibraryPermission = useMediaLibraryPermission();

    const takePhoto = useCallback(async (): Promise<MediaFile | null> => {
        try {
            const hasPermission = await verifyCameraPermission();
            if (!hasPermission) {
                Alert.alert('Permission required', 'Please grant permission to access your camera');
                return null;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images', 'videos'] as any,
                allowsEditing: true, // Enable editing to force HEIC conversion to JPG on iOS
                quality: 0.8,
                videoQuality: 1,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                const rawMimeType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
                const mimeType = normalizeImageMimeType(rawMimeType, asset.fileName || undefined);
                const baseName = asset.fileName || `camera_${Date.now()}`;
                const fileName = ensureFileExtension(baseName, mimeType);

                const newAttachment: MediaFile = {
                    uri: asset.uri,
                    name: fileName,
                    type: asset.type || 'image',
                    size: asset.fileSize || 0,
                    mimeType,
                };

                const validation = validateMediaFile(newAttachment);
                if (validation.valid) {
                    return newAttachment;
                } else {
                    Alert.alert('Invalid file', validation.error || 'File validation failed');
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error('Error taking photo:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to take photo';

            if (errorMessage.includes('simulator') || errorMessage.includes('not available')) {
                Alert.alert(
                    'Camera Not Available',
                    'Camera is not available on this device or simulator. Please use a physical device or select from gallery instead.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', errorMessage);
            }
            return null;
        }
    }, [verifyCameraPermission]);

    const pickFromGallery = useCallback(async (): Promise<MediaFile | null> => {
        try {
            const hasPermission = await verifyMediaLibraryPermission();
            if (!hasPermission) {
                Alert.alert('Permission required', 'Please grant permission to access your photos');
                return null;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'] as any,
                allowsMultipleSelection: false,
                allowsEditing: true, // Enable editing to force HEIC conversion to JPG on iOS
                quality: 0.8,
                selectionLimit: 1,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                const rawMimeType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
                const mimeType = normalizeImageMimeType(rawMimeType, asset.fileName || undefined);
                const baseName = asset.fileName || `media_${Date.now()}`;
                const fileName = ensureFileExtension(baseName, mimeType);

                const newAttachment: MediaFile = {
                    uri: asset.uri,
                    name: fileName,
                    type: asset.type || 'image',
                    size: asset.fileSize || 0,
                    mimeType,
                };

                const validation = validateMediaFile(newAttachment);
                if (validation.valid) {
                    return newAttachment;
                } else {
                    Alert.alert('Invalid file', validation.error || 'File validation failed');
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick media');
            return null;
        }
    }, [verifyMediaLibraryPermission]);

    return {
        takePhoto,
        pickFromGallery,
    };
}

