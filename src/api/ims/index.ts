import { apiClient, handleApiError } from '../api-client';
import type { CreateIncidentRequest, IncidentResponse } from './types';

export const imsApi = {
  /**
   * Create a new incident
   */
  createIncident: async (
    data: CreateIncidentRequest
  ): Promise<IncidentResponse> => {
    try {
      // Convert the data to FormData
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'location') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post<IncidentResponse>(
        '/ims',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
