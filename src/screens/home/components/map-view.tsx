/**
 * Map View Component
 * Contains map interface for the map view tab
 */

import Mapbox, {
  Camera,
  MapView as MapboxMapView,
  MarkerView,
} from '@rnmapbox/maps';
import { router, type RelativePathString } from 'expo-router';
import React, {
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Center, Icon, Text, View, iconNames } from '@/components';
import { getCoordinate } from '@/screens/incidents/utils';
import { useIncidentsStore } from '@/stores/incidents';
import { useUsersStore } from '@/stores/users';
import { type Theme, useTheme } from '@/theme';

import type { IncidentCoordinate, UserCoordinate } from '../types';

Mapbox.setAccessToken(
  'sk.eyJ1IjoibGFpem4iLCJhIjoiY21lamxqZzh4MDQ0bjJrcXZ0dWRiZHAzNyJ9.NU6sHZrIkDuDpHCEManSJQ'
);

export function MapView() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const incidentsState = useIncidentsStore();
  const usersState = useUsersStore();

  const { fetchIncidents, setMapFocusIncident } = incidentsState.actions;
  const mapFocusIncidentId = incidentsState.mapFocusIncidentId;

  const { setMapFocusUserId, setFlatViewFocusUserId } = usersState.actions;
  const mapFocusUserId = usersState.mapFocusUserId;

  const cameraRef = useRef<Camera>(null);
  const hasCenteredDefaultRef = useRef(false);

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

  const usersCoordinates = useMemo<UserCoordinate[]>(() => {
    return usersState.users
      ?.filter((user) => user.location?.coordinates && user.avatarId) // only with coords and avatarId
      .map((user) => ({
        id: user.id,
        avatarId: user.avatarId!,
        status: user.status || 'unknown',
        coordinates: getCoordinate(user.location!.coordinates) as [
          number,
          number,
        ],
      }))
      .filter((item) => Boolean(item.coordinates));
  }, [usersState.users]);

  useEffect(() => {
    fetchIncidents({});
  }, [fetchIncidents]);

  const handleMarkerPress = (incidentId: string) => {
    router.navigate(`/incidents/${incidentId}` as any);
  };

  const handleUserMarkerPress = (userId: string) => {
    setFlatViewFocusUserId(userId);
    router.navigate('/' as RelativePathString);
  };

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }

    if (mapFocusIncidentId) {
      const target = coordinates.find(
        (coordinate) => coordinate.id === mapFocusIncidentId
      );

      if (target && cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: target.coordinates,
          zoomLevel: 15,
          animationDuration: 1000,
        });

        hasCenteredDefaultRef.current = true;
        requestAnimationFrame(() => {
          setMapFocusIncident(null);
        });
      }
      return;
    }

    if (mapFocusUserId) {
      const target = usersCoordinates.find(
        (coordinate) => coordinate.id === mapFocusUserId
      );

      if (target && cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: target.coordinates,
          zoomLevel: 15,
          animationDuration: 1000,
        });
        hasCenteredDefaultRef.current = true;
        requestAnimationFrame(() => {
          setMapFocusUserId(null);
        });
      }
      return;
    }

    if (
      !hasCenteredDefaultRef.current &&
      (coordinates.length > 0 || usersCoordinates.length > 0)
    ) {
      const defaultCoordinate =
        coordinates[0]?.coordinates || usersCoordinates[0]?.coordinates;
      if (defaultCoordinate && cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: defaultCoordinate,
          zoomLevel: 15,
          animationDuration: 1000,
        });
        hasCenteredDefaultRef.current = true;
      }
    }
  }, [
    coordinates,
    usersCoordinates,
    mapFocusIncidentId,
    mapFocusUserId,
    setMapFocusIncident,
    setMapFocusUserId,
  ]);

  const isLoading =
    incidentsState.isLoading ||
    usersState.isLoading ||
    (!coordinates.length && !usersCoordinates.length);

  if (isLoading) {
    return (
      <Center style={{ flex: 1 }}>
        <Text
          variant="body"
          style={{
            color: theme.colors.text.secondary,
          }}
        >
          Loading map...
        </Text>
      </Center>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, width: '100%' }}>
        <MapboxMapView
          style={styles.map}
          styleURL={theme.isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
        >
          <Camera ref={cameraRef} />

          {coordinates.map((coordinate) => (
            <MarkerView
              key={`incident-marker-${coordinate.id}`}
              coordinate={coordinate.coordinates}
              allowOverlapWithPuck={false}
            >
              <TouchableOpacity
                onPress={() => handleMarkerPress(coordinate.id)}
                activeOpacity={0.8}
              >
                <View style={styles.incidentMarker} collapsable={false}>
                  <View style={styles.incidentOuterRing} />
                  <View style={styles.incidentInnerCircle}>
                    <Icon
                      name={iconNames.incident}
                      size={20}
                      color={theme.colors.semantic.white}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </MarkerView>
          ))}

          {usersCoordinates.map((coordinate) => (
            <MarkerView
              key={`user-marker-${coordinate.id}`}
              coordinate={coordinate.coordinates}
              allowOverlapWithPuck={false}
            >
              <TouchableOpacity
                onPress={() => handleUserMarkerPress(coordinate.id)}
              >
                <Avatar
                  fileId={coordinate.avatarId}
                  status={coordinate.status}
                  size="small"
                  isMapAvatar={true}
                />
              </TouchableOpacity>
            </MarkerView>
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
    incidentMarker: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      borderWidth: 2,
      borderColor: theme.colors.status.errorAlt,
      borderRadius: 32,
    },
    incidentOuterRing: {
      position: 'absolute',
      width: 64,
      height: 64,
      borderRadius: 32,
      borderColor: theme.colors.semantic.error,
      backgroundColor: theme.colors.semantic.error,
      opacity: 0.35,
    },
    incidentInnerCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.semantic.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
