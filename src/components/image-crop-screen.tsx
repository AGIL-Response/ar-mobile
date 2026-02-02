/**
 * Image Crop Screen Component
 * Custom crop screen with AppBar, safe area handling, and crop controls
 * Supports drag, zoom, and rotation
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image as RNImage,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppBar } from './app-bar';
import { Button } from './button';
import { Icon, iconNames } from './icon';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from '@/lib/hooks';
import { View } from './view';

export interface ImageCropScreenProps {
  visible: boolean;
  imageUri: string;
  onConfirm: (croppedUri: string) => void;
  onCancel: () => void;
}

export function ImageCropScreen({
  visible,
  imageUri,
  onConfirm,
  onCancel,
}: ImageCropScreenProps) {
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  // Calculate crop area dimensions (not full screen)
  // Leave space for AppBar at top and action buttons at bottom
  const appBarHeight = 56;
  const bottomBarHeight = 80;
  const horizontalPadding = 16;
  const verticalPadding = 16;

  const availableHeight =
    screenHeight - topInset - appBarHeight - bottomBarHeight - bottomInset - verticalPadding * 2;
  const availableWidth = screenWidth - horizontalPadding * 2;
  const cropAreaHeight = Math.min(availableHeight, availableWidth * 1.2); // Max 1.2:1 aspect ratio
  const cropAreaWidth = availableWidth;

  // Animated values for image transform
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  // Get image dimensions when imageUri changes
  useEffect(() => {
    if (visible && imageUri) {
      RNImage.getSize(
        imageUri,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => {
          console.error('Error getting image size:', error);
          // Fallback to crop area dimensions
          setImageSize({ width: cropAreaWidth, height: cropAreaHeight });
        }
      );
    }
  }, [visible, imageUri, cropAreaWidth, cropAreaHeight]);

  // Reset values when image changes or modal opens
  useEffect(() => {
    if (visible) {
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      savedScale.value = 1;
      setRotation(0);
    }
  }, [visible, imageUri]);

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      // Constrain translation to keep image within bounds
      constrainImagePosition();
    });

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(3, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      constrainImagePosition();
    });

  // Combined gestures
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Constrain image position to keep it within crop bounds
  const constrainImagePosition = () => {
    'worklet';
    if (!imageSize) return;

    const imageDisplayWidth = imageSize.width * scale.value;
    const imageDisplayHeight = imageSize.height * scale.value;

    const maxTranslateX = Math.max(0, (imageDisplayWidth - cropAreaWidth) / 2);
    const maxTranslateY = Math.max(0, (imageDisplayHeight - cropAreaHeight) / 2);

    translateX.value = withSpring(
      Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value))
    );
    translateY.value = withSpring(
      Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value))
    );

    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  };

  // Animated style for image
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    // Reset position after rotation
    setTimeout(() => {
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }, 100);
  };

  const handleConfirm = async () => {
    if (isProcessing || !imageSize) return;

    setIsProcessing(true);
    try {
      let currentUri = imageUri;
      let currentImageSize = imageSize;

      // First, apply rotation if needed
      if (rotation !== 0) {
        const rotated = await ImageManipulator.manipulateAsync(
          currentUri,
          [{ rotate: rotation }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        currentUri = rotated.uri;
        // After rotation, swap dimensions if needed
        currentImageSize = {
          width: rotation === 90 || rotation === 270 ? imageSize.height : imageSize.width,
          height: rotation === 90 || rotation === 270 ? imageSize.width : imageSize.height,
        };
      }

      // Calculate how the image is displayed with contentFit="contain"
      // expo-image scales the image to fit within cropAreaWidth x cropAreaHeight
      const imageAspectRatio = currentImageSize.width / currentImageSize.height;
      const cropAspectRatio = cropAreaWidth / cropAreaHeight;

      // Calculate the base displayed size (how expo-image scales it to fit)
      let baseDisplayedWidth: number;
      let baseDisplayedHeight: number;
      let scaleToFit: number;

      if (imageAspectRatio > cropAspectRatio) {
        // Image is wider - fit to width
        baseDisplayedWidth = cropAreaWidth;
        baseDisplayedHeight = cropAreaWidth / imageAspectRatio;
        scaleToFit = cropAreaWidth / currentImageSize.width;
      } else {
        // Image is taller - fit to height
        baseDisplayedHeight = cropAreaHeight;
        baseDisplayedWidth = cropAreaHeight * imageAspectRatio;
        scaleToFit = cropAreaHeight / currentImageSize.height;
      }

      // The displayed image size after user's scale transform
      const displayedWidth = baseDisplayedWidth * scale.value;
      const displayedHeight = baseDisplayedHeight * scale.value;

      // The image is centered in the Animated.View, then translated
      // Calculate the visible region in the crop area
      const cropAreaLeft = 0;
      const cropAreaTop = 0;
      const cropAreaRight = cropAreaWidth;
      const cropAreaBottom = cropAreaHeight;

      // Image center position in the container (accounting for translation)
      const imageCenterX = cropAreaWidth / 2 + translateX.value;
      const imageCenterY = cropAreaHeight / 2 + translateY.value;

      // Image bounds in container coordinates
      const imageLeft = imageCenterX - displayedWidth / 2;
      const imageRight = imageCenterX + displayedWidth / 2;
      const imageTop = imageCenterY - displayedHeight / 2;
      const imageBottom = imageCenterY + displayedHeight / 2;

      // Calculate intersection of crop area and image
      const visibleLeft = Math.max(cropAreaLeft, imageLeft);
      const visibleTop = Math.max(cropAreaTop, imageTop);
      const visibleRight = Math.min(cropAreaRight, imageRight);
      const visibleBottom = Math.min(cropAreaBottom, imageBottom);

      // Convert visible region from container coordinates to displayed image coordinates
      const visibleLeftInImage = visibleLeft - imageLeft;
      const visibleTopInImage = visibleTop - imageTop;
      const visibleWidthInImage = visibleRight - visibleLeft;
      const visibleHeightInImage = visibleBottom - visibleTop;

      // Convert from displayed image coordinates to original image coordinates
      // First account for the user's scale, then the fit scale
      const cropX = (visibleLeftInImage / scale.value) / scaleToFit;
      const cropY = (visibleTopInImage / scale.value) / scaleToFit;
      const cropWidth = (visibleWidthInImage / scale.value) / scaleToFit;
      const cropHeight = (visibleHeightInImage / scale.value) / scaleToFit;

      // Ensure crop coordinates are within bounds
      const safeCropX = Math.max(0, Math.min(Math.round(cropX), currentImageSize.width - 1));
      const safeCropY = Math.max(0, Math.min(Math.round(cropY), currentImageSize.height - 1));
      const safeCropWidth = Math.min(Math.round(cropWidth), currentImageSize.width - safeCropX);
      const safeCropHeight = Math.min(Math.round(cropHeight), currentImageSize.height - safeCropY);

      // Ensure minimum dimensions
      if (safeCropWidth < 1 || safeCropHeight < 1) {
        throw new Error('Crop area too small');
      }

      // Apply crop
      const cropped = await ImageManipulator.manipulateAsync(
        currentUri,
        [
          {
            crop: {
              originX: safeCropX,
              originY: safeCropY,
              width: safeCropWidth,
              height: safeCropHeight,
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      onConfirm(cropped.uri);
    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback to original image if manipulation fails
      onConfirm(imageUri);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setRotation(0);
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    savedScale.value = 1;
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancel}
      statusBarTranslucent={false}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          edges={['top', 'bottom']}
          style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
        >
          {/* Top AppBar */}
          <AppBar
            variant="header"
            title="Crop Image"
            showBackButton
            onBackPress={handleCancel}
            safeArea={false}
            rightContent={
              <TouchableOpacity
                onPress={handleRotate}
                style={styles.rotateButton}
                disabled={isProcessing}
              >
                <Icon
                  name={iconNames.refresh}
                  size={24}
                  color={theme.colors.text.icon}
                />
              </TouchableOpacity>
            }
          />

          {/* Crop Area */}
          <View
            style={[
              styles.cropContainer,
              {
                width: cropAreaWidth,
                height: cropAreaHeight,
                marginTop: verticalPadding,
                marginBottom: verticalPadding,
                marginHorizontal: horizontalPadding,
              },
            ]}
          >
            <View
              style={[
                styles.imageWrapper,
                {
                  width: cropAreaWidth,
                  height: cropAreaHeight,
                  backgroundColor: theme.colors.background.secondary,
                },
              ]}
            >
              <GestureDetector gesture={composedGesture}>
                <Animated.View
                  style={[
                    styles.imageContainer,
                    {
                      width: cropAreaWidth,
                      height: cropAreaHeight,
                    },
                    animatedImageStyle,
                  ]}
                >
                  <Image
                    source={{ uri: imageUri }}
                    style={[
                      styles.image,
                      {
                        width: imageSize?.width || cropAreaWidth,
                        height: imageSize?.height || cropAreaHeight,
                      },
                    ]}
                    contentFit="contain"
                    transition={200}
                  />
                </Animated.View>
              </GestureDetector>
            </View>

            {/* Crop Overlay (visual guide) */}
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.overlayTop} />
              <View style={styles.overlayMiddle}>
                <View style={styles.overlayLeft} />
                <View style={styles.cropFrame} />
                <View style={styles.overlayRight} />
              </View>
              <View style={styles.overlayBottom} />
            </View>
          </View>

          {/* Bottom Action Bar */}
          <View
            style={[
              styles.actionBar,
              {
                paddingBottom: bottomInset,
                backgroundColor: theme.colors.background.primary,
                borderTopColor: theme.colors.surface.border,
              },
            ]}
          >
            <Button
              variant="outline"
              size="large"
              title="Cancel"
              onPress={handleCancel}
              disabled={isProcessing}
              style={styles.cancelButton}
              colorVariant="secondary"
            />
            <Button
              variant="solid"
              size="large"
              title={isProcessing ? 'Processing...' : 'Confirm'}
              onPress={handleConfirm}
              disabled={isProcessing}
              style={styles.confirmButton}
              colorVariant="primary"
              icon={
                isProcessing ? (
                  <ActivityIndicator size="small" color={theme.colors.semantic.white} />
                ) : undefined
              }
            />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cropContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    width: '100%',
    height: '60%',
  },
  overlayLeft: {
    width: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cropFrame: {
    width: '80%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  overlayRight: {
    width: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  rotateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
