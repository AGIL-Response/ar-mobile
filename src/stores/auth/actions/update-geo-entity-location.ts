import { bftApi, handleApiError } from '@/api';

const updateGeoEntityLocation =
  (set: any, get: any) => async (lat: number, lon: number) => {
    try {
      const geoEntity = get().geoEntity;
      if (!geoEntity || !geoEntity.gis_id)
        throw new Error('No geoEntity or gis_id in state');
      await bftApi.updatePosition(geoEntity.gis_id, {
        latitude: lat,
        longitude: lon,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  };

export default updateGeoEntityLocation;
