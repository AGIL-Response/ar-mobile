/**
 * Login with OAuth Action
 * Handles post-OAuth authentication flow (user profile, teams, geo entity, location)
 */

import { authApi, handleApiError } from '@/api';
import { getTeam } from '@/api/users';
import { decodeJWT } from '@/lib/utils';
import { type AuthState, type ITenant } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';
import type * as AuthSession from 'expo-auth-session';

const loginWithOAuth =
  (set: any, get: any) =>
  async (tokenResponse: AuthSession.TokenResponse) => {
    const state: AuthState = get();
    if (!state.selectedTenant) {
      throw new Error('No tenant selected. Please check your username first.');
    }

    try {
      set((state: AuthState) => {
        state.isLoading = true;
      });

      console.log(
        'Processing OAuth tokens for realm:',
        state.selectedTenant.name
      );

      const accessToken = tokenResponse.accessToken;
      const refreshToken = tokenResponse.refreshToken;
      const idToken = tokenResponse.idToken;
      if (!accessToken) {
        throw new Error('No access token received from OAuth flow');
      }

      // Decode JWT to extract tenant ID and user ID
      const jwtPayload = decodeJWT(accessToken);
      const tenantId = jwtPayload?.tenantId;
      const userId = jwtPayload?.id || jwtPayload?.sub;
      const teamId = jwtPayload?.teamIds?.[0];

      console.log(
        `\x1b[34m🐣️ login-with-oauth token data`,
        `Access Token: ${accessToken.substring(0, 20)}...`,
        `User ID: ${userId}`,
        `Tenant ID: ${tenantId}\x1b[0m`
      );

      // Convert to our TokenResponse format
      const tokens = {
        accessToken: accessToken || '',
        refreshToken: refreshToken || '',
        idToken: idToken || '',
        expiresIn: tokenResponse.expiresIn || 3600,
      };

      // Set tokens first
      get().actions.setTokens(tokens);

      // Get user profile using the API endpoint with tenant ID and user ID
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
          username: jwtPayload?.preferred_username || '',
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

      // Set user data
      get().actions.setUser(userProfile);

      // Fetch user team by team ID (non-blocking)
      try {
        console.log('Fetching user team...');
        
        if (!teamId) {
          throw new Error('No team ID found in user team roles');
        }
        
        const team = await getTeam(teamId);
        get().actions.setSelectedTeam(team);
        console.log('User team fetched successfully:', team.name);
      } catch (teamsError) {
        throw new Error('Failed to fetch user teams', { cause: teamsError });
      }

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

        console.log('📍 Location monitoring initialized after OAuth login');
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

      console.log('OAuth login completed successfully');
      return { tokens, user: userProfile };
    } catch (error) {
      set((state: AuthState) => {
        state.isLoading = false;
      });
      console.error('OAuth login error:', error);
      throw handleApiError(error);
    }
  };

export default loginWithOAuth;

