import { apiClient, handleApiError } from '../api-client';
import type {
  CreateIncidentRequest,
  Incident,
  IncidentResponse,
  IncidentsQueryParams,
  IncidentsResponse,
  UpdateIncidentRequest,
} from './types';

export const incidentsApi = {
  /**
   * Get all incidents with default parameters
   */
  getIncidents: async (
    params: IncidentsQueryParams = {}
  ): Promise<Incident[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      // Set default parameters
      const defaultParams = {
        offset: 0,
        limit: 100,
        sort: '{}',
        count: false,
        ...params
      };
      
      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const queryString = queryParams.toString();
      const url = `/incidents${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<IncidentsResponse>(url);
      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a specific incident by ID
   */
  getIncident: async (incidentId: string): Promise<Incident> => {
    try {
      const response = await apiClient.get<IncidentResponse>(
        `/incidents/${incidentId}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new incident
   */
  createIncident: async (data: CreateIncidentRequest): Promise<Incident> => {
    try {
      const response = await apiClient.post<IncidentResponse>(
        `/incidents`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update an existing incident
   */
  updateIncident: async (data: UpdateIncidentRequest): Promise<Incident> => {
    try {
      const { id, ...updateData } = data;
      const response = await apiClient.put<IncidentResponse>(
        `/incidents/${id}`,
        updateData
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete an incident
   */
  deleteIncident: async (incidentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/incidents/${incidentId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
