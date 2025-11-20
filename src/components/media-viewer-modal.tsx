/**
 * Media Viewer Modal Component
 * Unified viewer for both images and videos with navigation support
 */

import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { Text } from '@/components';
import { useTheme } from '@/theme';

import { X } from './icons';

export interface MediaItem {
  fileId: string;
  uri: string;
  mimeType: string;
}

interface MediaViewerModalProps {
  visible: boolean;
  mediaItems: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
}

export function MediaViewerModal({
  visible,
  mediaItems,
  initialIndex = 0,
  onClose,
}: MediaViewerModalProps) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);
  const currentItem = mediaItems[currentIndex];
  const isVideo = currentItem?.mimeType?.startsWith('video/') ?? false;
  const isImage = currentItem?.mimeType?.startsWith('image/') ?? false;

  const videoUri = isVideo && currentItem?.uri ? currentItem.uri : '';
  const player = useVideoPlayer(videoUri, (player) => {
    if (isVideo && currentItem?.uri) {
      player.loop = false;
      player.muted = false;
    }
  });

  const handleClose = () => {
    if (isVideo) {
      player.pause();
    }
    onClose();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      if (isVideo) {
        player.pause();
      }
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      if (isVideo) {
        player.pause();
      }
      setCurrentIndex(currentIndex + 1);
    }
  };

  const swipeGesture = Gesture.Pan().onEnd((event) => {
    'worklet';
    const { translationX, velocityX } = event;
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (translationX < -swipeThreshold || velocityX < -velocityThreshold) {
      runOnJS(handleNext)();
    } else if (translationX > swipeThreshold || velocityX > velocityThreshold) {
      runOnJS(handlePrevious)();
    }
  });

  if (!currentItem) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        {/* Header with Close Button and Counter */}
        <View
          style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            zIndex: 10,
          }}
        >
          {/* Counter */}
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.semantic.white,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            {currentIndex + 1} / {mediaItems.length}
          </Text>

          {/* Close Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.button.ghost },
            ]}
          >
            <X width={20} height={20} color={theme.colors.text.icon} />
          </TouchableOpacity>
        </View>

        {/* Media Content with Swipe Gesture */}
        <GestureDetector gesture={swipeGesture}>
          <View style={styles.mediaContainer}>
            {isVideo ? (
              <VideoView
                player={player}
                style={[styles.media, { width, height: height * 0.7 }]}
                contentFit="contain"
                nativeControls
                allowsFullscreen
              />
            ) : isImage ? (
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                maximumZoomScale={3}
                minimumZoomScale={1}
              >
                <Image
                  source={{ uri: currentItem.uri }}
                  style={[styles.media, { width, height: height * 0.8 }]}
                  resizeMode="contain"
                />
              </ScrollView>
            ) : null}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    alignSelf: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
});
