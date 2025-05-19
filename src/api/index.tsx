// eslint-disable-next-line import/no-cycle
import { apiClient } from '@/api/common';

export * from './common';

export type LoginVariables = {
  action: string;
  username: string;
  password: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
};

const login = (params: LoginVariables) => {
  return apiClient.post<LoginResponse>('auth', params);
};

const AppApi = {
  login,
};

export default AppApi;
