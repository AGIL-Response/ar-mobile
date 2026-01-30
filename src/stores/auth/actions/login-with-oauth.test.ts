/* eslint-disable @typescript-eslint/no-require-imports */

import type { AuthState } from '@/stores/auth';
import type * as AuthSession from 'expo-auth-session';

// Mock dependencies
const mockGetUserProfile = jest.fn();
const mockGetTeam = jest.fn();
const mockDecodeJWT = jest.fn();
const mockHandleApiError = jest.fn((e) => e);

jest.mock('@/api', () => ({
  __esModule: true,
  authApi: {
    getUserProfile: (tenantId: string, userId: string) => mockGetUserProfile(tenantId, userId),
  },
  handleApiError: (error: any) => mockHandleApiError(error),
}));

jest.mock('@/api/users', () => ({
  __esModule: true,
  getTeam: (teamId: string) => mockGetTeam(teamId),
}));

jest.mock('@/lib/utils', () => ({
  __esModule: true,
  decodeJWT: (...args: any[]) => mockDecodeJWT(...args),
}));

// Mock AuthStore actions
const mockSetTokens = jest.fn();
const mockSetUser = jest.fn();
const mockSetSelectedTeam = jest.fn();
const mockCreateGeoEntityIfNeeded = jest.fn();

// Mock LocationStore actions
const mockConnectToWebSocket = jest.fn();
const mockStartLocationMonitoring = jest.fn();

jest.mock('@/stores/location', () => ({
  __esModule: true,
  useLocationStore: {
    getState: () => ({
      actions: {
        connectToWebSocket: mockConnectToWebSocket,
        startLocationMonitoring: mockStartLocationMonitoring,
      },
    }),
  },
}));

// Helper to create mock token response
function createMockTokenResponse(
  overrides?: Partial<AuthSession.TokenResponse>
): any {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    idToken: 'mock-id-token',
    expiresIn: 3600,
    tokenType: 'bearer',
    issuedAt: Date.now() / 1000,
    scope: 'openid',
    state: undefined,
    error: undefined,
    errorCode: undefined,
    errorDescription: undefined,
    errorUri: undefined,
    params: {},
    url: 'https://mock-redirect-url.com',
    ...overrides,
  };
}

// Helper to create mock store state
function createMockStoreState(overrides?: Partial<AuthState>): AuthState {
  return {
    selectedTenant: {
      id: 'tenant-123',
      name: 'demo',
      displayName: 'Demo Tenant',
    },
    tenants: [],
    isLoading: false,
    token: {
      accessToken: undefined,
      expiresIn: undefined,
      refreshToken: undefined,
      idToken: undefined,
    },
    user: undefined,
    selectedTeam: null,
    geoEntity: undefined,
    usernameError: null,
    isCheckingUsername: false,
    actions: {
      setTokens: mockSetTokens,
      setUser: mockSetUser,
      setSelectedTeam: mockSetSelectedTeam,
      createGeoEntityIfNeeded: mockCreateGeoEntityIfNeeded,
      checkUsername: jest.fn(),
      loginWithOAuth: jest.fn(),
      loginWithPassword: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateGeoEntityLocation: jest.fn(),
      updateUser: jest.fn(),
      clearAuthError: jest.fn(),
      setSelectedTenant: jest.fn(),
    } as any,
    reset: jest.fn(),
    ...overrides,
  };
}

function loadAction() {
  jest.resetModules();
  return require('./login-with-oauth').default;
}

