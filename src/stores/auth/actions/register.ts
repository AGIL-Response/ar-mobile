// eslint-disable-next-line import/no-cycle
import { authApi, handleApiError } from '@/api';
import { type RegisterRequest } from '@/api/auth/types';

const register = (_set: any, _get: any) => async (params: RegisterRequest) => {
  try {
    const response = await authApi.register(params);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default register;
