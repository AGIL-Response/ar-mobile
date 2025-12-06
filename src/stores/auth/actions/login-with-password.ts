// eslint-disable-next-line import/no-cycle
import { authApi, handleApiError } from '@/api';
import { decodeJWT } from '@/lib/utils';
import { type AuthState, type ITenant } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';

const loginWithPassword =
  (set: any, get: any) => async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      throw new Error('Username and password are required');
    }

    const state: AuthState = get();
    if (!state.selectedTenant) {
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
        state.selectedTenant.name
      );

      // Use Keycloak token endpoint
      const tokenData = await authApi.loginWithKeycloak(
        username.trim(),
        password.trim(),
        state.selectedTenant.name
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
          fullName: profileResponse.data.fullName,
          description: profileResponse.data.description,
          tenantId: profileResponse.data.tenantId,
          realm: state.selectedTenant?.name || '',
          roles:
            profileResponse.data.tenantRoles?.map((role: any) => role.name) ||
            [],
          permissions: [], // Extract from roles if needed
          teamRoles: profileResponse.data.teamRoles || [],
          avatarId: profileResponse.data.avatarId || '',
          updatedAt: profileResponse.data.updatedAt || '',
        };

        // Set the selected tenant from the API response
        if (profileResponse.data.tenants) {
          const tenantFromResponse: ITenant = {
            id: profileResponse.data.tenants.id,
            name: profileResponse.data.tenants.name,
            displayName: profileResponse.data.tenants.name, // Use name as displayName for now
          };

          set((state: AuthState) => {
            state.selectedTenant = tenantFromResponse;
            // Also add to tenants array if not already there
            const existingTenant = state.tenants.find(
              (t) => t.id === tenantFromResponse.id
            );
            if (!existingTenant) {
              state.tenants.push(tenantFromResponse);
            }
          });

          console.log('Selected tenant set from profile:', tenantFromResponse);
        }
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
          fullName: jwtPayload?.given_name || '',
          description: jwtPayload?.family_name || '',
          tenantId: tenantId || '',
          realm: state.selectedTenant?.name || '',
          roles: [],
          permissions: [],
          teamRoles: [],
          avatarId: '',
          updatedAt: '',
        };
      }

      // User profile is already enhanced with the correct structure
      const enhancedUserProfile = userProfile;

      // Set user data
      get().actions.setUser(enhancedUserProfile);

      // Fetch user teams (non-blocking)
      try {
        console.log('Fetching user teams...');
        const teamsResponse = await authApi.getUserTeams(userId);

        if (
          teamsResponse?.data &&
          Array.isArray(teamsResponse.data) &&
          teamsResponse.data.length > 0
        ) {
          // Store only the first team since user only has one team
          get().actions.setSelectedTeam(teamsResponse.data[0]);
          console.log(
            'User team fetched successfully:',
            teamsResponse.data[0].name
          );
        } else {
          throw new Error('No teams found for user');
        }
      } catch (teamsError) {
        throw new Error('Failed to fetch user teams', { cause: teamsError });
      }

      // Note: Tenants are already fetched and stored during username check
      // No need to fetch them again here

      // Create geo entity if needed (non-blocking)
      try {
        await get().actions.createGeoEntityIfNeeded();
      } catch (geoError) {
        throw new Error('Failed to create geo entity', { cause: geoError });
      }

      // Initialize location monitoring after successful login (non-blocking)
      try {
        const locationStore = useLocationStore.getState();

        // Connect to WebSocket with access token
        locationStore.actions.connectToWebSocket(tokens.accessToken);

        // Start location monitoring
        await locationStore.actions.startLocationMonitoring();

        console.log('📍 Location monitoring initialized after login');
      } catch (locationError) {
        console.warn(
          'Location monitoring initialization failed, continuing with login:',
          locationError
        );
        // Don't block login if location monitoring fails
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
