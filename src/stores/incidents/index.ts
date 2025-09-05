import { incidentsApi } from '@/api/incidents';
import type { Incident, IncidentsQueryParams } from '@/api/incidents/types';
import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';

export interface IncidentsState extends IBaseState {
  // State properties
  incidents: Incident[];
  selectedIncident: Incident | null;
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    status?: string;
    type?: string;
    severity?: string;
  };

  // Actions namespace
  actions: {
    fetchIncidents: (tenantId: string, params?: IncidentsQueryParams) => Promise<void>;
    fetchIncident: (tenantId: string, incidentId: string) => Promise<void>;
    createIncident: (tenantId: string, data: any) => Promise<Incident>;
    updateIncident: (tenantId: string, data: any) => Promise<Incident>;
    deleteIncident: (tenantId: string, incidentId: string) => Promise<void>;
    setSelectedIncident: (incident: Incident | null) => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: Partial<IncidentsState['filters']>) => void;
    clearError: () => void;
    reset: () => void;
  };
}

const initialState: InitStateType<IncidentsState> = {
  incidents: [],
  selectedIncident: null,
  isLoading: false,
  isLoadingDetails: false,
  error: null,
  searchQuery: '',
  filters: {},
};

const incidentsStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    fetchIncidents: async (tenantId: string, params?: IncidentsQueryParams) => {
      set((state: IncidentsState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const incidents = await incidentsApi.getIncidents(tenantId, params);
        
        set((state: IncidentsState) => {
          state.incidents = incidents;
          state.isLoading = false;
        });
      } catch (error) {
        set((state: IncidentsState) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch incidents';
          state.isLoading = false;
        });
      }
    },

    fetchIncident: async (tenantId: string, incidentId: string) => {
      set((state: IncidentsState) => {
        state.isLoadingDetails = true;
        state.error = null;
      });

      try {
        const incident = await incidentsApi.getIncident(tenantId, incidentId);
        
        set((state: IncidentsState) => {
          state.selectedIncident = incident;
          state.isLoadingDetails = false;
          
          // Update in incidents list if it exists
          const index = state.incidents.findIndex(i => i.id === incidentId);
          if (index !== -1) {
            state.incidents[index] = incident;
          }
        });
      } catch (error) {
        set((state: IncidentsState) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch incident details';
          state.isLoadingDetails = false;
        });
      }
    },

    createIncident: async (tenantId: string, data: any) => {
      set((state: IncidentsState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const newIncident = await incidentsApi.createIncident(tenantId, data);
        
        set((state: IncidentsState) => {
          state.incidents = [newIncident, ...state.incidents];
          state.isLoading = false;
        });

        return newIncident;
      } catch (error) {
        set((state: IncidentsState) => {
          state.error = error instanceof Error ? error.message : 'Failed to create incident';
          state.isLoading = false;
        });
        throw error;
      }
    },

    updateIncident: async (tenantId: string, data: any) => {
      set((state: IncidentsState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const updatedIncident = await incidentsApi.updateIncident(tenantId, data);
        
        set((state: IncidentsState) => {
          const index = state.incidents.findIndex(i => i.id === data.id);
          if (index !== -1) {
            state.incidents[index] = updatedIncident;
          }
          
          if (state.selectedIncident?.id === data.id) {
            state.selectedIncident = updatedIncident;
          }
          
          state.isLoading = false;
        });

        return updatedIncident;
      } catch (error) {
        set((state: IncidentsState) => {
          state.error = error instanceof Error ? error.message : 'Failed to update incident';
          state.isLoading = false;
        });
        throw error;
      }
    },

    deleteIncident: async (tenantId: string, incidentId: string) => {
      set((state: IncidentsState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await incidentsApi.deleteIncident(tenantId, incidentId);
        
        set((state: IncidentsState) => {
          state.incidents = state.incidents.filter(i => i.id !== incidentId);
          
          if (state.selectedIncident?.id === incidentId) {
            state.selectedIncident = null;
          }
          
          state.isLoading = false;
        });
      } catch (error) {
        set((state: IncidentsState) => {
          state.error = error instanceof Error ? error.message : 'Failed to delete incident';
          state.isLoading = false;
        });
        throw error;
      }
    },

    setSelectedIncident: (incident: Incident | null) => {
      set((state: IncidentsState) => {
        state.selectedIncident = incident;
      });
    },

    setSearchQuery: (query: string) => {
      set((state: IncidentsState) => {
        state.searchQuery = query;
      });
    },

    setFilters: (filters: Partial<IncidentsState['filters']>) => {
      set((state: IncidentsState) => {
        state.filters = { ...state.filters, ...filters };
      });
    },

    clearError: () => {
      set((state: IncidentsState) => {
        state.error = null;
      });
    },

    reset: () => resetStore(initialState, set),
  },
  reset: () => resetStore(initialState, set),
});

export const useIncidentsStore = createStore<IncidentsState>(incidentsStore);
