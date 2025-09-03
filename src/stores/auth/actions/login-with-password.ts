// eslint-disable-next-line import/no-cycle
import { authApi, handleApiError } from '@/api';
import { decodeJWT } from '@/lib/utils';
import { type AuthState } from '@/stores/auth';

const loginWithPassword =
  (set: any, get: any) => async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      throw new Error('Username and password are required');
    }

    const state: AuthState = get();
    if (!state.currentRealm) {
      throw new Error('Please check your username first');
    }

    try {
      set((state: AuthState) => {
        state.isLoading = true;
      });

      console.log(
        'Authenticating with password grant for username:',
        username,
        'in realm:',
        state.currentRealm
      );

      // Use Keycloak token endpoint
      const tokenData = await authApi.loginWithKeycloak(
        username,
        password,
        state.currentRealm
      );

      console.log(
        `\x1b[34m🐣️ login-with-password token data`,
        `${JSON.stringify(tokenData, undefined, 2)}\x1b[0m`
      );

      // Decode JWT to extract tenant ID and user ID
      const jwtPayload = decodeJWT(tokenData.access_token);
      const tenantId = jwtPayload?.tenantId;
      const userId = jwtPayload?.id || jwtPayload?.sub;

      // Convert to our TokenResponse format
      const tokens = {
        accessToken: tokenData.access_token || '',
        refreshToken: tokenData.refresh_token || '',
        idToken: tokenData.id_token || '',
        expiresIn: tokenData.expires_in || 3600,
      };

      // Set tokens first
      get().actions.setTokens(tokens);

      // Get user profile using the new API endpoint with tenant ID and user ID
      console.log('Getting user profile...');
      let userProfile: any;
      try {
        const profileResponse = await authApi.getUserProfile(tenantId, userId);
        // Extract the actual user data from the API response structure
        userProfile = {
          id: profileResponse.data.id,
          username: profileResponse.data.username,
          email: profileResponse.data.email,
          firstName: profileResponse.data.fullName?.split(' ')[0] || '',
          lastName:
            profileResponse.data.fullName?.split(' ').slice(1).join(' ') || '',
          tenantId: profileResponse.data.tenantId,
          realm: state.currentRealm || '',
          roles:
            profileResponse.data.tenantRoles?.map((role: any) => role.name) ||
            [],
          permissions: [], // Extract from roles if needed
          teamRoles: profileResponse.data.teamRoles || [],
        };
      } catch (profileError) {
        console.warn(
          'Failed to get user profile from API, using JWT data:',
          profileError
        );
        // Fallback to JWT data if API fails
        userProfile = {
          id: userId,
          username: jwtPayload?.preferred_username || username,
          email: jwtPayload?.email || '',
          firstName: jwtPayload?.given_name || '',
          lastName: jwtPayload?.family_name || '',
          tenantId: tenantId || '',
          realm: state.currentRealm || '',
          roles: [],
          permissions: [],
          teamRoles: [],
        };
      }

      // User profile is already enhanced with the correct structure
      const enhancedUserProfile = userProfile;

      // Set user data
      get().actions.setUser(enhancedUserProfile);

      // Create geo entity if needed (non-blocking)
      try {
        await get().actions.createGeoEntityIfNeeded();
      } catch (geoError) {
        console.warn(
          'Geo entity creation failed, continuing with login:',
          geoError
        );
        // Don't block login if geo entity creation fails
      }

      set((state: AuthState) => {
        state.isLoading = false;
      });

      console.log('Login completed successfully');
      return { tokens, user: enhancedUserProfile };
    } catch (error) {
      set((state: AuthState) => {
        state.isLoading = false;
      });
      console.error('Login error:', error);
      throw handleApiError(error);
    }
  };

export default loginWithPassword;
