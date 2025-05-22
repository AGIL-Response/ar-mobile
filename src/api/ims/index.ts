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
          const lat = (value as any)?.[0] || 0;
          const lon = (value as any)?.[1] || 0;
          // formData.append(key, JSON.stringify(value));
          // todo: vô cùng bực mình với cả location này
          //  đã ngược [lon, lat] lại còn phải kẹp trong ""
          // "location": "[\"103.826738\",\"1.282355\"]",
          formData.append(key, `[\"${lon}\",\"${lat}\"]`);
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
