// eslint-disable-next-line import/no-cycle
import { authApi, handleApiError } from '@/api';
import { type AuthState } from '@/stores/auth';

const checkUsername =
  (set: any, get: any) =>
  async (username: string): Promise<string | null> => {
    if (!username.trim()) {
      set((state: AuthState) => {
        state.usernameError = 'Username is required';
      });
      return null;
    }

    try {
      set((state: AuthState) => {
        state.isCheckingUsername = true;
        state.usernameError = null;
      });

      console.log('Getting tenant information for username:', username);
      const response = await authApi.getTenantsByUsername(username);
      console.log('Tenant resolved:', response);

      if (!response) {
        set((state: AuthState) => {
          state.usernameError =
            'Username not found. Please check your username and try again.';
        });
        return null;
      }

      const realm = response?.name;
      console.log('Found realm:', realm);

      // Store the realm for later use
      set((state: AuthState) => {
        state.currentRealm = realm;
      });

      console.log('Username check completed for realm:', realm);
      return realm;
    } catch (error) {
      console.error('Username check error:', error);
      const apiError = handleApiError(error);
      set((state: AuthState) => {
        state.usernameError = apiError.message || 'Failed to verify username';
      });
      return null;
    } finally {
      set((state: AuthState) => {
        state.isCheckingUsername = false;
      });
    }
  };

export default checkUsername;
