import { apiClient, handleApiError } from '../api-client';
import type { AuthResponse, LoginRequest, RegisterRequest } from './types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('auth', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('auth', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
