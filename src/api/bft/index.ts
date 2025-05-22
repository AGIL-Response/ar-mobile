// eslint-disable-next-line import/no-cycle
import { apiClient, bftClient } from '../api-client';
import type {
  GeoEntity,
  GeoEntityApiResponse,
  GeoSearchParams,
  Position,
} from './types';

export const bftApi = {
  /**
   * Create a new geo entity
   */
  createGeoEntity: (data: GeoEntity) => {
    return apiClient.post<GeoEntityApiResponse>('/bft/geo', data);
  },

  /**
   * Update position of a geo entity
   */
  updatePosition: (gisId: string, position: Position) => {
    return bftClient.put<Position>(`/v1/bft/updatePos/${gisId}`, position);
  },

  /**
   * Query geo entities by search parameters
   */
  queryGeoEntities: (params: GeoSearchParams) => {
    return apiClient.get<GeoEntity[]>('/bft/geo', { params });
  },

  /**
   * Get latest position of a geo entity
   */
  getLatestPosition: (id: string) => {
    return apiClient.get<Position>(`/bft/position/${id}`);
  },
};
