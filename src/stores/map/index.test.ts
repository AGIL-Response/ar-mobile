// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/map');

import { act, renderHook } from '@testing-library/react-native';

// Bypass global jest-setup mock by requiring the real module via relative path
const realMapModule = jest.requireActual('./index') as typeof import('./index');
const useMapStore = realMapModule.useMapStore;

describe('MapStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMapStore.getState().reset?.();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useMapStore());

      expect(result.current.mapFocusIncidentId).toBeNull();
      expect(result.current.mapFocusUserId).toBeNull();
      expect(result.current.flatViewFocusUserId).toBeNull();
      expect(result.current.isMapReady).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setMapFocusIncident', () => {
    it('updates mapFocusIncidentId', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setMapFocusIncident('incident-1');
      });

      expect(result.current.mapFocusIncidentId).toBe('incident-1');
    });

    it('can set incident to null', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setMapFocusIncident('incident-1');
      });

      act(() => {
        result.current.actions.setMapFocusIncident(null);
      });

      expect(result.current.mapFocusIncidentId).toBeNull();
    });
  });

  describe('setMapFocusUserId', () => {
    it('updates mapFocusUserId', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setMapFocusUserId('user-1');
      });

      expect(result.current.mapFocusUserId).toBe('user-1');
    });

    it('can set userId to null', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setMapFocusUserId('user-1');
      });

      act(() => {
        result.current.actions.setMapFocusUserId(null);
      });

      expect(result.current.mapFocusUserId).toBeNull();
    });
  });

  describe('setFlatViewFocusUserId', () => {
    it('updates flatViewFocusUserId', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setFlatViewFocusUserId('user-1');
      });

      expect(result.current.flatViewFocusUserId).toBe('user-1');
    });

    it('can set userId to null', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setFlatViewFocusUserId('user-1');
      });

      act(() => {
        result.current.actions.setFlatViewFocusUserId(null);
      });

      expect(result.current.flatViewFocusUserId).toBeNull();
    });
  });

  describe('clearAllFocus', () => {
    it('clears all focus IDs', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setMapFocusIncident('incident-1');
        result.current.actions.setMapFocusUserId('user-1');
        result.current.actions.setFlatViewFocusUserId('user-2');
      });

      act(() => {
        result.current.actions.clearAllFocus();
      });

      expect(result.current.mapFocusIncidentId).toBeNull();
      expect(result.current.mapFocusUserId).toBeNull();
      expect(result.current.flatViewFocusUserId).toBeNull();
    });
  });

  describe('setIsMapReady', () => {
    it('updates isMapReady flag', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setIsMapReady(true);
      });

      expect(result.current.isMapReady).toBe(true);

      act(() => {
        result.current.actions.setIsMapReady(false);
      });

      expect(result.current.isMapReady).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.actions.setMapFocusIncident('incident-1');
        result.current.actions.setMapFocusUserId('user-1');
        result.current.actions.setFlatViewFocusUserId('user-2');
        result.current.actions.setIsMapReady(true);
      });

      act(() => {
        result.current.actions.reset();
      });

      expect(result.current.mapFocusIncidentId).toBeNull();
      expect(result.current.mapFocusUserId).toBeNull();
      expect(result.current.flatViewFocusUserId).toBeNull();
      expect(result.current.isMapReady).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
