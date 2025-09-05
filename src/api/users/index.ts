import { apiClient, handleApiError } from '../api-client';

import type {
  Role,
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

    const url = `/tenants/${tenantId}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get<{ data: any[] }>(url);
    
    // Transform UserResponse[] to User[] by mapping the response data directly
    const users: User[] = response.data.data.map((userResponse: any) => ({
      id: userResponse.id,
      fullName: userResponse.fullName,
      email: userResponse.email,
      username: userResponse.username,
      emailVerified: userResponse.emailVerified,
      createdAt: userResponse.createdAt, // Keep as number since API returns timestamp
      enabled: userResponse.enabled,
      roles: userResponse.roles ? userResponse.roles.map((roleName: string) => ({
        id: roleName,
        name: roleName,
        description: '',
        composite: false,
        clientRole: false,
        containerId: '',
      })) : [], // Transform role names to Role objects
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
    const url = `/tenants/${tenantId}/users/${userId}/roles`;
    const response = await apiClient.get<{ data: Role[] }>(url);
    
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
