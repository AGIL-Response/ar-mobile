import { getUsersByTenant, getUserRoles } from './index';
import { apiClient, handleApiError } from '../api-client';

// Mock dependencies
jest.mock('../api-client');

describe('usersApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsersByTenant', () => {
    it('successfully gets users without params', async () => {
      const tenantId = 'tenant-1';
      const mockUsersResponse = [
        {
          id: 'user-1',
          fullName: 'User One',
          email: 'user1@example.com',
          username: 'user1',
          emailVerified: true,
          createdAt: 1234567890,
          enabled: true,
          roles: [],
        },
        {
          id: 'user-2',
          fullName: 'User Two',
          email: 'user2@example.com',
          username: 'user2',
          emailVerified: false,
          createdAt: 1234567891,
          enabled: true,
          roles: [],
        },
      ];

      const mockResponse = {
        data: {
          data: mockUsersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getUsersByTenant(tenantId);

      expect(apiClient.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockUsersResponse);
    });

    it('builds query string with all params', async () => {
      const tenantId = 'tenant-1';
      const params = {
        offset: 10,
        limit: 20,
        search: 'john',
        sort: 'name',
      };

      const mockResponse = {
        data: {
          data: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await getUsersByTenant(tenantId, params);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/users?offset=10&limit=20&search=john&sort=name'
      );
    });

    it('builds query string with partial params', async () => {
      const tenantId = 'tenant-1';
      const params = {
        offset: 10,
        search: 'john',
      };

      const mockResponse = {
        data: {
          data: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await getUsersByTenant(tenantId, params);

      expect(apiClient.get).toHaveBeenCalledWith('/users?offset=10&search=john');
    });

    it('transforms user response correctly', async () => {
      const tenantId = 'tenant-1';
      const mockUsersResponse = [
        {
          id: 'user-1',
          fullName: 'User One',
          email: 'user1@example.com',
          username: 'user1',
          emailVerified: true,
          createdAt: 1234567890,
          enabled: true,
          roles: [
            {
              id: 'role-1',
              name: 'admin',
              displayName: 'Administrator',
              description: 'Admin role',
              composite: false,
              clientRole: true,
              containerId: 'container-1',
            },
          ],
        },
      ];

      const mockResponse = {
        data: {
          data: mockUsersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getUsersByTenant(tenantId);

      expect(result[0]).toMatchObject({
        id: 'user-1',
        fullName: 'User One',
        email: 'user1@example.com',
        username: 'user1',
        emailVerified: true,
        createdAt: 1234567890,
        enabled: true,
      });

      expect(result[0].roles).toHaveLength(1);
      expect(result[0].roles[0]).toMatchObject({
        id: 'role-1',
        name: 'admin',
        displayName: 'Administrator',
        description: 'Admin role',
        composite: false,
        clientRole: true,
        containerId: 'container-1',
      });
    });

    it('handles users without roles', async () => {
      const tenantId = 'tenant-1';
      const mockUsersResponse = [
        {
          id: 'user-1',
          fullName: 'User One',
          email: 'user1@example.com',
          username: 'user1',
          emailVerified: true,
          createdAt: 1234567890,
          enabled: true,
        },
      ];

      const mockResponse = {
        data: {
          data: mockUsersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getUsersByTenant(tenantId);

      expect(result[0].roles).toEqual([]);
    });

    it('handles roles with missing optional fields', async () => {
      const tenantId = 'tenant-1';
      const mockUsersResponse = [
        {
          id: 'user-1',
          fullName: 'User One',
          email: 'user1@example.com',
          username: 'user1',
          emailVerified: true,
          createdAt: 1234567890,
          enabled: true,
          roles: [
            {
              id: 'role-1',
              name: 'user',
            },
          ],
        },
      ];

      const mockResponse = {
        data: {
          data: mockUsersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getUsersByTenant(tenantId);

      expect(result[0].roles[0]).toMatchObject({
        id: 'role-1',
        name: 'user',
        displayName: undefined,
        description: '',
        composite: false,
        clientRole: false,
        containerId: '',
      });
    });

    it('handles errors', async () => {
      const tenantId = 'tenant-1';
      const error = new Error('Failed to get users');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get users',
        status: 500,
      });

      await expect(getUsersByTenant(tenantId)).rejects.toEqual({
        message: 'Failed to get users',
        status: 500,
      });
    });
  });

  describe('getUserRoles', () => {
    it('successfully gets user roles', async () => {
      const userId = 'user-1';
      const tenantId = 'tenant-1';

      const mockRoles = [
        {
          id: 'role-1',
          name: 'admin',
          displayName: 'Administrator',
          description: 'Admin role',
          composite: false,
          clientRole: true,
          containerId: 'container-1',
        },
        {
          id: 'role-2',
          name: 'user',
          displayName: 'User',
          description: 'Regular user',
          composite: false,
          clientRole: false,
          containerId: 'container-2',
        },
      ];

      const mockResponse = {
        data: {
          data: mockRoles,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getUserRoles(userId, tenantId);

      expect(apiClient.get).toHaveBeenCalledWith('/users/user-1/roles');
      expect(result).toEqual(mockRoles);
    });

    it('handles errors', async () => {
      const userId = 'user-1';
      const tenantId = 'tenant-1';

      const error = new Error('Failed to get roles');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get roles',
        status: 404,
      });

      await expect(getUserRoles(userId, tenantId)).rejects.toEqual({
        message: 'Failed to get roles',
        status: 404,
      });
    });
  });
});

