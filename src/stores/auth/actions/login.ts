// eslint-disable-next-line import/no-cycle
import { authApi, handleApiError } from '@/api';

const login =
  (_set: any, _get: any) => async (username: string, password: string) => {
    try {
      const response = await authApi.login({
        action: 'login',
        username: username,
        password: password,
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  };

export default login;
