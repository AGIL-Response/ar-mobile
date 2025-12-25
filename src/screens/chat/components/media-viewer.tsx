/**
 * MediaViewer Component
 * Full-screen media viewer for images, videos, and audio
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import { Icon, Text } from '@/components';
import { useTheme } from '@/theme';
import { Video, ResizeMode } from 'expo-av';
import { getMediaType } from '@/utils/media';
import type { ChatAttachment } from '@/services/chat';

export interface MediaViewerProps {
  visible: boolean;
  attachments: ChatAttachment[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function MediaViewer({
  visible,
  attachments,
  initialIndex = 0,
  onClose,
}: MediaViewerProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const currentAttachment = attachments[currentIndex];
  const mediaType = getMediaType(currentAttachment.filename);
  const hasMultiple = attachments.length > 1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < attachments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text
              variant="body"
              style={styles.filename}
              numberOfLines={1}
            >
              {currentAttachment.filename}
            </Text>
            {hasMultiple && (
              <Text variant="caption" style={styles.counter}>
                {currentIndex + 1} / {attachments.length}
              </Text>
            )}
          </View>
        </View>

        {/* Media Content */}
        <View style={styles.mediaContainer}>
          {mediaType === 'image' ? (
            currentAttachment.url ? (
              <Image
                source={{ uri: currentAttachment.url }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.unsupportedContainer}>
                <Text style={{ fontSize: 80 }}>🖼️</Text>
                <Text variant="body" style={styles.unsupportedText}>
                  Image not available
                </Text>
              </View>
            )
          ) : mediaType === 'video' ? (
            currentAttachment.url ? (
              <Video
                source={{ uri: currentAttachment.url }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
              />
            ) : (
              <View style={styles.unsupportedContainer}>
                <Text style={{ fontSize: 80 }}>🎬</Text>
                <Text variant="body" style={styles.unsupportedText}>
                  Video not available
                </Text>
              </View>
            )
          ) : mediaType === 'audio' ? (
              <View style={styles.audioContainer}>
              <Text style={{ fontSize: 80 }}>🎵</Text>
              <Text variant="body" style={styles.audioText}>
                {currentAttachment.filename}
              </Text>
              {currentAttachment.url ? (
                <Video
                  source={{ uri: currentAttachment.url }}
                  style={{ height: 100 }}
                  useNativeControls
                  shouldPlay={false}
                />
              ) : null}
            </View>
          ) : (
            <View style={styles.unsupportedContainer}>
              <Text style={{ fontSize: 80 }}>📄</Text>
              <Text variant="body" style={styles.unsupportedText}>
                Preview not available
              </Text>
              <Text variant="caption" style={styles.unsupportedSubtext}>
                {currentAttachment.filename}
              </Text>
            </View>
          )}
        </View>

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={handlePrevious}
              >
                <Icon name="chevronLeft" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {currentIndex < attachments.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={handleNext}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 32 }}>›</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  filename: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  counter: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
  },
  audioContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  audioText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  unsupportedContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  unsupportedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  unsupportedSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -25 }],
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
});

