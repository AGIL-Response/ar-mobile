/**
 * Location Permission Screen Component
 * Shows when location permission is needed for incident creation
 */

import React from 'react';
import { Linking, Platform } from 'react-native';

import { Button, Icon, Text, View, iconNames } from '@/components';
import { useTheme } from '@/theme';

interface LocationPermissionScreenProps {
  onRequestPermission: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function LocationPermissionScreen({
  onRequestPermission,
  onCancel,
  isLoading = false,
  error,
}: LocationPermissionScreenProps) {
  const theme = useTheme();

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: theme.colors.background.primary,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.surface.card,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Icon
          name={iconNames.location}
          size={40}
          color={theme.colors.text.secondary}
        />
      </View>

      {/* Title */}
      <Text
        variant="h4"
        style={{
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        Location Access Required
      </Text>

      {/* Description */}
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 20,
        }}
      >
        To create an incident, we need to know your current location. This helps emergency responders find you quickly and accurately.
      </Text>

      {/* Error Message */}
      {error && (
        <View
          style={{
            backgroundColor: theme.colors.semantic.error + '20',
            borderRadius: 8,
            padding: 12,
            marginBottom: 24,
            alignSelf: 'stretch',
          }}
        >
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.semantic.error,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Buttons */}
      <View
        style={{
          alignSelf: 'stretch',
        }}
      >
        {/* Grant Permission Button */}
        <Button
          variant="solid"
          size="medium"
          title={isLoading ? 'Requesting Permission...' : 'Allow Location Access'}
          onPress={onRequestPermission}
          disabled={isLoading}
          style={{ 
            width: '100%',
            marginBottom: 12,
          }}
        />

        {/* Settings Button (if permission was denied) */}
        {error && error.includes('denied') && (
          <Button
            variant="outline"
            size="medium"
            title="Open Settings"
            onPress={handleOpenSettings}
            style={{ 
              width: '100%',
              marginBottom: 12,
            }}
          />
        )}

        {/* Cancel Button */}
        <Button
          variant="ghost"
          size="medium"
          title="Cancel"
          onPress={onCancel}
          style={{ width: '100%' }}
        />
      </View>

      {/* Privacy Note */}
      <Text
        variant="caption"
        style={{
          color: theme.colors.text.muted,
          textAlign: 'center',
          marginTop: 24,
          lineHeight: 18,
        }}
      >
        Your location is only used for incident reporting and is not stored or shared with third parties.
      </Text>
    </View>
  );
}
