/**
 * Map View Component
 * Contains map interface for the map view tab
 */

import Mapbox, { MapView as MapboxMapView, PointAnnotation, Camera } from '@rnmapbox/maps';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View, Icon, iconNames } from '@/components';
import { type Theme, useTheme } from '@/theme';
import { useIncidentsStore } from '@/stores/incidents';
import { useMemo } from 'react';
import { getCoordinate } from '@/screens/incidents/utils';

Mapbox.setAccessToken(
  'sk.eyJ1IjoibGFpem4iLCJhIjoiY21lamxqZzh4MDQ0bjJrcXZ0dWRiZHAzNyJ9.NU6sHZrIkDuDpHCEManSJQ'
);

export function MapView() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const incidentsState = useIncidentsStore();


  const coordinates = useMemo(() => {
    return incidentsState.incidents
      ?.flatMap((incident) => incident.location || [])
      .map((coord) => getCoordinate(coord.coordinates))
      .filter(Boolean) as [number, number][];
  }, [incidentsState.incidents]);


  return (
    <View style={styles.container}>
      <View style={{ flex: 1, width: '100%' }}>
        <MapboxMapView
          style={styles.map}
          styleURL={theme.isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
        >
          {coordinates.length > 0 && (
            <Camera zoomLevel={12} centerCoordinate={coordinates[0]} />
          )}

          {coordinates.map((coordinate, i) => (
            <PointAnnotation key={`marker-${i}`} id={`marker-${i}`} coordinate={coordinate}>
              <View style={{ alignItems: 'center' }}>
                <Icon name={iconNames.incident} size={32} color={theme.colors.semantic.error} />
              </View>
            </PointAnnotation>
          ))}
        </MapboxMapView>
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
