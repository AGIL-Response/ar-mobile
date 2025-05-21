// eslint-disable-next-line import/no-cycle
import { authApi, handleApiError } from '@/api';
import { AuthState } from "@/stores/auth";

const login =
  (set: any, get: any) => async (username: string, password: string) => {
    try {
      set((state: AuthState) => {
        state.isLoading = true;
      });
      const response = await authApi.login({
        action: 'login',
        username,
        password,
      });
      const tokens = response.token;
      const accessToken = tokens?.access_token;
      const expiresIn = tokens?.expires_in;
      const refreshToken = tokens?.refresh_token;
      get().actions.setTokens({ accessToken, expiresIn, refreshToken });
      get().actions.setUser({
        username: tokens?.preferred_username,
        userId: tokens?.sub,
        email: tokens?.email,
      });
      set((state: any) => {
        state.isLoading = false;
      });
      return response;
    } catch (error) {
      set((state: any) => {
        state.isLoading = false;
      });
      throw handleApiError(error);
    }
  };

export default login;
