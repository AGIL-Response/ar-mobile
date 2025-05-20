import { imsApi } from '@/api/ims';
import type { CreateIncidentRequest } from '@/api/ims/types';
import type IBaseState from '@/stores/interfaces/IBaseState';
import { type InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';

export interface IncidentState extends IBaseState {
  isLoading: boolean;
  error: string | null;
  actions: {
    createIncident: (data: CreateIncidentRequest) => Promise<any>;
  };
}

const initialState: InitStateType<IncidentState> = {
  isLoading: false,
  error: null,
};

const createIncident = (set: any) => async (data: CreateIncidentRequest) => {
  try {
    set((state: IncidentState) => ({
      ...state,
      isLoading: true,
      error: null,
    }));

    const response = await imsApi.createIncident(data);

    set((state: IncidentState) => ({
      ...state,
      isLoading: false,
    }));

    return response;
  } catch (error) {
    set((state: IncidentState) => ({
      ...state,
      isLoading: false,
      error:
        error instanceof Error ? error.message : 'Failed to create incident',
    }));
    throw error;
  }
};

const incidentStore = (set: any) => ({
  ...initialState,
  actions: {
    createIncident: createIncident(set),
  },
  reset: () => resetStore(initialState, set),
});

export const useIncidentStore = createStore<IncidentState>(incidentStore);
