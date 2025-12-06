import React, { useMemo } from 'react';
import { View, Text } from '@/components';
import { useLocationStore } from '@/stores/location';
import { useTheme } from '@/theme';

export function LocationStatus() {
  const theme = useTheme();
  const isMonitoring = useLocationStore((state) => state.isMonitoring);
  const isSocketConnected = useLocationStore((state) => state.isSocketConnected);
  const hasLocationPermission = useLocationStore((state) => state.hasLocationPermission);
  const error = useLocationStore((state) => state.error);
  const coordinates = useLocationStore((state) => state.coordinates);
  
  const statusColor = useMemo(
    () => {
      if (error) return theme.colors.status.error;
      if (isMonitoring && isSocketConnected && hasLocationPermission) {
        return theme.colors.status.success;
      }
      if (hasLocationPermission === false) return theme.colors.status.warning;
      return theme.colors.text.secondary;
    },
    [error, isMonitoring, isSocketConnected, hasLocationPermission, theme.colors]
  );

  const statusText = useMemo(
    () => {
      if (error) return `Error: ${error}`;
      if (hasLocationPermission === false) return 'Location permission denied';
      if (!isMonitoring) return 'Location monitoring stopped';
      if (!isSocketConnected) return 'WebSocket disconnected';
      if (coordinates) {
        return `📍 ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
      }
      return 'Getting location...';
    },
    [error, hasLocationPermission, isMonitoring, isSocketConnected, coordinates]
  );

  const statusIcon = useMemo(
    () => {
      if (error) return '❌';
      if (isMonitoring && isSocketConnected && hasLocationPermission) {
        return '✅';
      }
      if (hasLocationPermission === false) return '⚠️';
      return '🔄';
    },
    [error, isMonitoring, isSocketConnected, hasLocationPermission]
  );

  return (
      <View
        style={{
          backgroundColor: theme.colors.background.secondary,
          padding: 12,
          margin: 8,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
        }}
      >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>{statusIcon}</Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}
        >
          Location Status
        </Text>
      </View>
      
      <Text
        style={{
          fontSize: 12,
          color: statusColor,
          marginLeft: 24,
        }}
      >
        {statusText}
      </Text>
      
      {isMonitoring && (
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.text.secondary,
            marginLeft: 24,
            marginTop: 2,
          }}
        >
          Sending location every 10 seconds
        </Text>
      )}
    </View>
  );
}
