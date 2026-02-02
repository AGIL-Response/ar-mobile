/**
 * Map Style Selector Component
 * Icon button that cycles through map styles
 */

import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Text } from '@/components';
import { useMapStore, type MapStyle } from '@/stores/map';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from '@/lib/hooks';

const MAP_STYLES: MapStyle[] = [
  'streets',
  'outdoors',
  'light',
  'dark',
  'satellite',
  'satellite-streets',
];

const getMapboxStyleURL = (style: MapStyle): string => {
  const StyleURL = Mapbox.StyleURL as any;
  
  switch (style) {
    case 'streets':
      return StyleURL.Street || StyleURL.Streets || 'mapbox://styles/mapbox/streets-v12';
    case 'outdoors':
      return StyleURL.Outdoors || 'mapbox://styles/mapbox/outdoors-v12';
    case 'light':
      return Mapbox.StyleURL.Light || 'mapbox://styles/mapbox/light-v11';
    case 'dark':
      return Mapbox.StyleURL.Dark || 'mapbox://styles/mapbox/dark-v11';
    case 'satellite':
      return StyleURL.Satellite || 'mapbox://styles/mapbox/satellite-v9';
    case 'satellite-streets':
      return StyleURL.SatelliteStreet || 'mapbox://styles/mapbox/satellite-streets-v12';
    default:
      return StyleURL.Street || StyleURL.Streets || Mapbox.StyleURL.Light || 'mapbox://styles/mapbox/streets-v12';
  }
};

const getMapStyleLabel = (style: MapStyle): string => {
  switch (style) {
    case 'streets':
      return 'Streets';
    case 'outdoors':
      return 'Outdoors';
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'satellite':
      return 'Satellite';
    case 'satellite-streets':
      return 'Sat Streets';
    default:
      return 'Streets';
  }
};

export function MapStyleSelector() {
  const theme = useTheme();
  const { bottomInset } = useSafeAreaInsets();
  const mapStyle = useMapStore((state) => state.mapStyle);
  const setMapStyle = useMapStore((state) => state.actions.setMapStyle);
  const styles = useMemo(() => createStyles(theme, bottomInset), [theme, bottomInset]);

  const cycleToNextStyle = useCallback(() => {
    const currentIndex = MAP_STYLES.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % MAP_STYLES.length;
    setMapStyle(MAP_STYLES[nextIndex]);
  }, [mapStyle, setMapStyle]);

  const styleLabel = useMemo(() => getMapStyleLabel(mapStyle), [mapStyle]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={cycleToNextStyle}
      activeOpacity={0.7}
    >
      <Text
        variant="caption"
        style={styles.buttonText}
      >
        {styleLabel}
      </Text>
    </TouchableOpacity>
  );
}

export { getMapboxStyleURL };

const createStyles = (theme: any, bottomInset: number) => {
  return StyleSheet.create({
    button: {
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
    buttonText: {
      color: theme.colors.text.primary,
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
};
