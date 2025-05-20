import { create } from 'zustand';

import { imsApi } from '@/api/ims';
import type { CreateIncidentRequest, IncidentResponse } from '@/api/ims/types';

type IncidentStore = {
  isLoading: boolean;
  error: string | null;
  createIncident: (data: CreateIncidentRequest) => Promise<IncidentResponse>;
};

export const useIncidentStore = create<IncidentStore>((set) => ({
  isLoading: false,
  error: null,
  createIncident: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await imsApi.createIncident(data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to create incident',
      });
      throw error;
    }
  },
}));
