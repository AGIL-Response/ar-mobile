import loginWithPassword from './login-with-password';

import { authApi, handleApiError } from '@/api';
import { decodeJWT } from '@/lib/utils';
import { LocationState, useLocationStore } from '@/stores/location';
import { AuthState } from '..';
import { createAuthState, createLocationState } from '@/lib/mock-data-tests';

jest.mock('@/stores/location', () => ({
  useLocationStore: {
    getState: jest.fn(),
  },
}));

describe('loginWithPassword', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let action: ReturnType<typeof loginWithPassword>;
  let mockState: AuthState;
  let mockLocationStore: LocationState;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    mockState = createAuthState();

    mockLocationStore = createLocationState();

    (useLocationStore.getState as jest.Mock).mockReturnValue(mockLocationStore);

    mockSet = jest.fn((fn: (state: AuthState) => void) => {
      if (typeof fn === 'function') {
        fn(mockState);
      }
    });

    mockGet = jest.fn(() => ({
      ...mockState,
    }));

    action = loginWithPassword(mockSet, mockGet);
  });

  describe('Input Validation', () => {
    it('throws error for empty username', async () => {
      await expect(action('', 'password')).rejects.toThrow(
        'Username and password are required'
      );
    });

    it('throws error for empty password', async () => {
      await expect(action('username', '')).rejects.toThrow(
        'Username and password are required'
      );
    });

    it('throws error for whitespace-only username', async () => {
      await expect(action('   ', 'password')).rejects.toThrow(
        'Username and password are required'
      );
    });

    it('throws error when selectedTenant is missing', async () => {
      mockState.selectedTenant = null;

      await expect(action('username', 'password')).rejects.toThrow(
        'Please check your username first'
      );
    });
  });

  describe('Successful Login', () => {
    const mockTokenData = {
      access_token: 'access_token_123',
      refresh_token: 'refresh_token_123',
      id_token: 'id_token_123',
      expires_in: 3600,
    };

    const mockJwtPayload = {
      tenantId: 'tenant-1',
      id: 'user-1',
      sub: 'user-1',
      preferred_username: 'testuser',
      email: 'test@example.com',
      given_name: 'Test',
      family_name: 'User',
    };

    const mockUserProfile = {
      data: {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        tenantId: 'tenant-1',
        tenantRoles: [{ name: 'admin' }, { name: 'user' }],
        teamRoles: [],
        tenants: {
          id: 'tenant-1',
          name: 'tenant1',
        },
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (authApi.getUserTeams as jest.Mock).mockResolvedValue({
        data: [
          {
            id: 'team-1',
            name: 'Test Team',
            tenantId: 'tenant-1',
          },
        ],
      });
    });

    it('successfully logs in with user profile', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(mockJwtPayload);
      (authApi.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      // Ensure createGeoEntityIfNeeded resolves successfully
      (mockState.actions.createGeoEntityIfNeeded as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await action('testuser', 'password123');

      expect(authApi.loginWithKeycloak).toHaveBeenCalledWith(
        'testuser',
        'password123',
        'tenant1'
      );
      expect(decodeJWT).toHaveBeenCalledWith('access_token_123');

      const getCalls = mockGet.mock.calls;
      expect(getCalls.length).toBeGreaterThan(0);

      // Verify tokens were set
      const setTokensCall = mockGet().actions.setTokens;
      expect(setTokensCall).toHaveBeenCalledWith({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
        idToken: 'id_token_123',
        expiresIn: 3600,
      });

      // Verify user was set
      const setUserCall = mockGet().actions.setUser;
      expect(setUserCall).toHaveBeenCalled();
      const userArg = setUserCall.mock.calls[0][0];
      expect(userArg.id).toBe('user-1');
      expect(userArg.username).toBe('testuser');
      expect(userArg.roles).toEqual(['admin', 'user']);

      // Verify team was set
      expect(authApi.getUserTeams).toHaveBeenCalledWith('user-1');
      const setSelectedTeamCall = mockGet().actions.setSelectedTeam;
      expect(setSelectedTeamCall).toHaveBeenCalledWith({
        id: 'team-1',
        name: 'Test Team',
        tenantId: 'tenant-1',
      });

      // Verify location monitoring was initialized
      expect(mockLocationStore.actions.connectToWebSocket).toHaveBeenCalledWith(
        'access_token_123'
      );
      expect(
        mockLocationStore.actions.startLocationMonitoring
      ).toHaveBeenCalled();

      expect(result.tokens).toEqual({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
        idToken: 'id_token_123',
        expiresIn: 3600,
      });
    });

    it('falls back to JWT data when user profile API fails', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(mockJwtPayload);
      (authApi.getUserProfile as jest.Mock).mockRejectedValue(
        new Error('Profile fetch failed')
      );

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await action('testuser', 'password123');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to get user profile from API, using JWT data:',
        expect.any(Error)
      );

      const setUserCall = mockGet().actions.setUser;
      expect(setUserCall).toHaveBeenCalled();
      const userArg = setUserCall.mock.calls[0][0];
      expect(userArg.id).toBe('user-1');
      expect(userArg.username).toBe('testuser');
      expect(userArg.email).toBe('test@example.com');
      expect(userArg.roles).toEqual([]);

      consoleWarnSpy.mockRestore();
    });

    it('uses sub as userId if id is not in JWT', async () => {
      const jwtWithoutId = { ...mockJwtPayload };
      delete (jwtWithoutId as any).id;

      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(jwtWithoutId);
      (authApi.getUserProfile as jest.Mock).mockRejectedValue(
        new Error('Profile failed')
      );

      await action('testuser', 'password123');

      expect(decodeJWT).toHaveBeenCalled();
    });

    it('creates geo entity if needed (non-blocking)', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(mockJwtPayload);
      (authApi.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      await action('testuser', 'password123');

      expect(mockGet().actions.createGeoEntityIfNeeded).toHaveBeenCalled();
    });

    it('throws error when geo entity creation fails', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(mockJwtPayload);
      (authApi.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      mockGet.mockReturnValue({
        ...mockState,
        actions: {
          ...mockState.actions,
          setTokens: jest.fn(),
          setUser: jest.fn(),
          setSelectedTeam: jest.fn(),
          createGeoEntityIfNeeded: jest
            .fn()
            .mockRejectedValue(new Error('Geo entity failed')),
        },
      });

      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to create geo entity',
      });

      await expect(action('testuser', 'password123')).rejects.toEqual({
        message: 'Failed to create geo entity',
      });

      expect(handleApiError).toHaveBeenCalled();
    });

    it('initializes location monitoring after login', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(mockJwtPayload);
      (authApi.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      await action('testuser', 'password123');

      expect(mockLocationStore.actions.connectToWebSocket).toHaveBeenCalledWith(
        'access_token_123'
      );
      expect(
        mockLocationStore.actions.startLocationMonitoring
      ).toHaveBeenCalled();
    });

    it('continues login even if location monitoring fails', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(mockJwtPayload);
      (authApi.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      (
        mockLocationStore.actions.startLocationMonitoring as jest.Mock
      ).mockRejectedValue(new Error('Location failed'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await action('testuser', 'password123');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Location monitoring initialization failed, continuing with login:',
        expect.any(Error)
      );
      expect(result).toBeDefined();

      consoleWarnSpy.mockRestore();
    });

    it('updates selected tenant from profile response', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(mockJwtPayload);
      (authApi.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      await action('testuser', 'password123');

      // Check that selectedTenant was updated
      const setCalls = mockSet.mock.calls;
      const tenantUpdateCall = setCalls.find((call) => {
        const testState: AuthState = {
          ...mockState,
          tenants: [],
          selectedTenant: null,
        };
        call[0](testState);
        return testState.selectedTenant?.id === 'tenant-1';
      });
      expect(tenantUpdateCall).toBeDefined();
    });

    it('sets loading state during login', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockResolvedValue(mockTokenData);
      (decodeJWT as jest.Mock).mockReturnValue(mockJwtPayload);
      (authApi.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      await action('testuser', 'password123');

      // Check loading was set to true
      const loadingState: AuthState = { ...mockState, isLoading: false };
      const loadingCall = mockSet.mock.calls.find((call) => {
        call[0](loadingState);
        return loadingState.isLoading === true;
      });
      expect(loadingCall).toBeDefined();

      // Check loading was set to false at end
      const finalCalls = mockSet.mock.calls;
      const finalCall = finalCalls[finalCalls.length - 1];
      const finalState: AuthState = { ...mockState, isLoading: true };
      finalCall[0](finalState);
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();

    });

    it('handles login API errors', async () => {
      const apiError = new Error('Invalid credentials');
      (authApi.loginWithKeycloak as jest.Mock).mockRejectedValue(apiError);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Invalid credentials',
      });

      await expect(action('testuser', 'wrongpassword')).rejects.toEqual({
        message: 'Invalid credentials',
      });

      expect(handleApiError).toHaveBeenCalledWith(apiError);
    });

    it('sets loading to false on error', async () => {
      (authApi.loginWithKeycloak as jest.Mock).mockRejectedValue(
        new Error('Login failed')
      );
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Login failed',
      });

      try {
        await action('testuser', 'password');
      } catch (error) {
        // Expected to throw
      }

      // Check loading was set to false in error handler
      const finalCalls = mockSet.mock.calls;
      const errorCall = finalCalls[finalCalls.length - 1];
      const errorState: AuthState = { ...mockState, isLoading: true };
      errorCall[0](errorState);
      expect(errorState.isLoading).toBe(false);
    });
  });
});
