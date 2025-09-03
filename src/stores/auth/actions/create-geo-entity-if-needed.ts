import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';

// eslint-disable-next-line import/no-cycle
import { bftApi, handleApiError } from '@/api';
import {
  type GeoEntityResponse,
  transformGeoEntityResponse,
} from '@/types/geo-entity';

type LocationCoords = {
  latitude: number;
  longitude: number;
};

type CreateGeoEntityParams = {
  entity_id: string;
  kind: 'aircraft';
  latitude: number;
  longitude: number;
  callsign: string;
  trackable: boolean;
};

async function getCurrentLocation(): Promise<LocationCoords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  if (!location?.coords?.latitude || !location?.coords?.longitude) {
    throw new Error('Invalid location data received');
  }

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

async function checkNetworkConnection(): Promise<void> {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    throw new Error('No internet connection available');
  }
}

const createGeoEntityIfNeeded = (set: any, get: any) => async () => {
  try {
    const user = get().user;
    const userId = user?.id;
    const username = user?.username;

    if (!userId || !username) {
      throw new Error('User information is incomplete');
    }

    await checkNetworkConnection();

    // Query geo entities for this userId
    const { data: entities } = await bftApi.queryGeoEntities({
      entity_id: userId,
    });

    if (!Array.isArray(entities)) {
      throw new Error('Invalid response format from geo entities query');
    }

    if (entities.length === 0) {
      const { latitude, longitude } = await getCurrentLocation();

      const geoEntityParams: CreateGeoEntityParams = {
        entity_id: userId,
        kind: 'aircraft',
        latitude,
        longitude,
        callsign: username,
        trackable: true,
      };

      const { data: createRes } = await bftApi.createGeoEntity(geoEntityParams);

      if (!createRes?.geoResult) {
        throw new Error('Failed to create geo entity');
      }

      // Transform the response to camelCase before setting in store
      const transformedEntity = transformGeoEntityResponse(
        createRes.geoResult as unknown as GeoEntityResponse
      );
      get().actions.setGeoEntity(transformedEntity);
    } else {
      const existingEntity = entities[0];
      if (!existingEntity) {
        throw new Error('Invalid geo entity data');
      }
      // Transform the response to camelCase before setting in store
      const transformedEntity = transformGeoEntityResponse(
        existingEntity as unknown as GeoEntityResponse
      );
      get().actions.setGeoEntity(transformedEntity);
    }
  } catch (error) {
    const handledError = handleApiError(error);
    // You might want to add error reporting here
    console.error('Geo entity creation failed:', handledError);
    throw handledError;
  }
};

export default createGeoEntityIfNeeded;
