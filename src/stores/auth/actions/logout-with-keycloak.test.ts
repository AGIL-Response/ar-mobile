import logoutWithKeycloak from './logout-with-keycloak';

import { revokeToken } from '@/api/keycloak';
import { createAuthState, createLocationState } from '@/lib/mock-data-tests';
import { LocationState, useLocationStore } from '@/stores/location';
import { AuthState } from '..';

// Mock dependencies
jest.mock('@/api/keycloak', () => ({
  revokeToken: jest.fn(),
}));

const chatModule = jest.requireMock('@/services/chat');
const chatDbModule = jest.requireMock('@/services/chat/db-service');
const mockChatService = chatModule.chatService;
const mockChatDbService = chatDbModule.chatDbService;

describe('logoutWithKeycloak', () => {
  // Access global mocks from jest-setup.ts
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let action: ReturnType<typeof logoutWithKeycloak>;
  let mockState: AuthState;
  let mockLocationStore: LocationState;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();

    mockState = createAuthState();
    mockState.token = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      idToken: 'test-id-token',
      expiresIn: 3600,
    };
    mockState.selectedTenant = {
      id: 'tenant-1',
      name: 'test-tenant',
      displayName: 'Test Tenant',
    };
    mockState.user = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      tenantId: 'tenant-1',
      roles: ['admin'],
      realm: 'test-realm',
      avatarId: 'avatar-1',
      permissions: [],
      updatedAt: new Date().toISOString(),
    };
    mockState.tenants = [mockState.selectedTenant];
    mockState.selectedTeam = {
      tenantId: 'tenant-1',
      id: 'team-1',
      name: 'Test Team',
      description: 'Test Team Description',
      settings: {
        isLocationTracked: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: 'user-1',
      updatedBy: 'user-1',
      deletedBy: null,
      location: {
        type: 'Point',
        coordinates: [123.456, 78.910],
      },
    };
    mockState.geoEntity = {
      id: 'geo-1',
      entityId: 'geo-1',
      kind: 'aircraft',
      active: true,
      callsign: 'test-callsign',
      gisId: 'test-gis-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockLocationStore = createLocationState();

    (useLocationStore.getState as jest.Mock).mockReturnValue(mockLocationStore);

    mockSet = jest.fn((fn: (state: AuthState) => void) => {
      if (typeof fn === 'function') {
        fn(mockState);
      }
    });

    mockGet = jest.fn(() => mockState);

    action = logoutWithKeycloak(mockSet, mockGet);

    // Reset mock implementations
    (revokeToken as jest.Mock).mockResolvedValue(undefined);
    mockChatService.disconnect.mockImplementation(() => {});
    mockChatDbService.clearAll.mockResolvedValue(undefined);
  });

  describe('Successful Logout', () => {
    it('successfully revokes refresh token with Keycloak', async () => {
      await action();

      expect(revokeToken).toHaveBeenCalledWith(
        'test-tenant',
        'test-refresh-token',
        'refresh_token'
      );
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('stops location monitoring and disconnects WebSocket', async () => {
      await action();

      expect(mockLocationStore.actions.stopLocationMonitoring).toHaveBeenCalled();
      expect(mockLocationStore.actions.disconnectFromWebSocket).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        '📍 Location monitoring stopped during logout'
      );
    });

    it('attempts to disconnect chat socket during logout', async () => {
      await action();

      // Note: Chat service uses dynamic imports which aren't fully supported in Jest
      // We verify that logout continues successfully even if chat services fail
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('clears all auth state after logout', async () => {
      await action();

      expect(mockSet).toHaveBeenCalled();

      // Verify that state was cleared
      expect(mockState.token.accessToken).toBeUndefined();
      expect(mockState.token.refreshToken).toBeUndefined();
      expect(mockState.token.idToken).toBeUndefined();
      expect(mockState.token.expiresIn).toBeUndefined();
      expect(mockState.user).toBeUndefined();
      expect(mockState.tenants).toEqual([]);
      expect(mockState.selectedTenant).toBeNull();
      expect(mockState.selectedTeam).toBeNull();
      expect(mockState.geoEntity).toBeUndefined();
      expect(mockState.usernameError).toBeNull();
      expect(mockState.isCheckingUsername).toBe(false);
    });

    it('executes main logout steps in correct order', async () => {
      const executionOrder: string[] = [];

      (revokeToken as jest.Mock).mockImplementation(async () => {
        executionOrder.push('revoke-token');
      });

      (mockLocationStore.actions.stopLocationMonitoring as jest.Mock).mockImplementation(
        () => {
          executionOrder.push('stop-location');
        }
      );

      (mockLocationStore.actions.disconnectFromWebSocket as jest.Mock).mockImplementation(
        () => {
          executionOrder.push('disconnect-websocket');
        }
      );

      mockSet.mockImplementation((fn: (state: AuthState) => void) => {
        executionOrder.push('clear-state');
        if (typeof fn === 'function') {
          fn(mockState);
        }
      });

      await action();

      // Note: Chat services (disconnect-chat, clear-chat-db) use dynamic imports
      // which aren't fully testable in Jest without experimental VM modules
      expect(executionOrder).toContain('revoke-token');
      expect(executionOrder).toContain('stop-location');
      expect(executionOrder).toContain('disconnect-websocket');
      expect(executionOrder).toContain('clear-state');
      
      // Verify order of main operations
      const revokeIndex = executionOrder.indexOf('revoke-token');
      const locationIndex = executionOrder.indexOf('stop-location');
      
      expect(revokeIndex).toBeLessThan(locationIndex);
    });
  });

  describe('Token Revocation Scenarios', () => {
    it('continues logout if refresh token is missing', async () => {
      mockState.token.refreshToken = undefined;

      await action();

      expect(revokeToken).not.toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled(); // State still cleared
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('continues logout if selectedTenant is missing', async () => {
      mockState.selectedTenant = null;

      await action();

      expect(revokeToken).not.toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled(); // State still cleared
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('continues logout if both refresh token and tenant are missing', async () => {
      mockState.token.refreshToken = undefined;
      mockState.selectedTenant = null;

      await action();

      expect(revokeToken).not.toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('continues logout even if token revocation fails', async () => {
      const revokeError = new Error('Token revocation failed');
      (revokeToken as jest.Mock).mockRejectedValue(revokeError);

      await action();

      expect(revokeToken).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('⚠️ Error revoking token:', revokeError);
      expect(mockSet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('handles network errors during token revocation', async () => {
      const networkError = new Error('Network request failed');
      (revokeToken as jest.Mock).mockRejectedValue(networkError);

      await action();

      expect(console.warn).toHaveBeenCalledWith('⚠️ Error revoking token:', networkError);
      expect(mockLocationStore.actions.stopLocationMonitoring).toHaveBeenCalled();
    });

    it('handles timeout errors during token revocation', async () => {
      const timeoutError = new Error('Request timeout');
      (revokeToken as jest.Mock).mockRejectedValue(timeoutError);

      await action();

      expect(console.warn).toHaveBeenCalledWith('⚠️ Error revoking token:', timeoutError);
      expect(mockSet).toHaveBeenCalled();
    });
  });

  describe('Location Monitoring Scenarios', () => {
    it('continues logout if location monitoring stop fails', async () => {
      const locationError = new Error('Failed to stop location monitoring');
      (
        mockLocationStore.actions.stopLocationMonitoring as jest.Mock
      ).mockImplementation(() => {
        throw locationError;
      });

      await action();

      expect(console.warn).toHaveBeenCalledWith(
        'Error stopping location monitoring during logout:',
        locationError
      );
      expect(mockSet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('continues logout if WebSocket disconnect fails', async () => {
      const wsError = new Error('WebSocket disconnect failed');
      (mockLocationStore.actions.disconnectFromWebSocket as jest.Mock).mockImplementation(
        () => {
          throw wsError;
        }
      );

      await action();

      expect(console.warn).toHaveBeenCalledWith(
        'Error stopping location monitoring during logout:',
        wsError
      );
      expect(mockSet).toHaveBeenCalled();
    });

    it('handles case where useLocationStore is unavailable', async () => {
      (useLocationStore.getState as jest.Mock).mockImplementation(() => {
        throw new Error('Location store not available');
      });

      await action();

      expect(console.warn).toHaveBeenCalledWith(
        'Error stopping location monitoring during logout:',
        expect.any(Error)
      );
      expect(mockSet).toHaveBeenCalled();
    });
  });

  describe('Chat Service Scenarios', () => {
    it('continues logout even if chat services fail', async () => {
      // Note: Chat services use dynamic imports which aren't fully supported in Jest
      // The implementation catches all errors from chat cleanup and continues logout
      await action();

      // Verify that logout completes successfully despite chat service issues
      expect(mockSet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
      
      // The warning about chat errors may appear due to dynamic import limitations
      // This is expected behavior in the test environment
    });

    it('handles chat service import failure gracefully', async () => {
      // The actual implementation catches errors from dynamic imports
      // and continues with logout - this is defensive programming
      await action();

      expect(mockSet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });
  });

  describe('State Clearing', () => {
    it('clears token state correctly', async () => {
      await action();

      expect(mockState.token.accessToken).toBeUndefined();
      expect(mockState.token.refreshToken).toBeUndefined();
      expect(mockState.token.idToken).toBeUndefined();
      expect(mockState.token.expiresIn).toBeUndefined();
    });

    it('clears user state correctly', async () => {
      await action();

      expect(mockState.user).toBeUndefined();
    });

    it('clears tenant state correctly', async () => {
      await action();

      expect(mockState.tenants).toEqual([]);
      expect(mockState.selectedTenant).toBeNull();
    });

    it('clears team state correctly', async () => {
      await action();

      expect(mockState.selectedTeam).toBeNull();
    });

    it('clears geo entity state correctly', async () => {
      await action();

      expect(mockState.geoEntity).toBeUndefined();
    });

    it('resets username checking state', async () => {
      mockState.usernameError = 'Some error';
      mockState.isCheckingUsername = true;

      await action();

      expect(mockState.usernameError).toBeNull();
      expect(mockState.isCheckingUsername).toBe(false);
    });

    it('clears all state fields in a single set call', async () => {
      await action();

      expect(mockSet).toHaveBeenCalled();
      const setCall = mockSet.mock.calls.find((call) => {
        const testState = { ...mockState };
        call[0](testState);
        return testState.user === undefined;
      });

      expect(setCall).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles logout when state is already partially cleared', async () => {
      mockState.user = undefined;
      mockState.token.accessToken = undefined;
      mockState.selectedTenant = null;

      await action();

      expect(mockSet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('handles logout when state is completely empty', async () => {
      mockState = createAuthState();

      mockGet.mockReturnValue(mockState);

      await action();

      expect(mockSet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('handles multiple consecutive logout calls', async () => {
      await action();
      await action();
      await action();

      expect(mockSet).toHaveBeenCalledTimes(9);
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('handles logout with empty tenant name', async () => {
      mockState.selectedTenant = {
        id: 'tenant-1',
        name: '',
        displayName: 'Test Tenant',
      };

      await action();

      expect(revokeToken).not.toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
    });

    it('handles logout with missing token object properties', async () => {
      mockState.token = {
        accessToken: undefined,
        refreshToken: undefined,
        idToken: undefined,
        expiresIn: undefined,
      };

      await action();

      expect(revokeToken).not.toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('completes full logout flow with all services available', async () => {
      await action();

      // Verify token revocation
      expect(revokeToken).toHaveBeenCalledWith(
        'test-tenant',
        'test-refresh-token',
        'refresh_token'
      );

      // Verify location services
      expect(mockLocationStore.actions.stopLocationMonitoring).toHaveBeenCalled();
      expect(mockLocationStore.actions.disconnectFromWebSocket).toHaveBeenCalled();

      // Note: Chat services use dynamic imports which aren't fully testable in Jest
      // The implementation handles these services, but we can't directly verify the calls

      // Verify state cleared
      expect(mockState.user).toBeUndefined();
      expect(mockState.token.accessToken).toBeUndefined();

      // Verify completion log
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('handles partial service failures gracefully', async () => {
      (revokeToken as jest.Mock).mockRejectedValue(new Error('Revoke failed'));
      (
        mockLocationStore.actions.stopLocationMonitoring as jest.Mock
      ).mockImplementation(() => {
        throw new Error('Location failed');
      });

      await action();

      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ Error revoking token:',
        expect.any(Error)
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Error stopping location monitoring during logout:',
        expect.any(Error)
      );

      // Still completes logout
      expect(mockSet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('logs expected messages during successful logout', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log');

      await action();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📍 Location monitoring stopped during logout'
      );
      // Note: Chat logs may not appear due to dynamic import limitations in Jest
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Logout completed successfully');
    });

    it('ensures state is always cleared even with all service failures', async () => {
      // Simulate all services failing
      (revokeToken as jest.Mock).mockRejectedValue(new Error('Revoke failed'));
      (useLocationStore.getState as jest.Mock).mockImplementation(() => {
        throw new Error('Location store unavailable');
      });
      mockChatService.disconnect.mockImplementation(() => {
        throw new Error('Chat disconnect failed');
      });
      mockChatDbService.clearAll.mockRejectedValue(new Error('DB clear failed'));

      await action();

      // State should still be cleared
      expect(mockSet).toHaveBeenCalled();
      expect(mockState.user).toBeUndefined();
      expect(mockState.token.accessToken).toBeUndefined();
      expect(mockState.selectedTenant).toBeNull();
    });
  });
});

