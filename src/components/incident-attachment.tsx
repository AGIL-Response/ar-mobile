/**
 * Incident Attachment Component
 * Displays incident file attachments by fetching and rendering file content
 */

import React from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';

import { Icon, iconNames, Text, View } from '@/components';
import { useTheme } from '@/theme';

import { type FileSourceProps, withFileSource } from './withFileSource';

interface IncidentAttachmentProps extends FileSourceProps {
  fileId: string;
  size?: number;
  onPress?: () => void;
}

interface IncidentAttachmentBaseProps extends IncidentAttachmentProps {
  sourceResult?: FileSourceProps['sourceResult'];
  isLoading?: FileSourceProps['isLoading'];
  error?: FileSourceProps['error'];
}

const IncidentAttachmentBase = ({
  fileId,
  size = 100,
  onPress,
  sourceResult,
  isLoading = false,
  error = null,
}: IncidentAttachmentBaseProps) => {
  const theme = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (error) {
      // Show error alert if file failed to load
      Alert.alert('Error', 'Failed to load attachment');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        backgroundColor: theme.colors.background.secondary,
        borderWidth: 2,
        borderColor: theme.colors.text.tertiary,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoading ? (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Icon
            name={iconNames.clock}
            size={Math.min(24, size / 4)}
            color={theme.colors.text.secondary}
          />
          <Text
            variant="caption"
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'center',
              fontSize: Math.min(10, size / 10),
            }}
          >
            Loading...
          </Text>
        </View>
      ) : error ? (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Icon
            name={iconNames.incident}
            size={Math.min(24, size / 4)}
            color={theme.colors.semantic.error}
          />
          <Text
            variant="caption"
            style={{
              color: theme.colors.semantic.error,
              textAlign: 'center',
              fontSize: Math.min(10, size / 10),
            }}
          >
            Error
          </Text>
        </View>
      ) : sourceResult ? (
        <Image
          source={sourceResult}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Icon
            name={iconNames.plus}
            size={Math.min(24, size / 4)}
            color={theme.colors.text.secondary}
          />
          <Text
            variant="caption"
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'center',
              fontSize: Math.min(10, size / 10),
            }}
          >
            Tap to load
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

IncidentAttachmentBase.displayName = 'IncidentAttachmentBase';

/**
 * IncidentAttachment component with file loading support via HOC
 */
export const IncidentAttachment = withFileSource(
  IncidentAttachmentBase,
  {
    autoLoad: true,
    logErrors: true,
  }
) as React.ComponentType<IncidentAttachmentProps>;

