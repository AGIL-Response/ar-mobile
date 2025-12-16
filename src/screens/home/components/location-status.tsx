import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from '@/components';
import { useLocationStore } from '@/stores/location';
import type { Theme } from '@/theme';
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

  const styles = createStyles(theme, statusColor, isMonitoring);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{statusIcon}</Text>
        <Text style={styles.title}>
          Location Status
        </Text>
      </View>
      
      <Text style={styles.statusText}>
        {statusText}
      </Text>
      
      {isMonitoring && (
        <Text style={styles.monitoringText}>
          Sending location every 10 seconds
        </Text>
      )}
    </View>
  );
}

const createStyles = (theme: Theme, statusColor: string, isMonitoring: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.secondary,
      padding: 12,
      margin: 8,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: statusColor,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    icon: {
      fontSize: 16,
      marginRight: 8,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    statusText: {
      fontSize: 12,
      color: statusColor,
      marginLeft: 24,
    },
    monitoringText: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      marginLeft: 24,
      marginTop: 2,
    },
  });
