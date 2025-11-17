import { apiClient, handleApiError } from '../api-client';

import type {
  ApiResponse,
  Role,
  TeamMemberResponse,
  User,
  UserResponse,
  UsersQueryParams,
} from '@/types';

export interface UpdateUserPayload {
  username: string;
  email: string;
  fullName: string;
  description: string;
  avatarId: string;
  updatedAt: string;
}

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
 * Update user by ID
 */
export async function updateUser(
  userId: string,
  payload: UpdateUserPayload
): Promise<User> {
  try {
    console.log('🚀 Request: PUT /users/${userId}', payload);
    const url = `/users/${userId}`;
    const response = await apiClient.patch<ApiResponse<UserResponse>>(url, payload);
    console.log('✅ Response: PUT /users/${userId}', response.data.data);
    return mapUserResponseToUser(response.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
}
