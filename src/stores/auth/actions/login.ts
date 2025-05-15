import { apiClient, handleApiError } from '@/api';

export type LoginVariables = {
  action: string;
  username: string;
  password: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
};

const login = (_set: any, _get: any) => async (params: LoginVariables) => {
  try {
    const response = await apiClient.post<LoginResponse>('auth', params);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default login;
