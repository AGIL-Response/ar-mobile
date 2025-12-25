/**
 * Map Store
 * Zustand store for map view state (focus IDs, camera position, etc.)
 * Isolated from data stores to prevent unnecessary re-renders when data updates
 */

import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';

export interface MapState extends IBaseState {
  mapFocusIncidentId: string | null;
  mapFocusUserId: string | null;
  flatViewFocusUserId: string | null;
  isMapReady: boolean;
  error: string | null;

  actions: {
    setMapFocusIncident: (incidentId: string | null) => void;
    setMapFocusUserId: (userId: string | null) => void;
    setFlatViewFocusUserId: (userId: string | null) => void;
    clearAllFocus: () => void;
    setIsMapReady: (isMapReady: boolean) => void;
    reset: () => void;
  };
}

const initialState: InitStateType<MapState> = {
  isMapReady: false,
  mapFocusIncidentId: null,
  mapFocusUserId: null,
  flatViewFocusUserId: null,
  error: null,
};

const mapStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    setMapFocusIncident: (incidentId: string | null) => {
      set((state: MapState) => {
        state.mapFocusIncidentId = incidentId;
      });
    },

    setMapFocusUserId: (userId: string | null) => {
      set((state: MapState) => {
        state.mapFocusUserId = userId;
      });
    },

    setFlatViewFocusUserId: (userId: string | null) => {
      set((state: MapState) => {
        state.flatViewFocusUserId = userId;
      });
    },

    clearAllFocus: () => {
      set((state: MapState) => {
        state.mapFocusIncidentId = null;
        state.mapFocusUserId = null;
        state.flatViewFocusUserId = null;
      });
    },

    setIsMapReady: (isMapReady: boolean) => {
      set((state: MapState) => {
        state.isMapReady = isMapReady;
      });
    },

    reset: () => resetStore(initialState, set),
  },
});

export const useMapStore = createStore<MapState>(mapStore);

