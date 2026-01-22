import { getUsersByTenant, getUserRoles, getTeamMembers, getTeams, getTeam } from './index';
import { apiClient, handleApiError } from '../api-client';
import type { ITeam, TeamResponse, TeamsQueryParams } from '@/types';

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

  describe('getTeamMembers', () => {
    it('successfully gets team members', async () => {
      const teamId = 'team-1';
      const mockMembersResponse = [
        {
          id: 'user-1',
          userId: 'user-1',
          fullName: 'Team Member One',
          email: 'member1@example.com',
          username: 'member1',
          createdAt: 1234567890,
          avatarId: 'avatar-1',
          description: 'Team member description',
          location: 'New York',
          roles: [
            {
              id: 'role-1',
              name: 'team-lead',
              displayName: 'Team Lead',
              description: 'Lead role',
            },
          ],
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          userId: 'user-2',
          fullName: 'Team Member Two',
          email: 'member2@example.com',
          username: 'member2',
          createdAt: 1234567891,
          roles: [],
        },
      ];

      const mockResponse = {
        data: {
          data: mockMembersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getTeamMembers(teamId);

      expect(apiClient.get).toHaveBeenCalledWith('/teams/team-1/users?sort={}&count=false');
      expect(result).toHaveLength(2);
      
      // Check first member
      expect(result[0]).toMatchObject({
        id: 'user-1',
        fullName: 'Team Member One',
        email: 'member1@example.com',
        username: 'member1',
        emailVerified: true,
        createdAt: 1234567890,
        enabled: true,
        avatarId: 'avatar-1',
        description: 'Team member description',
        location: 'New York',
        updatedAt: '2024-01-15T10:00:00Z',
      });
      
      expect(result[0].roles).toHaveLength(1);
      expect(result[0].roles[0]).toMatchObject({
        id: 'role-1',
        name: 'team-lead',
        displayName: 'Team Lead',
        description: 'Lead role',
        composite: false,
        clientRole: false,
        containerId: '',
      });
    });

    it('uses userId field when id is not present', async () => {
      const teamId = 'team-1';
      const mockMembersResponse = [
        {
          userId: 'user-123',
          fullName: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
          createdAt: 1234567890,
        },
      ];

      const mockResponse = {
        data: {
          data: mockMembersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getTeamMembers(teamId);

      expect(result[0].id).toBe('user-123');
    });

    it('handles members without optional fields', async () => {
      const teamId = 'team-1';
      const mockMembersResponse = [
        {
          userId: 'user-1',
          fullName: 'Simple User',
          email: 'simple@example.com',
          username: 'simple',
          createdAt: 1234567890,
        },
      ];

      const mockResponse = {
        data: {
          data: mockMembersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getTeamMembers(teamId);

      expect(result[0]).toMatchObject({
        id: 'user-1',
        fullName: 'Simple User',
        email: 'simple@example.com',
        username: 'simple',
        emailVerified: true,
        enabled: true,
        description: '',
        location: undefined,
        roles: [],
        updatedAt: '',
      });
    });

    it('handles members with roles missing optional fields', async () => {
      const teamId = 'team-1';
      const mockMembersResponse = [
        {
          userId: 'user-1',
          fullName: 'User One',
          email: 'user1@example.com',
          username: 'user1',
          createdAt: 1234567890,
          roles: [
            {
              id: 'role-1',
              name: 'member',
            },
          ],
        },
      ];

      const mockResponse = {
        data: {
          data: mockMembersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getTeamMembers(teamId);

      expect(result[0].roles[0]).toMatchObject({
        id: 'role-1',
        name: 'member',
        displayName: undefined,
        description: '',
        composite: false,
        clientRole: false,
        containerId: '',
      });
    });

    it('transforms multiple members correctly', async () => {
      const teamId = 'team-1';
      const mockMembersResponse = [
        {
          userId: 'user-1',
          fullName: 'User One',
          email: 'user1@example.com',
          username: 'user1',
          createdAt: 1234567890,
        },
        {
          userId: 'user-2',
          fullName: 'User Two',
          email: 'user2@example.com',
          username: 'user2',
          createdAt: 1234567891,
        },
        {
          userId: 'user-3',
          fullName: 'User Three',
          email: 'user3@example.com',
          username: 'user3',
          createdAt: 1234567892,
        },
      ];

      const mockResponse = {
        data: {
          data: mockMembersResponse,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getTeamMembers(teamId);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('user-1');
      expect(result[1].id).toBe('user-2');
      expect(result[2].id).toBe('user-3');
    });

    it('handles errors', async () => {
      const teamId = 'team-1';
      const error = new Error('Failed to get team members');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get team members',
        status: 404,
      });

      await expect(getTeamMembers(teamId)).rejects.toEqual({
        message: 'Failed to get team members',
        status: 404,
      });

      expect(handleApiError).toHaveBeenCalledWith(error);
    });
  });

  describe('Users API - Teams', () => {
    const mockTeamResponse: TeamResponse = {
      tenantId: 'tenant-1',
      id: 'team-1',
      name: 'Alpha Team',
      description: 'Test team description',
      settings: {
        isLocationTracked: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      deletedAt: null,
      createdBy: 'user-1',
      updatedBy: 'user-1',
      deletedBy: null,
      location: {
        type: 'Point',
        coordinates: [100.0, 0.0],
      },
    };
  
    const mockExpectedTeam: ITeam = {
      tenantId: 'tenant-1',
      id: 'team-1',
      name: 'Alpha Team',
      description: 'Test team description',
      settings: {
        isLocationTracked: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      deletedAt: null,
      createdBy: 'user-1',
      updatedBy: 'user-1',
      deletedBy: null,
      location: {
        type: 'Point',
        coordinates: [100.0, 0.0],
      },
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
      (handleApiError as jest.Mock).mockImplementation((error) => error);
    });
  
    describe('getTeams', () => {
      describe('Successful Requests', () => {
        it('should fetch teams without parameters', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: {
                total: 1,
                hasNextPage: false,
              },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeams();
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams');
          expect(result).toEqual({
            teams: [mockExpectedTeam],
            pagination: {
              total: 1,
              hasNextPage: false,
            },
          });
        });
  
        it('should fetch teams with empty parameters', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: {
                total: 1,
                hasNextPage: false,
              },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeams({});
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams');
          expect(result.teams).toHaveLength(1);
          expect(result.teams[0]).toEqual(mockExpectedTeam);
        });
  
        it('should fetch multiple teams', async () => {
          const mockTeam2: TeamResponse = {
            ...mockTeamResponse,
            id: 'team-2',
            name: 'Bravo Team',
          };
  
          const mockResponse = {
            data: {
              data: [mockTeamResponse, mockTeam2],
              message: 'Success',
              code: 'SUCCESS',
              pagination: {
                total: 2,
                hasNextPage: false,
              },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeams();
  
          expect(result.teams).toHaveLength(2);
          expect(result.teams[0].name).toBe('Alpha Team');
          expect(result.teams[1].name).toBe('Bravo Team');
        });
  
        it('should return empty array when no teams found', async () => {
          const mockResponse = {
            data: {
              data: [],
              message: 'Success',
              code: 'SUCCESS',
              pagination: {
                total: 0,
                hasNextPage: false,
              },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeams();
  
          expect(result.teams).toEqual([]);
          expect(result.pagination.total).toBe(0);
        });
  
        it('should include pagination info with hasNextPage true', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: {
                total: 100,
                hasNextPage: true,
              },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeams({ limit: 10 });
  
          expect(result.pagination).toEqual({
            total: 100,
            hasNextPage: true,
          });
        });
      });
  
      describe('Query Parameters - Single Values', () => {
        it('should build URL with isLocationTracked parameter', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ isLocationTracked: true });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?isLocationTracked=true');
        });
  
        it('should build URL with search parameter', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ search: 'Alpha' });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?search=Alpha');
        });
  
        it('should build URL with count parameter', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ count: true });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?count=true');
        });
  
        it('should build URL with offset parameter', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ offset: 10 });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?offset=10');
        });
  
        it('should build URL with limit parameter', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ limit: 20 });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?limit=20');
        });
  
        it('should handle isLocationTracked as false', async () => {
          const mockResponse = {
            data: {
              data: [],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 0, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ isLocationTracked: false });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?isLocationTracked=false');
        });
      });
  
      describe('Query Parameters - Array Values', () => {
        it('should build URL with single sort parameter', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ sort: ['name:asc'] });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?sort=name%3Aasc');
        });
  
        it('should build URL with multiple sort parameters', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ sort: ['name:asc', 'createdAt:desc'] });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?sort=name%3Aasc&sort=createdAt%3Adesc');
        });
  
        it('should build URL with single id parameter', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ id: ['team-1'] });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?id=team-1');
        });
  
        it('should build URL with multiple id parameters', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ id: ['team-1', 'team-2', 'team-3'] });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?id=team-1&id=team-2&id=team-3');
        });
  
        it('should build URL with userId parameters', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ userId: ['user-1', 'user-2'] });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?userId=user-1&userId=user-2');
        });
  
        it('should build URL with notIds parameters', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ notIds: ['team-99', 'team-100'] });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams?notIds=team-99&notIds=team-100');
        });
  
        it('should handle empty array parameters', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({ sort: [], id: [], userId: [] });
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams');
        });
      });
  
      describe('Query Parameters - Combined', () => {
        it('should build URL with multiple parameter types', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeams({
            isLocationTracked: true,
            search: 'Alpha',
            limit: 10,
            offset: 0,
            sort: ['name:asc'],
          });
  
          const callUrl = (apiClient.get as jest.Mock).mock.calls[0][0];
          expect(callUrl).toContain('isLocationTracked=true');
          expect(callUrl).toContain('search=Alpha');
          expect(callUrl).toContain('limit=10');
          expect(callUrl).toContain('offset=0');
          expect(callUrl).toContain('sort=name%3Aasc');
        });
  
        it('should build URL with all parameter types', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const params: TeamsQueryParams = {
            sort: ['name:asc', 'createdAt:desc'],
            id: ['team-1'],
            userId: ['user-1'],
            notIds: ['team-99'],
            isLocationTracked: true,
            search: 'test',
            count: true,
            offset: 10,
            limit: 20,
          };
  
          await getTeams(params);
  
          const callUrl = (apiClient.get as jest.Mock).mock.calls[0][0];
          expect(callUrl).toContain('/teams?');
          expect(callUrl).toContain('sort=');
          expect(callUrl).toContain('id=team-1');
          expect(callUrl).toContain('userId=user-1');
          expect(callUrl).toContain('notIds=team-99');
          expect(callUrl).toContain('isLocationTracked=true');
          expect(callUrl).toContain('search=test');
          expect(callUrl).toContain('count=true');
          expect(callUrl).toContain('offset=10');
          expect(callUrl).toContain('limit=20');
        });
      });
  
      describe('Response Mapping', () => {
        it('should correctly map TeamResponse to ITeam', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeams();
  
          expect(result.teams[0]).toEqual(mockExpectedTeam);
        });
  
        it('should handle teams with null deletedAt', async () => {
          const teamWithNullDeleted: TeamResponse = {
            ...mockTeamResponse,
            deletedAt: null,
            deletedBy: null,
          };
  
          const mockResponse = {
            data: {
              data: [teamWithNullDeleted],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeams();
  
          expect(result.teams[0].deletedAt).toBeNull();
          expect(result.teams[0].deletedBy).toBeNull();
        });
  
        it('should handle teams with location data', async () => {
          const mockResponse = {
            data: {
              data: [mockTeamResponse],
              message: 'Success',
              code: 'SUCCESS',
              pagination: { total: 1, hasNextPage: false },
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeams();
  
          expect(result.teams[0].location).toEqual({
            type: 'Point',
            coordinates: [100.0, 0.0],
          });
        });
      });
  
      describe('Error Handling', () => {
        it('should handle API errors', async () => {
          const apiError = new Error('API Error');
          (apiClient.get as jest.Mock).mockRejectedValue(apiError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Handled API Error'));
  
          await expect(getTeams()).rejects.toThrow('Handled API Error');
          expect(handleApiError).toHaveBeenCalledWith(apiError);
        });
  
        it('should handle network errors', async () => {
          const networkError = new Error('Network error');
          (apiClient.get as jest.Mock).mockRejectedValue(networkError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Handled Network Error'));
  
          await expect(getTeams({ search: 'test' })).rejects.toThrow('Handled Network Error');
          expect(handleApiError).toHaveBeenCalledWith(networkError);
        });
  
        it('should handle 404 errors', async () => {
          const notFoundError = { status: 404, message: 'Not found' };
          (apiClient.get as jest.Mock).mockRejectedValue(notFoundError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Teams not found'));
  
          await expect(getTeams({ id: ['non-existent'] })).rejects.toThrow('Teams not found');
        });
  
        it('should handle 500 server errors', async () => {
          const serverError = { status: 500, message: 'Internal server error' };
          (apiClient.get as jest.Mock).mockRejectedValue(serverError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Server error'));
  
          await expect(getTeams()).rejects.toThrow('Server error');
        });
      });
    });
  
    describe('getTeam', () => {
      describe('Successful Requests', () => {
        it('should fetch a single team by ID', async () => {
          const mockResponse = {
            data: {
              data: mockTeamResponse,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeam('team-1');
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams/team-1');
          expect(result).toEqual(mockExpectedTeam);
        });
  
        it('should fetch team with different ID', async () => {
          const team2Response: TeamResponse = {
            ...mockTeamResponse,
            id: 'team-2',
            name: 'Bravo Team',
          };
  
          const mockResponse = {
            data: {
              data: team2Response,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeam('team-2');
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams/team-2');
          expect(result.id).toBe('team-2');
          expect(result.name).toBe('Bravo Team');
        });
  
        it('should construct correct URL with team ID', async () => {
          const mockResponse = {
            data: {
              data: mockTeamResponse,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeam('abc-123-xyz');
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams/abc-123-xyz');
        });
      });
  
      describe('Response Mapping', () => {
        it('should correctly map TeamResponse to ITeam', async () => {
          const mockResponse = {
            data: {
              data: mockTeamResponse,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeam('team-1');
  
          expect(result).toEqual(mockExpectedTeam);
          expect(result.tenantId).toBe('tenant-1');
          expect(result.id).toBe('team-1');
          expect(result.name).toBe('Alpha Team');
          expect(result.description).toBe('Test team description');
          expect(result.settings).toEqual({ isLocationTracked: true });
          expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
          expect(result.updatedAt).toBe('2024-01-02T00:00:00Z');
          expect(result.deletedAt).toBeNull();
          expect(result.createdBy).toBe('user-1');
          expect(result.updatedBy).toBe('user-1');
          expect(result.deletedBy).toBeNull();
        });
  
        it('should handle team with location data', async () => {
          const mockResponse = {
            data: {
              data: mockTeamResponse,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeam('team-1');
  
          expect(result.location).toEqual({
            type: 'Point',
            coordinates: [100.0, 0.0],
          });
        });
  
        it('should handle team with null deletedAt and deletedBy', async () => {
          const mockResponse = {
            data: {
              data: mockTeamResponse,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const result = await getTeam('team-1');
  
          expect(result.deletedAt).toBeNull();
          expect(result.deletedBy).toBeNull();
        });
      });
  
      describe('Error Handling', () => {
        it('should handle API errors', async () => {
          const apiError = new Error('API Error');
          (apiClient.get as jest.Mock).mockRejectedValue(apiError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Handled API Error'));
  
          await expect(getTeam('team-1')).rejects.toThrow('Handled API Error');
          expect(handleApiError).toHaveBeenCalledWith(apiError);
        });
  
        it('should handle 404 not found error', async () => {
          const notFoundError = { status: 404, message: 'Team not found' };
          (apiClient.get as jest.Mock).mockRejectedValue(notFoundError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Team not found'));
  
          await expect(getTeam('non-existent-id')).rejects.toThrow('Team not found');
          expect(handleApiError).toHaveBeenCalledWith(notFoundError);
        });
  
        it('should handle network errors', async () => {
          const networkError = new Error('Network error');
          (apiClient.get as jest.Mock).mockRejectedValue(networkError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Handled Network Error'));
  
          await expect(getTeam('team-1')).rejects.toThrow('Handled Network Error');
          expect(handleApiError).toHaveBeenCalledWith(networkError);
        });
  
        it('should handle 500 server error', async () => {
          const serverError = { status: 500, message: 'Internal server error' };
          (apiClient.get as jest.Mock).mockRejectedValue(serverError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Server error'));
  
          await expect(getTeam('team-1')).rejects.toThrow('Server error');
          expect(handleApiError).toHaveBeenCalledWith(serverError);
        });
  
        it('should handle 401 unauthorized error', async () => {
          const unauthorizedError = { status: 401, message: 'Unauthorized' };
          (apiClient.get as jest.Mock).mockRejectedValue(unauthorizedError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Unauthorized access'));
  
          await expect(getTeam('team-1')).rejects.toThrow('Unauthorized access');
        });
  
        it('should handle 403 forbidden error', async () => {
          const forbiddenError = { status: 403, message: 'Forbidden' };
          (apiClient.get as jest.Mock).mockRejectedValue(forbiddenError);
          (handleApiError as jest.Mock).mockReturnValue(new Error('Access forbidden'));
  
          await expect(getTeam('team-1')).rejects.toThrow('Access forbidden');
        });
      });
  
      describe('Edge Cases', () => {
        it('should handle empty string team ID', async () => {
          const mockResponse = {
            data: {
              data: mockTeamResponse,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeam('');
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams/');
        });
  
        it('should handle team ID with special characters', async () => {
          const mockResponse = {
            data: {
              data: mockTeamResponse,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          await getTeam('team-123-abc_xyz');
  
          expect(apiClient.get).toHaveBeenCalledWith('/teams/team-123-abc_xyz');
        });
  
        it('should handle UUID format team ID', async () => {
          const mockResponse = {
            data: {
              data: mockTeamResponse,
              message: 'Success',
              code: 'SUCCESS',
            },
          };
  
          (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
  
          const uuid = '550e8400-e29b-41d4-a716-446655440000';
          await getTeam(uuid);
  
          expect(apiClient.get).toHaveBeenCalledWith(`/teams/${uuid}`);
        });
      });
    });
  });
});

