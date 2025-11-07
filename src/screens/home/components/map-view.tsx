/**
 * Map View Component
 * Contains map interface for the map view tab
 */

import Mapbox, {
  MapView as MapboxMapView,
  PointAnnotation,
  Camera,
} from '@rnmapbox/maps';
import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { View, Icon, iconNames } from '@/components';
import { type Theme, useTheme } from '@/theme';
import { useIncidentsStore } from '@/stores/incidents';
import { useMemo } from 'react';
import { getCoordinate } from '@/screens/incidents/utils';
import { router } from 'expo-router';
import { IncidentCoordinate } from '../types';

Mapbox.setAccessToken(
  'sk.eyJ1IjoibGFpem4iLCJhIjoiY21lamxqZzh4MDQ0bjJrcXZ0dWRiZHAzNyJ9.NU6sHZrIkDuDpHCEManSJQ'
);

export function MapView() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const incidentsState = useIncidentsStore();
  const cameraRef = useRef<Mapbox.Camera>(null);

  const coordinates = useMemo<IncidentCoordinate[]>(() => {
    return incidentsState.incidents
      ?.filter((incident) => incident.location?.coordinates) // only with coords
      .map((incident) => ({
        id: incident.id,
        coordinates: getCoordinate(incident.location!.coordinates) as [
          number,
          number,
        ],
      }))
      .filter((item) => Boolean(item.coordinates));
  }, [incidentsState.incidents]);

  const handleMarkerPress = (incidentId: string) => {
    router.push(`/incidents/${incidentId}`);
  };

  useEffect(() => {
    if (coordinates.length > 0 && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: coordinates[0].coordinates,
        zoomLevel: 12,
        animationDuration: 1000,
      });
    }
  }, [coordinates]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, width: '100%' }}>
        <MapboxMapView
          style={styles.map}
          styleURL={theme.isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
        >
          <Camera ref={cameraRef} />

          {coordinates.map((coordinate) => (
            <PointAnnotation
              key={`marker-${coordinate.id}`}
              id={`marker-${coordinate.id}`}
              coordinate={coordinate.coordinates}
              onSelected={() => handleMarkerPress(coordinate.id)}
              draggable={false}
              onDragStart={() => {}}
              onDragEnd={() => {}}
            >
              <View style={{ alignItems: 'center' }}>
                <Icon
                  name={iconNames.incident}
                  size={32}
                  color={theme.colors.semantic.error}
                />
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
