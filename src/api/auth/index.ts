// eslint-disable-next-line import/no-cycle
import { apiClient, handleApiError } from '../api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
} from './types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post('auth', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get tenant information by username
   */
  getTenantsByUsername: async (username: string): Promise<any> => {
    try {
      const response = await apiClient.get(
        `/auth/username/${encodeURIComponent(username)}/tenants`
      );
      return response?.data?.data?.[0] || null;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all tenants for a username
   */
  getAllTenantsByUsername: async (username: string): Promise<any> => {
    try {
      const response = await apiClient.get(
        `/auth/username/${encodeURIComponent(username)}/tenants`
      );
      return response?.data?.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Login with Keycloak using password grant
   */
  loginWithKeycloak: async (
    username: string,
    password: string,
    realm: string
  ): Promise<any> => {
    try {
      const tokenEndpoint = `https://dev-auth.agilres.net/realms/${realm}/protocol/openid-connect/token`;

      const tokenRequestBody = new URLSearchParams({
        client_id: 'ar_app',
        scope: 'openid profile email',
        grant_type: 'password',
        username: username,
        password: password,
      });

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenRequestBody.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token request failed:', response.status, errorData);

        if (response.status === 401) {
          throw new Error('Invalid username or password');
        } else if (response.status === 400) {
          throw new Error('Invalid request. Please try again.');
        } else {
          throw new Error(`Authentication failed (${response.status})`);
        }
      }

      const tokenData = await response.json();
      return tokenData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw handleApiError(error);
    }
  },

  /**
   * Refresh access token using refresh token grant
   */
  refreshToken: async (
    refreshToken: string,
    realm: string
  ): Promise<any> => {
    try {
      const tokenEndpoint = `https://dev-auth.agilres.net/realms/${realm}/protocol/openid-connect/token`;

      const tokenRequestBody = new URLSearchParams({
        client_id: 'ar_app',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenRequestBody.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token refresh failed:', response.status, errorData);

        if (response.status === 401 || response.status === 400) {
          throw new Error('Refresh token expired or invalid');
        } else {
          throw new Error(`Token refresh failed (${response.status})`);
        }
      }

      const tokenData = await response.json();
      return tokenData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw handleApiError(error);
    }
  },

  /**
   * Get user profile using tenant ID and user ID
   */
  getUserProfile: async (tenantId: string, userId: string): Promise<any> => {
    try {
      const response = await apiClient.get(
        `/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user teams by userId
   */
  getUserTeams: async (userId: string): Promise<any> => {
    try {
      const response = await apiClient.get(
        `/teams?userId=${encodeURIComponent(userId)}&isLocationTracked=true&sort={}&count=false`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Legacy login user (kept for backwards compatibility)
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('auth', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  /**
   * Update user profile information
   */
  updateUser: async (
    userId: string,
    payload: UpdateUserRequest
  ): Promise<any> => {
    try {
      const url = `/users/${userId}`;
      const response = await apiClient.patch<any>(url, payload);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
