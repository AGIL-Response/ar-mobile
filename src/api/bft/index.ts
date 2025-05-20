import { apiClient } from '../api-client';
import type { GeoEntity, GeoSearchParams, Position } from './types';

export const bftApi = {
  /**
   * Create a new geo entity
   */
  createGeoEntity: (data: GeoEntity) => {
    return apiClient.post<GeoEntity>('/bft/geo', data);
  },

  /**
   * Update position of a geo entity
   */
  updatePosition: (gisId: string, position: Position) => {
    return apiClient.put<Position>(`/bft/position/${gisId}`, position);
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
