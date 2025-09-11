/**
 * Map View Component
 * Contains map interface for the map view tab
 */

import Mapbox, { MapView as MapboxMapView } from '@rnmapbox/maps';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components';
import { type Theme, useTheme } from '@/theme';

Mapbox.setAccessToken(
  'sk.eyJ1IjoibGFpem4iLCJhIjoiY21lamxqZzh4MDQ0bjJrcXZ0dWRiZHAzNyJ9.NU6sHZrIkDuDpHCEManSJQ'
);

export function MapView() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, width: '100%' }}>
        <MapboxMapView
          style={styles.map}
          styleURL={theme.isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    map: {
      flex: 1,
    },
  });
};
