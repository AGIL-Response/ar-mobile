import { authApi, handleApiError } from "@/api";
import { LoginRequest } from "@/api/auth/types";

const login = (_set: any, _get: any) => async (params: LoginRequest) => {
  try {
    const response = await authApi.login(params);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default login;
