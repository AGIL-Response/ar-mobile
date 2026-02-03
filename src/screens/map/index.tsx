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
  useState,
} from 'react';
import { StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { AppBar, Avatar, Background, Center, Icon, Text, View, iconNames, CenteredModal, Select } from '@/components';
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
import { getMapboxStyleURL } from './components/map-style-selector';
import { CurrentUserMarker } from './components/current-user-marker';
import { getItem, setItem } from '@/lib/storage';

Mapbox.setAccessToken(Constants.expoConfig?.extra?.env?.MAPBOX_DOWNLOADS_TOKEN);

const MAP_SETTINGS_STORAGE_KEY = 'map-settings';

const MAP_STYLES: { value: string; label: string }[] = [
  { value: 'streets', label: 'Streets' },
  { value: 'outdoors', label: 'Outdoors' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'satellite', label: 'Satellite' },
  { value: 'satellite-streets', label: 'Sat Streets' },
];

interface MapSettings {
  showIncidentMarkers: boolean;
}

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
  const setMapStyle = useMapStore((state) => state.actions.setMapStyle);
  const setMapFocusIncident = useMapStore((state) => state.actions.setMapFocusIncident);
  const setMapFocusUserId = useMapStore((state) => state.actions.setMapFocusUserId);
  const setFlatViewFocusUserId = useMapStore((state) => state.actions.setFlatViewFocusUserId);
  const fetchIncidents = useIncidentsStore((state) => state.actions.fetchIncidents);
  const isMapReady = useMapStore((state) => state.isMapReady);
  const setIsMapReady = useMapStore((state) => state.actions.setIsMapReady);
  const cameraRef = useRef<Camera>(null);
  const currentUser = useAuthStore((state) => state.user);
  const locationCoordinates = useLocationStore((state) => state.coordinates);
  // Track last zoomed coordinate to prevent duplicate zooms
  const lastZoomedCoordinateRef = useRef<[number, number] | null>(null);
  const hasInitialZoomedRef = useRef(false);
  
  // Settings modal state
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  
  // Load map settings from storage
  const [mapSettings, setMapSettings] = useState<MapSettings>(() => {
    const savedSettings = getItem<MapSettings>(MAP_SETTINGS_STORAGE_KEY);
    return savedSettings || { showIncidentMarkers: true };
  });
  
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
          lastZoomedCoordinateRef.current = userCoordinates;
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
      lastZoomedCoordinateRef.current = coordinates;
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

      // Helper function to check if coordinates are the same (within small tolerance)
      const areCoordinatesEqual = (
        coord1: [number, number],
        coord2: [number, number]
      ): boolean => {
        const tolerance = 0.0001; // ~11 meters
        return (
          Math.abs(coord1[0] - coord2[0]) < tolerance &&
          Math.abs(coord1[1] - coord2[1]) < tolerance
        );
      };

      // Helper function to perform zoom
      const performZoom = (targetCoordinate: [number, number]) => {
        // Check if we're zooming to the same coordinate
        if (
          lastZoomedCoordinateRef.current &&
          areCoordinatesEqual(
            lastZoomedCoordinateRef.current,
            targetCoordinate
          )
        ) {
          return;
        }

        lastZoomedCoordinateRef.current = targetCoordinate;
        cameraRef.current?.setCamera({
          centerCoordinate: targetCoordinate,
          zoomLevel: 20,
          animationDuration: 500,
        });
      };

      // Priority 1: Focus on specific incident
      if (mapFocusIncidentId) {
        const target = coordinates.find(
          (coordinate) => coordinate.id === mapFocusIncidentId
        );

        if (target && cameraRef.current) {
          performZoom(target.coordinates);
        }
        return;
      }

      // Priority 2: Focus on specific user
      if (mapFocusUserId) {
        const target = usersCoordinates.find(
          (coordinate) => coordinate.id === mapFocusUserId
        );

        if (target && cameraRef.current) {
          performZoom(target.coordinates);
        }
        return;
      }

      // Priority 3: Default zoom (only on initial load)
      const hasData = coordinates.length > 0 || usersCoordinates.length > 0;
      if (hasData && !hasInitialZoomedRef.current) {
        const defaultCoordinate =
          coordinates[0]?.coordinates || usersCoordinates[0]?.coordinates;
        if (defaultCoordinate && cameraRef.current) {
          performZoom(defaultCoordinate);
          hasInitialZoomedRef.current = true;
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

  // Save settings to storage when changed
  const handleToggleIncidentMarkers = useCallback((checked: boolean) => {
    const newSettings = { ...mapSettings, showIncidentMarkers: checked };
    setMapSettings(newSettings);
    setItem(MAP_SETTINGS_STORAGE_KEY, newSettings);
  }, [mapSettings]);


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
          <CurrentUserMarker size="small" />

          {mapSettings.showIncidentMarkers && coordinates.map((coordinate) => (
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
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setIsSettingsModalVisible(true)}
          activeOpacity={0.7}
        >
          <Icon
            name={iconNames.settings}
            size={24}
            color={theme.colors.text.icon}
          />
        </TouchableOpacity>
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
      
      <CenteredModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        title="Map Settings"
      >
        <View style={styles.settingsContent}>
          <View style={styles.settingRow}>
            <Text variant="body" style={styles.settingLabel}>
              Show Incident Markers
            </Text>
            <Switch
              value={mapSettings.showIncidentMarkers}
              onValueChange={handleToggleIncidentMarkers}
              trackColor={{
                false: theme.colors.semantic.black,
                true: theme.colors.background.qua,
              }}
              thumbColor={theme.colors.text.primary}
            />
          </View>
          <View style={styles.mapStyleContainer}>
            <Select
              label="Map Style"
              options={MAP_STYLES}
              value={mapStyle}
              onValueChange={(value) => setMapStyle(value as typeof mapStyle)}
              placeholder="Select map style"
              color={theme.colors.text.primary}
            />
          </View>
        </View>
      </CenteredModal>
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
    settingsButton: {
      position: 'absolute',
      bottom: 80 + bottomInset, // Above location button (48px height + 12px gap)
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
    settingsContent: {
      width: '100%',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    settingLabel: {
      flex: 1,
      color: theme.colors.text.primary,
    },
    mapStyleContainer: {
      marginTop: 16,
    },
  });
};

export default MapScreen;