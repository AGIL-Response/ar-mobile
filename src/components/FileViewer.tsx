/**
 * FileViewer Component
 * Displays file attachments by fetching and rendering file content
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';

import { blobToDataUri, filesApi } from '@/api/files';
import { Icon, iconNames, Text, View } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/theme';

interface FileViewerProps {
  fileId: string;
  size?: number;
  onPress?: () => void;
}

export function FileViewer({ fileId, size = 100, onPress }: FileViewerProps) {
  const theme = useTheme();
  const authState = useAuthStore();

  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to load file content
  const loadFileContent = useCallback(async () => {
    if (fileDataUri || isLoading) {
      return; // Already loaded or loading
    }

    const userId = authState.user?.id;
    const teamId = authState.selectedTeam?.id;

    if (!userId || !teamId) {
      console.warn('Missing userId or teamId for file loading');
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Loading file:', fileId);
      
      const blob = await filesApi.viewFile({
        fileId,
        assigneeId: userId,
        teamId,
      });

      const dataUri = await blobToDataUri(blob);
      setFileDataUri(dataUri);
      
      console.log('✅ File loaded successfully:', fileId);
    } catch (error) {
      console.error('❌ Failed to load file:', fileId, error);
      setError('Failed to load file');
      Alert.alert('Error', 'Failed to load attachment');
    } finally {
      setIsLoading(false);
    }
  }, [fileId, authState.user?.id, authState.selectedTeam?.id, fileDataUri, isLoading]);

  // Auto-load file when component mounts
  useEffect(() => {
    loadFileContent();
  }, [loadFileContent]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (!fileDataUri && !isLoading && !error) {
      loadFileContent();
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
        borderWidth: 1,
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
      ) : fileDataUri ? (
        <Image
          source={{ uri: fileDataUri }}
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
}
