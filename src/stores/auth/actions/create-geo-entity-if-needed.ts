import * as Location from 'expo-location';

import { bftApi, handleApiError } from '@/api';

const createGeoEntityIfNeeded = (set: any, get: any) => async () => {
  try {
    const user = get().user;
    const userId = user?.userId;
    const username = user?.username;
    if (!userId || !username) return;

    // Query geo entities for this userId
    const { data: entities } = await bftApi.queryGeoEntities({
      entity_id: userId,
    });
    if (Array.isArray(entities) && entities.length === 0) {
      // Get current device location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission denied');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      // Create geo entity
      const { data: createRes } = await bftApi.createGeoEntity({
        entity_id: userId,
        kind: 'aircraft',
        latitude: lat,
        longitude: lon,
        callsign: username,
        trackable: true,
      });
      if (createRes && createRes.geoResult) {
        get().actions.setGeoEntity(createRes.geoResult);
      }
    } else if (Array.isArray(entities) && entities.length > 0) {
      get().actions.setGeoEntity(entities[0]);
    }
    // else: already exists, do nothing
  } catch (error) {
    throw handleApiError(error);
  }
};

export default createGeoEntityIfNeeded;
