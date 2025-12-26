/**
 * Composer Action Buttons Component
 * Single Responsibility: Renders action buttons (camera, image, microphone)
 */

import React from 'react';
import { View } from 'react-native';
import { IconButton } from '@/components';
import { useTheme } from '@/theme';

interface ComposerActionButtonsProps {
  onTakePhoto: () => void;
  onPickImage: () => void;
  onStartRecording: () => void;
  disabled?: boolean;
}

export function ComposerActionButtons({
  onTakePhoto,
  onPickImage,
  onStartRecording,
  disabled = false,
}: ComposerActionButtonsProps) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <IconButton
        icon="camera"
        size="large"
        colorVariant="transparent"
        iconColor={theme.colors.button.secondary}
        disabled={disabled}
        onPress={onTakePhoto}
        accessibilityLabel="Take photo"
      />

      <IconButton
        icon="image"
        size="large"
        colorVariant="transparent"
        iconColor={theme.colors.button.secondary}
        disabled={disabled}
        onPress={onPickImage}
        accessibilityLabel="Pick image"
      />

      <IconButton
        icon="microphone"
        size="large"
        colorVariant="transparent"
        iconColor={theme.colors.button.secondary}
        disabled={disabled}
        onPress={onStartRecording}
        accessibilityLabel="Start recording"
      />
    </View>
  );
}

