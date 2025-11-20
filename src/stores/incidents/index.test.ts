// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/incidents');

import { act, renderHook } from '@testing-library/react-native';

import { useIncidentsStore } from './index';

import { incidentsApi } from '@/api/incidents';
import { createIncident } from '@/lib/mock-data-tests';
import { IncidentsQueryParams } from '@/api/incidents/types';
import { IncidentStatus } from '@/types/incident';

jest.mock('@/api/incidents', () => ({
  incidentsApi: {
    getIncidents: jest.fn(),
    getIncident: jest.fn(),
    createIncident: jest.fn(),
    updateIncident: jest.fn(),
    deleteIncident: jest.fn(),
  },
}));

describe('IncidentsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIncidentsStore.getState().reset?.();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useIncidentsStore());

      expect(result.current.incidents).toEqual([]);
      expect(result.current.selectedIncident).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isLoadingDetails).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.searchQuery).toBe('');
      expect(result.current.filters).toEqual({});
    });
  });

  describe('fetchIncidents', () => {
    it('successfully fetches incidents', async () => {
      const mockIncidents = [
        createIncident({ id: '1', name: 'Incident 1' }),
        createIncident({ id: '2', name: 'Incident 2' }),
      ];
      (incidentsApi.getIncidents as jest.Mock).mockResolvedValue(mockIncidents);

      const { result } = renderHook(() => useIncidentsStore());

      await act(async () => {
        await result.current.actions.fetchIncidents('tenant-1');
      });

      expect(incidentsApi.getIncidents).toHaveBeenCalledWith(
        'tenant-1',
        undefined
      );
      expect(result.current.incidents).toEqual(mockIncidents);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('passes query params to API', async () => {
      (incidentsApi.getIncidents as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useIncidentsStore());

      const params = {
        status: 'active' as IncidentStatus,
        limit: 10,
      } as IncidentsQueryParams;
      await act(async () => {
        await result.current.actions.fetchIncidents('tenant-1', params);
      });

      expect(incidentsApi.getIncidents).toHaveBeenCalledWith(
        'tenant-1',
        params
      );
    });

    it('handles fetch error correctly', async () => {
      const errorMessage = 'Failed to fetch';
      (incidentsApi.getIncidents as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useIncidentsStore());

      await act(async () => {
        await result.current.actions.fetchIncidents('tenant-1');
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('fetchIncident', () => {
    it('successfully fetches and sets selected incident', async () => {
      const mockIncident = { id: '1', title: 'Incident 1' };
      (incidentsApi.getIncident as jest.Mock).mockResolvedValue(mockIncident);

      const { result } = renderHook(() => useIncidentsStore());

      await act(async () => {
        await result.current.actions.fetchIncident('tenant-1', '1');
      });

      expect(incidentsApi.getIncident).toHaveBeenCalledWith('tenant-1', '1');
      expect(result.current.selectedIncident).toEqual(mockIncident);
      expect(result.current.isLoadingDetails).toBe(false);
    });

    it('updates incident in list if it exists', async () => {
      const existingIncident = createIncident({ id: '1', name: 'Old Title' });
      const updatedIncident = createIncident({ id: '1', name: 'New Title' });

      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.incidents = [existingIncident];
      });

      (incidentsApi.getIncident as jest.Mock).mockResolvedValue(
        updatedIncident
      );

      await act(async () => {
        await result.current.actions.fetchIncident('tenant-1', '1');
      });

      expect(result.current.incidents[0]).toEqual(updatedIncident);
      expect(result.current.selectedIncident).toEqual(updatedIncident);
    });

    it('handles fetch error correctly', async () => {
      (incidentsApi.getIncident as jest.Mock).mockRejectedValue(
        new Error('Not found')
      );

      const { result } = renderHook(() => useIncidentsStore());

      await act(async () => {
        await result.current.actions.fetchIncident('tenant-1', '1');
      });

      expect(result.current.error).toBe('Not found');
      expect(result.current.isLoadingDetails).toBe(false);
    });
  });

  describe('createIncident', () => {
    it('successfully creates incident and adds to list', async () => {
      const newIncident = { id: '1', title: 'New Incident' };
      (incidentsApi.createIncident as jest.Mock).mockResolvedValue(newIncident);

      const { result } = renderHook(() => useIncidentsStore());

      await act(async () => {
        const created = await result.current.actions.createIncident(
          'tenant-1',
          { title: 'New Incident' }
        );
        expect(created).toEqual(newIncident);
      });

      expect(result.current.incidents[0]).toEqual(newIncident);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles create error correctly', async () => {
      const errorMessage = 'Creation failed';
      (incidentsApi.createIncident as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useIncidentsStore());

      await act(async () => {
        try {
          await result.current.actions.createIncident('tenant-1', {});
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('updateIncident', () => {
    it('successfully updates incident in list and selected incident', async () => {
      const existingIncident = createIncident({ id: '1', name: 'Old Title' });
      const updatedIncident = createIncident({ id: '1', name: 'New Title' });

      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.incidents = [existingIncident];
        result.current.selectedIncident = existingIncident;
      });

      (incidentsApi.updateIncident as jest.Mock).mockResolvedValue(
        updatedIncident
      );

      await act(async () => {
        await result.current.actions.updateIncident('tenant-1', {
          id: '1',
          title: 'New Title',
        });
      });

      expect(result.current.incidents[0]).toEqual(updatedIncident);
      expect(result.current.selectedIncident).toEqual(updatedIncident);
    });

    it('only updates selected incident if it matches', async () => {
      const incident1 = createIncident({ id: '1', name: 'Incident 1' });
      const incident2 = createIncident({ id: '2', name: 'Incident 2' });
      const updatedIncident1 = { id: '1', title: 'Updated 1' };

      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.incidents = [incident1, incident2];
        result.current.selectedIncident = incident2;
      });

      (incidentsApi.updateIncident as jest.Mock).mockResolvedValue(
        updatedIncident1
      );

      await act(async () => {
        await result.current.actions.updateIncident('tenant-1', {
          id: '1',
          title: 'Updated 1',
        });
      });

      expect(result.current.incidents[0]).toEqual(updatedIncident1);
      expect(result.current.selectedIncident).toEqual(incident2); // Unchanged
    });
  });

  describe('deleteIncident', () => {
    it('successfully deletes incident from list', async () => {
      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.incidents = [
          createIncident({ id: '1', name: 'Incident 1' }),
          createIncident({ id: '2', name: 'Incident 2' }),
        ];
      });

      (incidentsApi.deleteIncident as jest.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.actions.deleteIncident('tenant-1', '1');
      });

      expect(result.current.incidents).toHaveLength(1);
      expect(result.current.incidents[0].id).toBe('2');
    });

    it('clears selected incident if it was deleted', async () => {
      const incident = createIncident({ id: '1', name: 'Incident 1' });
      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.incidents = [incident];
        result.current.selectedIncident = incident;
      });

      (incidentsApi.deleteIncident as jest.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.actions.deleteIncident('tenant-1', '1');
      });

      expect(result.current.selectedIncident).toBeNull();
    });

    it('handles delete error correctly', async () => {
      (incidentsApi.deleteIncident as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useIncidentsStore());

      await act(async () => {
        try {
          await result.current.actions.deleteIncident('tenant-1', '1');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBe('Delete failed');
    });
  });

  describe('Simple Actions', () => {
    it('setSelectedIncident updates selected incident', () => {
      const { result } = renderHook(() => useIncidentsStore());
      const incident = createIncident({ id: '1', name: 'Incident' });

      act(() => {
        result.current.actions.setSelectedIncident(incident);
      });

      expect(result.current.selectedIncident).toEqual(incident);
    });

    it('setSearchQuery updates search query', () => {
      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.actions.setSearchQuery('test query');
      });

      expect(result.current.searchQuery).toBe('test query');
    });

    it('setFilters merges filters correctly', () => {
      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.actions.setFilters({ status: 'active' });
      });

      expect(result.current.filters).toEqual({ status: 'active' });

      act(() => {
        result.current.actions.setFilters({ type: 'fire' });
      });

      expect(result.current.filters).toEqual({
        status: 'active',
        type: 'fire',
      });
    });

    it('clearError clears error state', () => {
      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.error = 'Some error';
      });

      act(() => {
        result.current.actions.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      const { result } = renderHook(() => useIncidentsStore());

      act(() => {
        result.current.incidents = [
          createIncident({ id: '1', name: 'Incident 1' }),
        ];
        result.current.selectedIncident = createIncident({
          id: '1',
          name: 'Incident 1',
        });
        result.current.error = 'Error';
        result.current.searchQuery = 'query';
        result.current.filters = { status: 'active' };
      });

      act(() => {
        result.current.reset?.();
      });

      expect(result.current.incidents).toEqual([]);
      expect(result.current.selectedIncident).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.searchQuery).toBe('');
      expect(result.current.filters).toEqual({});
    });
  });
});
