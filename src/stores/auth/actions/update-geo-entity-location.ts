import { bftApi, handleApiError } from '@/api';
import { API_CODE } from '@/api/api-client';
import { showError, showSuccess } from '@/components/ui';
import { type GeoEntity } from '@/types/geo-entity';

const updateGeoEntityLocation =
  (set: any, get: any) => async (lat: number, lon: number) => {
    try {
      const geoEntity = get().geoEntity as GeoEntity | undefined;
      if (!geoEntity?.gisId) {
        throw new Error('No geoEntity or gisId in state');
      }
      const response = await bftApi.updatePosition(geoEntity.gisId, {
        latitude: lat,
        longitude: lon,
      });
      if (response.status === API_CODE.OK) {
        showSuccess('Updated geo entity location');
      } else {
        showError('Update geo entity failed!');
      }
    } catch (error) {
      throw handleApiError(error);
    }
  };

export default updateGeoEntityLocation;
