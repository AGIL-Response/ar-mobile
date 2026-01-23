/**
 * Logout with Keycloak Action
 * Handles proper Keycloak logout including token revocation and session termination
 */

import { revokeToken } from '@/api/keycloak';
import { type AuthState } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';

const logoutWithKeycloak = (set: any, get: any) => async () => {
  set((state: AuthState) => {
    state.isLoggingOut = true;
  });

  try {
    const state: AuthState = get();
    const { token, selectedTenant } = state;

    // Step 1: Revoke the refresh token with Keycloak
    if (token.refreshToken && selectedTenant?.name) {
      try {
        await revokeToken(
          selectedTenant.name,
          token.refreshToken,
          'refresh_token'
        );
      } catch (error) {
        console.warn('⚠️ Error revoking token:', error);
        // Continue with logout even if revocation fails
      }
    }

    // Step 2: Stop location monitoring and disconnect WebSocket
    try {
      const locationStore = useLocationStore.getState();
      locationStore.actions.stopLocationMonitoring();
      locationStore.actions.disconnectFromWebSocket();
      console.log('📍 Location monitoring stopped during logout');
    } catch (error) {
      console.warn('Error stopping location monitoring during logout:', error);
    }

    // Step 3: Disconnect chat socket and clear database
    try {
      const { chatService } = await import('@/services/chat');
      chatService.disconnect();
      console.log('💬 Chat socket disconnected during logout');

      const { chatDbService } = await import('@/services/chat/db-service');
      await chatDbService.clearAll();
      console.log('💬 Chat database cleared during logout');
    } catch (error) {
      console.warn('Error clearing chat during logout:', error);
    }

    // Step 4: Clear all local auth state
    set((state: AuthState) => {
      state.token = {
        accessToken: undefined,
        expiresIn: undefined,
        refreshToken: undefined,
        idToken: undefined,
      };
      state.user = undefined;
      state.tenants = [];
      state.selectedTenant = null;
      state.selectedTeam = null;
      state.geoEntity = undefined;
      state.usernameError = null;
      state.isCheckingUsername = false;
    });

    console.log('✅ Logout completed successfully');
  } finally {
    set((state: AuthState) => {
      state.isLoggingOut = false;
    });
  }
};

export default logoutWithKeycloak;

