/**
 * Hook for handling media selection (camera and gallery)
 * Single Responsibility: Manage media selection from camera/gallery
 */

import { useCameraPermission, useMediaLibraryPermission } from '@/lib/media-permissions';
import type { MediaFile } from '@/utils/media';
import { ensureFileExtension, validateMediaFile } from '@/utils/media';
import ImagePicker from 'react-native-image-crop-picker';
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

            const result = await ImagePicker.openCamera({
                width: 1920,
                height: 1920,
                cropping: true, // Enabled for images, ignored for videos
                compressImageQuality: 0.8,
                includeBase64: false,
                mediaType: 'any', // Allow both images and videos
            });

            if (result.path) {
                const rawMimeType = result.mime || (result.path.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
                const mimeType = normalizeImageMimeType(rawMimeType, result.filename || undefined);
                const baseName = result.filename || `camera_${Date.now()}`;
                const fileName = ensureFileExtension(baseName, mimeType);

                const newAttachment: MediaFile = {
                    uri: result.path,
                    name: fileName,
                    type: rawMimeType.startsWith('video/') ? 'video' : 'image',
                    size: result.size || 0,
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
        } catch (error: any) {
            // User cancelled or error occurred
            if (
                error?.message !== 'User cancelled image selection' &&
                error?.message !== 'User cancelled camera'
            ) {
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

            const result = await ImagePicker.openPicker({
                width: 1920,
                height: 1920,
                cropping: true, // Enabled for images, ignored for videos
                compressImageQuality: 0.8,
                includeBase64: false,
                mediaType: 'any', // Allow both images and videos
            });

            if (result.path) {
                const rawMimeType = result.mime || (result.path.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
                const mimeType = normalizeImageMimeType(rawMimeType, result.filename || undefined);
                const baseName = result.filename || `media_${Date.now()}`;
                const fileName = ensureFileExtension(baseName, mimeType);

                const newAttachment: MediaFile = {
                    uri: result.path,
                    name: fileName,
                    type: rawMimeType.startsWith('video/') ? 'video' : 'image',
                    size: result.size || 0,
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
        } catch (error: any) {
            // User cancelled or error occurred
            if (
                error?.message !== 'User cancelled image selection' &&
                error?.message !== 'User cancelled image picker'
            ) {
                console.error('Error picking image:', error);
                Alert.alert('Error', 'Failed to pick media');
            }
            return null;
        }
    }, [verifyMediaLibraryPermission]);

    return {
        takePhoto,
        pickFromGallery,
    };
}

