import { bftApi, handleApiError } from '@/api';
import { API_CODE } from '@/api/api-client';
import { showError, showSuccess } from "@/components/ui";

const updateGeoEntityLocation =
  (set: any, get: any) => async (lat: number, lon: number) => {
    try {
      const geoEntity = get().geoEntity;
      if (!geoEntity || !geoEntity.gis_id)
        throw new Error('No geoEntity or gis_id in state');
      const response = await bftApi.updatePosition(geoEntity.gis_id, {
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
