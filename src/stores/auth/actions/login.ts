import AppApi, { handleApiError, LoginVariables } from '@/api';

const login = (_set: any, _get: any) => async (params: LoginVariables) => {
  try {
    const response = await AppApi.login(params);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default login;
