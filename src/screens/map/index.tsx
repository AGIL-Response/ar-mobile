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
  import { getCoordinate } from '@/screens/incidents/utils';
  import { useIncidentsStore } from '@/stores/incidents';
  import { useUsersStore } from '@/stores/users';
  import { useMapStore } from '@/stores/map';
  import { type Theme, useTheme } from '@/theme';
  import { Pressable } from 'react-native-gesture-handler';
  import type { IncidentCoordinate, UserCoordinate } from '@/screens/map/types';
import { useAuthStore } from '@/stores/auth';
import { X } from '@/components/icons';
  
  Mapbox.setAccessToken(
    'sk.eyJ1IjoibGFpem4iLCJhIjoiY21lamxqZzh4MDQ0bjJrcXZ0dWRiZHAzNyJ9.NU6sHZrIkDuDpHCEManSJQ'
  );
  
  function MapView() {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const incidents = useIncidentsStore((state) => state.incidents);
    const users = useUsersStore((state) => state.users);
    const incidentsLoading = useIncidentsStore((state) => state.isLoading);
    const usersLoading = useUsersStore((state) => state.isLoading);
    const isLoading = incidentsLoading || usersLoading;
    const mapFocusIncidentId = useMapStore((state) => state.mapFocusIncidentId);
    const mapFocusUserId = useMapStore((state) => state.mapFocusUserId);
    const setMapFocusIncident = useMapStore((state) => state.actions.setMapFocusIncident);
    const setMapFocusUserId = useMapStore((state) => state.actions.setMapFocusUserId);
    const setFlatViewFocusUserId = useMapStore((state) => state.actions.setFlatViewFocusUserId);
    const fetchIncidents = useIncidentsStore((state) => state.actions.fetchIncidents);
    const isMapReady = useMapStore((state) => state.isMapReady);
    const setIsMapReady = useMapStore((state) => state.actions.setIsMapReady);
    const cameraRef = useRef<Camera>(null);
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
  
    useEffect(() => {
      fetchIncidents({});
    }, []);
  
    const handleMarkerPress = useCallback((incidentId: string) => {
      router.navigate(`/incidents/${incidentId}` as RelativePathString);
    }, []);
  
    const handleUserMarkerPress = useCallback((userId: string) => {
      router.replace('/' as RelativePathString);
      setFlatViewFocusUserId(userId);
    }, [setFlatViewFocusUserId]);
  
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
            styleURL={theme.isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
            onDidFinishLoadingMap={() => {
              setIsMapReady(true);
            }}
          >
            <Camera ref={cameraRef} zoomLevel={0}/>
  
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
                    <View style={styles.incidentOuterRing}/>
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
              <X width={20} height={20} color={theme.colors.text.icon} /> 
            </TouchableOpacity>
          }
        />
        <MapView />
      </Background>
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
  
  export default MapScreen;