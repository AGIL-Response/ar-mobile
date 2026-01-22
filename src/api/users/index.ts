import { apiClient, handleApiError } from '../api-client';

import type {
  ApiResponse,
  ITeam,
  Role,
  TeamMemberResponse,
  TeamResponse,
  TeamsQueryParams,
  User,
  UserResponse,
  UsersQueryParams,
} from '@/types';

// Re-export team types for convenience
export type { ITeam, TeamsQueryParams };

const mapUserResponseToUser = (userResponse: UserResponse): User => ({
  id: userResponse.id,
  fullName: userResponse.fullName,
  email: userResponse.email,
  username: userResponse.username,
  emailVerified: userResponse.emailVerified,
  createdAt: userResponse.createdAt,
  enabled: userResponse.enabled,
  description: userResponse.description,
  avatarId: userResponse.avatarId,
  updatedAt: userResponse.updatedAt,
  roles: userResponse.roles
    ? userResponse.roles.map((role: any) => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        composite: role.composite || false,
        clientRole: role.clientRole || false,
        containerId: role.containerId || '',
      }))
    : [],
});

/**
 * Get multiple users by tenant ID with pagination and filtering
 */
export async function getUsersByTenant(
  tenantId: string,
  params: UsersQueryParams = {},
): Promise<User[]> {
  try {
    const queryParams = new URLSearchParams();

    if (params.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.sort) {
      queryParams.append('sort', params.sort.toString());
    }

    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(url);
    
    // Transform UserResponse[] to User[] by mapping the response data directly
    const users: User[] = response.data.data.map(mapUserResponseToUser);

    return users;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get team members by team ID
 */
export async function getTeamMembers(teamId: string): Promise<User[]> {
  try {
    const url = `/teams/${teamId}/users?sort={}&count=false`;
    const response = await apiClient.get<ApiResponse<TeamMemberResponse[]>>(url);
    
    // Transform team member response to User[] format
    const users: User[] = response.data.data.map((memberResponse: TeamMemberResponse) => ({
      id: memberResponse.id || memberResponse.userId,
      fullName: memberResponse.fullName,
      email: memberResponse.email,
      username: memberResponse.username,
      emailVerified: true, // Not provided in team members API, default to true
      createdAt: memberResponse.createdAt, // Convert to timestamp
      enabled: true, // Not provided in team members API, default to true
      avatarId: memberResponse.avatarId,
      description: memberResponse.description || '',
      location: memberResponse.location,
      roles: memberResponse.roles ? memberResponse.roles.map((role: any) => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        composite: false,
        clientRole: false,
        containerId: '',
      })) : [],
      updatedAt: memberResponse.updatedAt || '',
    }));

    return users;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get user roles by user ID and tenant ID
 */
export async function getUserRoles(
  userId: string,
  tenantId: string,
): Promise<Role[]> {
  try {
    const url = `/users/${userId}/roles`;
    const response = await apiClient.get<{ data: Role[] }>(url);
    
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get teams with optional filtering
 */
export async function getTeams(params: TeamsQueryParams = {}): Promise<{
  teams: ITeam[];
  pagination: {
    total: number;
    hasNextPage: boolean;
  };
}> {
  try {
    const queryParams = new URLSearchParams();

    // Add array parameters (can appear multiple times)
    if (params.sort && params.sort.length > 0) {
      params.sort.forEach((s) => queryParams.append('sort', s));
    }
    if (params.id && params.id.length > 0) {
      params.id.forEach((id) => queryParams.append('id', id));
    }
    if (params.userId && params.userId.length > 0) {
      params.userId.forEach((userId) => queryParams.append('userId', userId));
    }
    if (params.notIds && params.notIds.length > 0) {
      params.notIds.forEach((notId) => queryParams.append('notIds', notId));
    }

    // Add single value parameters
    if (params.isLocationTracked !== undefined) {
      queryParams.append('isLocationTracked', params.isLocationTracked.toString());
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.count !== undefined) {
      queryParams.append('count', params.count.toString());
    }
    if (params.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/teams${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get<{
      data: TeamResponse[];
      message: string;
      code: string;
      pagination: {
        total: number;
        hasNextPage: boolean;
      };
    }>(url);

    // Transform TeamResponse[] to Team[]
    const teams: ITeam[] = response.data.data.map((teamResponse) => ({
      tenantId: teamResponse.tenantId,
      id: teamResponse.id,
      name: teamResponse.name,
      description: teamResponse.description,
      settings: teamResponse.settings,
      createdAt: teamResponse.createdAt,
      updatedAt: teamResponse.updatedAt,
      deletedAt: teamResponse.deletedAt,
      createdBy: teamResponse.createdBy,
      updatedBy: teamResponse.updatedBy,
      deletedBy: teamResponse.deletedBy,
      location: teamResponse.location,
    }));

    return {
      teams,
      pagination: response.data.pagination,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get a single team by ID
 */
export async function getTeam(teamId: string): Promise<ITeam> {
  try {
    const url = `/teams/${teamId}`;
    
    const response = await apiClient.get<{
      data: TeamResponse;
      message: string;
      code: string;
    }>(url);

    // Transform TeamResponse to ITeam
    const team: ITeam = {
      tenantId: response.data.data.tenantId,
      id: response.data.data.id,
      name: response.data.data.name,
      description: response.data.data.description,
      settings: response.data.data.settings,
      createdAt: response.data.data.createdAt,
      updatedAt: response.data.data.updatedAt,
      deletedAt: response.data.data.deletedAt,
      createdBy: response.data.data.createdBy,
      updatedBy: response.data.data.updatedBy,
      deletedBy: response.data.data.deletedBy,
      location: response.data.data.location,
    };

    return team;
  } catch (error) {
    throw handleApiError(error);
  }
}
