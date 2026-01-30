/**
 * Map View Component
 * Contains map interface for the map view tab
 */

import Mapbox, {
  Camera,
  MapView as MapboxMapView,
  MarkerView,
} from '@rnmapbox/maps';
import { router, useRouter, type RelativePathString } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { AppBar, Avatar, Background, Center, Icon, Text, View, iconNames } from '@/components';
import { useSafeAreaInsets } from '@/lib/hooks';
import { getCoordinate } from '@/screens/incidents/utils';
import { useIncidentsStore } from '@/stores/incidents';
import { useUsersStore } from '@/stores/users';
import { useMapStore } from '@/stores/map';
import { type Theme, useTheme } from '@/theme';
import { Pressable } from 'react-native-gesture-handler';
import type { IncidentCoordinate, UserCoordinate } from '@/screens/map/types';
import { useAuthStore } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';
import Constants from 'expo-constants';
import { MapStyleSelector, getMapboxStyleURL } from './components/map-style-selector';

Mapbox.setAccessToken(Constants.expoConfig?.extra?.env?.MAPBOX_DOWNLOADS_TOKEN);

function MapView() {
  const theme = useTheme();
  const { bottomInset } = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, bottomInset), [theme, bottomInset]);
  const incidents = useIncidentsStore((state) => state.incidents);
  const users = useUsersStore((state) => state.users);
  const incidentsLoading = useIncidentsStore((state) => state.isLoading);
  const usersLoading = useUsersStore((state) => state.isLoading);
  const isLoading = incidentsLoading || usersLoading;
  const mapFocusIncidentId = useMapStore((state) => state.mapFocusIncidentId);
  const mapFocusUserId = useMapStore((state) => state.mapFocusUserId);
  const mapStyle = useMapStore((state) => state.mapStyle);
  const setMapFocusIncident = useMapStore((state) => state.actions.setMapFocusIncident);
  const setMapFocusUserId = useMapStore((state) => state.actions.setMapFocusUserId);
  const setFlatViewFocusUserId = useMapStore((state) => state.actions.setFlatViewFocusUserId);
  const fetchIncidents = useIncidentsStore((state) => state.actions.fetchIncidents);
  const isMapReady = useMapStore((state) => state.isMapReady);
  const setIsMapReady = useMapStore((state) => state.actions.setIsMapReady);
  const cameraRef = useRef<Camera>(null);
  const currentUser = useAuthStore((state) => state.user);
  const locationCoordinates = useLocationStore((state) => state.coordinates);
  const coordinates = useMemo<IncidentCoordinate[]>(() => {
    return incidents
      ?.filter((incident) => incident.location?.coordinates) // only with coords
      .map((incident) => ({
        id: incident.id,
        coordinates: getCoordinate(incident.location!.coordinates) as [
          number,
          number,
        ],
      }))
      .filter((item) => Boolean(item.coordinates));
  }, [incidents]);

  const usersCoordinates = useMemo<UserCoordinate[]>(() => {
    return users
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
  }, [users]);

  // Device location marker for current user
  const deviceLocationCoordinates = useMemo<[number, number] | null>(() => {
    if (!locationCoordinates || !currentUser?.avatarId) {
      return null;
    }
    // Use device GPS location from location store
    return [
      locationCoordinates.longitude,
      locationCoordinates.latitude,
    ];
  }, [locationCoordinates, currentUser?.avatarId]);

  // Get current user's status from users store if available
  const currentUserStatus = useMemo(() => {
    if (!currentUser?.id) {
      return 'unknown';
    }
    const userInStore = users.find((user) => user.id === currentUser.id);
    return userInStore?.status || 'unknown';
  }, [currentUser?.id, users]);

  useEffect(() => {
    fetchIncidents({});
  }, [fetchIncidents]);

  const handleMarkerPress = useCallback((incidentId: string) => {
    router.navigate(`/incidents/${incidentId}` as RelativePathString);
  }, []);

  const handleUserMarkerPress = useCallback((userId: string) => {
    router.replace('/' as RelativePathString);
    setFlatViewFocusUserId(userId);
  }, [setFlatViewFocusUserId]);

  const handleNavigateToCurrentLocation = useCallback(() => {
    if (!cameraRef.current || !isMapReady) {
      return;
    }

    // First, try to get current user's location from users store
    if (currentUser?.id) {
      const currentUserData = users.find((user) => user.id === currentUser.id);
      if (currentUserData?.location?.coordinates) {
        const userCoordinates = getCoordinate(currentUserData.location.coordinates) as [
          number,
          number,
        ];
        if (userCoordinates) {
          cameraRef.current.setCamera({
            centerCoordinate: userCoordinates,
            zoomLevel: 20,
            animationDuration: 500,
          });
          return;
        }
      }
    }

    // Fallback to location store coordinates
    if (locationCoordinates) {
      const coordinates: [number, number] = [
        locationCoordinates.longitude,
        locationCoordinates.latitude,
      ];
      cameraRef.current.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: 20,
        animationDuration: 500,
      });
    }
  }, [currentUser, users, locationCoordinates, isMapReady]);

  useEffect(() => {
    if (!isMapReady) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!cameraRef.current) {
        return;
      }
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
            zoomLevel: 20,
            animationDuration: 500,
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
            zoomLevel: 20,
            animationDuration: 500,
          });
        }
        return;
      }

      const hasData = coordinates.length > 0 || usersCoordinates.length > 0;
      if (hasData) {
        const defaultCoordinate =
          coordinates[0]?.coordinates || usersCoordinates[0]?.coordinates;
        if (defaultCoordinate && cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: defaultCoordinate,
            zoomLevel: 20,
            animationDuration: 500,
          });
        }
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [
    isMapReady,
    coordinates,
    usersCoordinates,
    mapFocusIncidentId,
    mapFocusUserId,
  ]);

  useEffect(() => {
    return () => {
      setMapFocusIncident(null);
      setMapFocusUserId(null);
    };
  }, [setMapFocusIncident, setMapFocusUserId]);


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
          styleURL={getMapboxStyleURL(mapStyle)}
          onDidFinishLoadingMap={() => {
            setIsMapReady(true);
          }}
        >
          <Camera ref={cameraRef} zoomLevel={0} />

          {/* Current user's device location marker */}
          {deviceLocationCoordinates && currentUser?.avatarId && (
            <MarkerView
              key="current-user-device-location-marker"
              coordinate={deviceLocationCoordinates}
              allowOverlapWithPuck={false}
              allowOverlap
            >
              <Avatar
                fileId={currentUser.avatarId}
                status={currentUserStatus}
                size="small"
                isMapAvatar={true}
              />
            </MarkerView>
          )}

          {coordinates.map((coordinate) => (
            <MarkerView
              key={`incident-marker-${coordinate.id}`}
              coordinate={coordinate.coordinates}
              allowOverlapWithPuck={false}
              allowOverlap
            >
              <Pressable
                onPress={() => handleMarkerPress(coordinate.id)}
              >
                <View style={styles.incidentMarker}>
                  <View style={styles.incidentOuterRing} />
                  <View style={styles.incidentInnerCircle}>
                    <Icon
                      name={iconNames.incident}
                      size={20}
                      color={theme.colors.semantic.white}
                    />
                  </View>
                </View>
              </Pressable>
            </MarkerView>
          ))}

          {usersCoordinates.map((coordinate) => (
            <MarkerView
              key={`user-marker-${coordinate.id}`}
              coordinate={coordinate.coordinates}
              allowOverlapWithPuck={false}
              allowOverlap
            >
              <Pressable
                onPress={() => handleUserMarkerPress(coordinate.id)}
              >
                <Avatar
                  fileId={coordinate.avatarId}
                  status={coordinate.status}
                  size="small"
                  isMapAvatar={true}
                />
              </Pressable>
            </MarkerView>
          ))}
        </MapboxMapView>
        <MapStyleSelector />
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleNavigateToCurrentLocation}
          activeOpacity={0.7}
        >
          <Icon
            name={iconNames.location}
            size={24}
            color={theme.colors.text.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const selectedTeamName = useAuthStore((state) => state.selectedTeam?.name || '');
  const resetToHome = () => {
    router.dismissTo('/(app)/' as RelativePathString);
  };
  return (
    <Background flex={1}>
      <AppBar
        title={selectedTeamName}
        titleAlign="left"
        onBackPress={resetToHome}
        rightContent={
          <TouchableOpacity onPress={resetToHome}>
            <Icon name={iconNames.x} size={20} color={theme.colors.text.icon} />
          </TouchableOpacity>
        }
      />
      <MapView />
    </Background>
  );
}

const createStyles = (theme: Theme, bottomInset: number) => {
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
    currentLocationButton: {
      position: 'absolute',
      bottom: 20 + bottomInset,
      right: 20,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.colors.surface.border,
    },
  });
};

export default MapScreen;