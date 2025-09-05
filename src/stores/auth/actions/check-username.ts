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
      const allTenants = await authApi.getAllTenantsByUsername(username);
      console.log('Tenants resolved:', allTenants);

      if (!allTenants || allTenants.length === 0) {
        set((state: AuthState) => {
          state.usernameError =
            'Username not found. Please check your username and try again.';
        });
        return null;
      }

      // Store all tenants and select first one
      const firstTenant = allTenants[0];
      const realm = firstTenant?.name;
      console.log('Found realm:', realm);

      // Save all tenants and select first one
      set((state: AuthState) => {
        state.tenants = allTenants;
        state.selectedTenant = firstTenant;
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
