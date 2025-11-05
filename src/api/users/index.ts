import { apiClient, handleApiError } from '../api-client';

import type {
  ApiResponse,
  Role,
  TeamMemberResponse,
  User,
  UserResponse,
  UsersQueryParams,
  UsersResponse,
} from '@/types';

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
    const users: User[] = response.data.data.map((userResponse: UserResponse) => ({
      id: userResponse.id,
      fullName: userResponse.fullName,
      email: userResponse.email,
      username: userResponse.username,
      emailVerified: userResponse.emailVerified,
      createdAt: userResponse.createdAt, // Keep as number since API returns timestamp
      enabled: userResponse.enabled,
      roles: userResponse.roles ? userResponse.roles.map((role: any) => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        composite: role.composite || false,
        clientRole: role.clientRole || false,
        containerId: role.containerId || '',
      })) : [], // Transform role objects to Role objects
    }));

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
      createdAt: new Date(memberResponse.createdAt).getTime(), // Convert to timestamp
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
