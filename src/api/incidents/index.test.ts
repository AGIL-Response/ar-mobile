import { incidentsApi } from './index';
import { apiClient, handleApiError } from '../api-client';

// Mock dependencies
jest.mock('../api-client');

describe('incidentsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIncidents', () => {
    it('successfully gets all incidents with default params', async () => {
      const mockIncidents = [
        {
          id: 'incident-1',
          name: 'Incident 1',
          type: 'emergency' as const,
          status: 'NEW' as const,
        },
        {
          id: 'incident-2',
          name: 'Incident 2',
          type: 'maintenance' as const,
          status: 'IN_PROGRESS' as const,
        },
      ];

      const mockResponse = {
        data: {
          data: mockIncidents,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await incidentsApi.getIncidents();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/incidents?offset=0&limit=100&sort=%7B%7D&count=false'
      );
      expect(result).toEqual(mockIncidents);
    });

    it('builds query string with custom params', async () => {
      const params = {
        offset: 10,
        limit: 20,
        sort: '{"createdAt":"desc"}',
        count: true,
      };

      const mockResponse = {
        data: {
          data: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await incidentsApi.getIncidents(params);

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/incidents?')
      );
      const callUrl = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('offset=10');
      expect(callUrl).toContain('limit=20');
      expect(callUrl).toContain('sort=');
      expect(callUrl).toContain('count=true');
    });

    it('excludes undefined and null params from query string', async () => {
      const params = {
        offset: 10,
        limit: undefined,
        count: null as unknown as boolean,
      };

      const mockResponse = {
        data: {
          data: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await incidentsApi.getIncidents(params);

      const callUrl = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('offset=10');
      expect(callUrl).not.toContain('limit=');
      expect(callUrl).not.toContain('count=');
    });

    it('returns empty array when no data', async () => {
      const mockResponse = {
        data: {},
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await incidentsApi.getIncidents();

      expect(result).toEqual([]);
    });

    it('handles errors', async () => {
      const error = new Error('Failed to get incidents');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get incidents',
        status: 500,
      });

      await expect(incidentsApi.getIncidents()).rejects.toEqual({
        message: 'Failed to get incidents',
        status: 500,
      });
    });
  });

  describe('getIncident', () => {
    it('successfully gets a single incident', async () => {
      const incidentId = 'incident-1';

      const mockIncident = {
        id: 'incident-1',
        name: 'Test Incident',
        type: 'emergency' as const,
        status: 'NEW' as const,
      };

      const mockResponse = {
        data: {
          data: mockIncident,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await incidentsApi.getIncident(incidentId);

      expect(apiClient.get).toHaveBeenCalledWith('/incidents/incident-1');
      expect(result).toEqual(mockIncident);
    });

    it('handles errors', async () => {
      const incidentId = 'incident-1';

      const error = new Error('Incident not found');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Incident not found',
        status: 404,
      });

      await expect(incidentsApi.getIncident(incidentId)).rejects.toEqual({
        message: 'Incident not found',
        status: 404,
      });
    });
  });

  describe('createIncident', () => {
    it('successfully creates an incident', async () => {
      const incidentData = {
        name: 'New Incident',
        description: 'Description',
        type: 'fire' as const,
        status: 'NEW' as const,
        location: {
          coordinates: [103.826738, 1.282355, 0],
        },
      };

      const mockIncident = {
        id: 'incident-1',
        ...incidentData,
      };

      const mockResponse = {
        data: {
          data: mockIncident,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await incidentsApi.createIncident(incidentData);

      expect(apiClient.post).toHaveBeenCalledWith('/incidents', incidentData);
      expect(result).toEqual(mockIncident);
    });

    it('handles errors', async () => {
      const incidentData = {
        name: 'New Incident',
        description: 'Description',
        type: 'fire' as const,
        status: 'NEW' as const,
      };

      const error = new Error('Failed to create incident');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to create incident',
        status: 400,
      });

      await expect(incidentsApi.createIncident(incidentData)).rejects.toEqual({
        message: 'Failed to create incident',
        status: 400,
      });
    });
  });

  describe('updateIncident', () => {
    it('successfully updates an incident', async () => {
      const updateData = {
        id: 'incident-1',
        name: 'Updated Incident',
        status: 'IN_PROGRESS' as const,
      };

      const mockIncident = {
        id: 'incident-1',
        name: 'Updated Incident',
        status: 'IN_PROGRESS' as const,
      };

      const mockResponse = {
        data: {
          data: mockIncident,
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await incidentsApi.updateIncident(updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/incidents/incident-1', {
        name: 'Updated Incident',
        status: 'IN_PROGRESS',
      });
      expect(result).toEqual(mockIncident);
    });

    it('excludes id from request body', async () => {
      const updateData = {
        id: 'incident-1',
        name: 'Updated Incident',
        description: 'New description',
      };

      const mockResponse = {
        data: {
          data: { id: 'incident-1', name: 'Updated Incident' },
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      await incidentsApi.updateIncident(updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/incidents/incident-1', {
        name: 'Updated Incident',
        description: 'New description',
      });
    });

    it('handles errors', async () => {
      const updateData = {
        id: 'incident-1',
        name: 'Updated Incident',
      };

      const error = new Error('Failed to update incident');
      (apiClient.put as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to update incident',
        status: 400,
      });

      await expect(incidentsApi.updateIncident(updateData)).rejects.toEqual({
        message: 'Failed to update incident',
        status: 400,
      });
    });
  });

  describe('deleteIncident', () => {
    it('successfully deletes an incident', async () => {
      const incidentId = 'incident-1';

      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await incidentsApi.deleteIncident(incidentId);

      expect(apiClient.delete).toHaveBeenCalledWith('/incidents/incident-1');
    });

    it('handles errors', async () => {
      const incidentId = 'incident-1';

      const error = new Error('Failed to delete incident');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to delete incident',
        status: 404,
      });

      await expect(incidentsApi.deleteIncident(incidentId)).rejects.toEqual({
        message: 'Failed to delete incident',
        status: 404,
      });
    });
  });
});

