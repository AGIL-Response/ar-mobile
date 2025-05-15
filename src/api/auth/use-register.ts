import { apiClient, handleApiError } from '../common';

type RegisterVariables = {
  action: string;
  username: string;
  password: string;
  email: string;
};

type RegisterResponse = {
  success: boolean;
  message: string;
};

export const useRegister = () => {
  const register = async (
    variables: RegisterVariables
  ): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>(
        'auth',
        variables
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  return { register };
};