describe('loginWithOAuth', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let mockState: AuthState;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    mockState = createMockStoreState();
    mockSet = jest.fn((fn: (state: AuthState) => void) => {
      if (typeof fn === 'function') {
        fn(mockState);
      }
    });
    mockGet = jest.fn(() => mockState);

    // Reset all mocks
    mockGetUserProfile.mockClear();
    mockGetTeam.mockClear();
    mockDecodeJWT.mockClear();
    mockSetTokens.mockClear();
    mockSetUser.mockClear();
    mockSetSelectedTeam.mockClear();
    mockCreateGeoEntityIfNeeded.mockClear();
    mockConnectToWebSocket.mockClear();
    mockStartLocationMonitoring.mockClear();
    mockHandleApiError.mockClear();

    // Default mock implementations
    mockDecodeJWT.mockReturnValue({
      tenantId: 'tenant-123',
      id: 'user-123',
      teamIds: ['team-123'],
      preferred_username: 'jwtuser',
      email: 'jwt@example.com',
      given_name: 'Jwt',
      family_name: 'User',
    });

    mockGetUserProfile.mockResolvedValue({
      data: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        description: 'A test user',
        tenantId: 'tenant-123',
        tenantRoles: [{ name: 'admin' }],
        teamRoles: [{ teamId: 'team-123' }],
        avatarId: 'avatar-123',
        updatedAt: '2024-01-01',
        tenants: {
          id: 'tenant-123',
          name: 'demo',
          displayName: 'Demo Tenant',
        },
      },
    });

    mockGetTeam.mockResolvedValue({
      id: 'team-123',
      name: 'Test Team',
      description: 'Test Team Description',
    });

    mockCreateGeoEntityIfNeeded.mockResolvedValue(undefined);
    mockConnectToWebSocket.mockImplementation(() => {});
    mockStartLocationMonitoring.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Cases', () => {
    it('should throw error when no tenant is selected', async () => {
      mockState.selectedTenant = null;
      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await expect(loginAction(tokenResponse)).rejects.toThrow(
        'No tenant selected. Please check your username first.'
      );

      expect(mockSetTokens).not.toHaveBeenCalled();
    });

    it('should throw error when no access token is provided', async () => {
      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse({ accessToken: undefined });

      await expect(loginAction(tokenResponse)).rejects.toThrow(
        'No access token received from OAuth flow'
      );

      expect(mockSetTokens).not.toHaveBeenCalled();
    });

    it('should throw error when teamId is missing in JWT', async () => {
      mockDecodeJWT.mockReturnValueOnce({
        tenantId: 'tenant-123',
        id: 'user-123',
        teamIds: [], // No team IDs
      });

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await expect(loginAction(tokenResponse)).rejects.toThrow(
        'Failed to fetch user teams'
      );

      expect(mockGetTeam).not.toHaveBeenCalled();
    });

    it('should throw error when getTeam fails', async () => {
      mockGetTeam.mockRejectedValueOnce(new Error('Team API failed'));

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await expect(loginAction(tokenResponse)).rejects.toThrow(
        'Failed to fetch user teams'
      );

      expect(mockGetTeam).toHaveBeenCalledWith('team-123');
    });

    it('should throw error when createGeoEntityIfNeeded fails', async () => {
      mockCreateGeoEntityIfNeeded.mockRejectedValueOnce(
        new Error('Geo entity failed')
      );

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await expect(loginAction(tokenResponse)).rejects.toThrow(
        'Failed to create geo entity'
      );

      expect(mockCreateGeoEntityIfNeeded).toHaveBeenCalled();
    });
  });

  describe('Successful Login Flow', () => {
    it('should successfully complete login flow with all operations', async () => {
      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      const result = await loginAction(tokenResponse);

      // Verify tokens were set
      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        idToken: 'mock-id-token',
        expiresIn: 3600,
      });

      // Verify JWT was decoded
      expect(mockDecodeJWT).toHaveBeenCalledWith('mock-access-token');

      // Verify user profile was fetched
      expect(mockGetUserProfile).toHaveBeenCalledWith('tenant-123', 'user-123');

      // Verify user was set
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test User',
          tenantId: 'tenant-123',
          realm: 'demo',
          roles: ['admin'],
          teamRoles: [{ teamId: 'team-123' }],
        })
      );

      // Verify selected tenant was updated from profile response
      expect(mockState.selectedTenant).toEqual({
        id: 'tenant-123',
        name: 'demo',
        displayName: 'demo',
      });

      // Verify tenant was added to tenants array
      expect(mockState.tenants).toEqual([
        { id: 'tenant-123', name: 'demo', displayName: 'demo' },
      ]);

      // Verify team was fetched and set
      expect(mockGetTeam).toHaveBeenCalledWith('team-123');
      expect(mockSetSelectedTeam).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'team-123', name: 'Test Team' })
      );

      // Verify geo entity creation
      expect(mockCreateGeoEntityIfNeeded).toHaveBeenCalled();

      // Verify location monitoring
      expect(mockConnectToWebSocket).toHaveBeenCalledWith('mock-access-token');
      expect(mockStartLocationMonitoring).toHaveBeenCalled();

      // Verify loading state was set
      expect(mockSet).toHaveBeenCalled();

      // Verify result
      expect(result).toEqual({
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          idToken: 'mock-id-token',
          expiresIn: 3600,
        },
        user: expect.objectContaining({
          id: 'user-123',
          username: 'testuser',
        }),
      });
    });
  });

  describe('Fallback to JWT Data', () => {
    it('should fallback to JWT data when getUserProfile fails', async () => {
      mockGetUserProfile.mockRejectedValueOnce(new Error('API failed'));

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await loginAction(tokenResponse);

      expect(mockGetUserProfile).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-123',
          username: 'jwtuser',
          email: 'jwt@example.com',
          fullName: 'Jwt',
          description: 'User',
          tenantId: 'tenant-123',
          realm: 'demo',
          roles: [],
          permissions: [],
          teamRoles: [],
          avatarId: '',
          updatedAt: '',
        })
      );

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to get user profile from API, using JWT data:',
        expect.any(Error)
      );
    });

    it('should use sub as userId if id is missing in JWT payload', async () => {
      mockDecodeJWT.mockReturnValueOnce({
        tenantId: 'tenant-123',
        sub: 'sub-user-id',
        teamIds: ['team-123'],
      });

      mockGetUserProfile.mockResolvedValueOnce({
        data: {
          id: 'sub-user-id',
          username: 'subuser',
          tenantId: 'tenant-123',
          tenants: { id: 'tenant-123', name: 'demo' },
        },
      });

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await loginAction(tokenResponse);

      expect(mockGetUserProfile).toHaveBeenCalledWith('tenant-123', 'sub-user-id');
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'sub-user-id' })
      );
    });
  });

  describe('Tenant Management', () => {
    it('should update selected tenant and add to tenants array if not present', async () => {
      mockState.tenants = [
        { id: 'tenant-old', name: 'old', displayName: 'Old Tenant' },
      ];

      mockGetUserProfile.mockResolvedValueOnce({
        data: {
          id: 'user-123',
          username: 'testuser',
          tenantId: 'tenant-123',
          tenants: {
            id: 'tenant-123',
            name: 'new-tenant',
            displayName: 'New Tenant Display',
          },
        },
      });

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await loginAction(tokenResponse);

      expect(mockState.selectedTenant).toEqual({
        id: 'tenant-123',
        name: 'new-tenant',
        displayName: 'new-tenant',
      });

      expect(mockState.tenants).toEqual([
        { id: 'tenant-old', name: 'old', displayName: 'Old Tenant' },
        { id: 'tenant-123', name: 'new-tenant', displayName: 'new-tenant' },
      ]);
    });

    it('should update selected tenant but not add to tenants array if already present', async () => {
      mockState.tenants = [
        { id: 'tenant-123', name: 'old-name', displayName: 'Old Display' },
      ];

      mockGetUserProfile.mockResolvedValueOnce({
        data: {
          id: 'user-123',
          username: 'testuser',
          tenantId: 'tenant-123',
          tenants: {
            id: 'tenant-123',
            name: 'updated-name',
            displayName: 'Updated Display',
          },
        },
      });

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await loginAction(tokenResponse);

      expect(mockState.selectedTenant).toEqual({
        id: 'tenant-123',
        name: 'updated-name',
        displayName: 'updated-name',
      });

      // Should not add a duplicate
      expect(mockState.tenants).toEqual([
        { id: 'tenant-123', name: 'old-name', displayName: 'Old Display' },
      ]);
    });
  });

  describe('Location Monitoring', () => {
    it('should continue login if location monitoring initialization fails', async () => {
      mockStartLocationMonitoring.mockRejectedValueOnce(
        new Error('Location failed')
      );

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await loginAction(tokenResponse);

      expect(mockConnectToWebSocket).toHaveBeenCalledWith('mock-access-token');
      expect(mockStartLocationMonitoring).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'Location monitoring initialization failed, continuing with login:',
        expect.any(Error)
      );
      expect(mockState.isLoading).toBe(false);
    });

    it('should initialize location monitoring with access token', async () => {
      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse({
        accessToken: 'custom-access-token',
      });

      await loginAction(tokenResponse);

      expect(mockConnectToWebSocket).toHaveBeenCalledWith('custom-access-token');
      expect(mockStartLocationMonitoring).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should reset loading state even when error occurs', async () => {
      mockGetTeam.mockRejectedValueOnce(new Error('Team fetch failed'));

      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await expect(loginAction(tokenResponse)).rejects.toThrow();

      expect(mockState.isLoading).toBe(false);
    });
  });

  describe('Token Handling', () => {
    it('should handle token response with all fields', async () => {
      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse({
        accessToken: 'custom-access',
        refreshToken: 'custom-refresh',
        idToken: 'custom-id',
        expiresIn: 7200,
      });

      await loginAction(tokenResponse);

      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: 'custom-access',
        refreshToken: 'custom-refresh',
        idToken: 'custom-id',
        expiresIn: 7200,
      });
    });

    it('should handle missing optional tokens', async () => {
      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse({
        refreshToken: undefined,
        idToken: undefined,
      });

      await loginAction(tokenResponse);

      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: 'mock-access-token',
        refreshToken: '',
        idToken: '',
        expiresIn: 3600,
      });
    });

    it('should use default expiresIn when not provided', async () => {
      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse({
        expiresIn: undefined,
      });

      await loginAction(tokenResponse);

      expect(mockSetTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresIn: 3600,
        })
      );
    });
  });

  describe('Console Logging', () => {
    it('should log success messages during login flow', async () => {
      const action = loadAction();
      const loginAction = action(mockSet, mockGet);
      const tokenResponse = createMockTokenResponse();

      await loginAction(tokenResponse);

      expect(console.log).toHaveBeenCalledWith(
        'Processing OAuth tokens for realm:',
        'demo'
      );
      expect(console.log).toHaveBeenCalledWith('Getting user profile...');
      expect(console.log).toHaveBeenCalledWith('Fetching user team...');
      expect(console.log).toHaveBeenCalledWith(
        'User team fetched successfully:',
        'Test Team'
      );
      expect(console.log).toHaveBeenCalledWith('OAuth login completed successfully');
    });
  });
});

