import { authApi } from './index';
import { apiClient, handleApiError } from '../api-client';

// Mock dependencies
jest.mock('../api-client');
jest.mock('@/stores/auth');

// Mock fetch globally
global.fetch = jest.fn();

jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(console, 'log').mockImplementation();

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('successfully registers a user', async () => {
      const registerData = {
        action: 'register',
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'User registered successfully',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith('auth', registerData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles registration errors', async () => {
      const registerData = {
        action: 'register',
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      };

      const error = new Error('Registration failed');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Registration failed',
        status: 400,
      });

      await expect(authApi.register(registerData)).rejects.toEqual({
        message: 'Registration failed',
        status: 400,
      });

      expect(handleApiError).toHaveBeenCalledWith(error);
    });
  });

  describe('getTenantsByUsername', () => {
    it('returns first tenant when tenants exist', async () => {
      const username = 'testuser';
      const mockTenant = { id: 'tenant-1', name: 'Tenant 1' };

      const mockResponse = {
        data: {
          data: [mockTenant],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getTenantsByUsername(username);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/auth/username/testuser/tenants'
      );
      expect(result).toEqual(mockTenant);
    });

    it('returns null when no tenants exist', async () => {
      const username = 'testuser';

      const mockResponse = {
        data: {
          data: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getTenantsByUsername(username);

      expect(result).toBeNull();
    });

    it('handles errors', async () => {
      const username = 'testuser';
      const error = new Error('Failed to get tenants');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get tenants',
        status: 500,
      });

      await expect(authApi.getTenantsByUsername(username)).rejects.toEqual({
        message: 'Failed to get tenants',
        status: 500,
      });
    });

    it('encodes username in URL', async () => {
      const username = 'user@example.com';
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: [] },
      });

      await authApi.getTenantsByUsername(username);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/auth/username/user%40example.com/tenants'
      );
    });
  });

  describe('getAllTenantsByUsername', () => {
    it('returns all tenants', async () => {
      const username = 'testuser';
      const mockTenants = [
        { id: 'tenant-1', name: 'Tenant 1' },
        { id: 'tenant-2', name: 'Tenant 2' },
      ];

      const mockResponse = {
        data: {
          data: mockTenants,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getAllTenantsByUsername(username);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/auth/username/testuser/tenants'
      );
      expect(result).toEqual(mockTenants);
    });

    it('returns empty array when no tenants exist', async () => {
      const username = 'testuser';

      const mockResponse = {
        data: {},
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getAllTenantsByUsername(username);

      expect(result).toEqual([]);
    });

    it('handles errors', async () => {
      const username = 'testuser';
      const error = new Error('Failed to get tenants');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get tenants',
        status: 500,
      });

      await expect(authApi.getAllTenantsByUsername(username)).rejects.toEqual({
        message: 'Failed to get tenants',
        status: 500,
      });
    });
  });

  describe('loginWithKeycloak', () => {
    it('successfully logs in with Keycloak', async () => {
      const username = 'testuser';
      const password = 'password123';
      const realm = 'test-realm';

      const mockTokenData = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenData),
      });

      const result = await authApi.loginWithKeycloak(username, password, realm);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://dev-auth.agilres.net/realms/test-realm/protocol/openid-connect/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.stringContaining('grant_type=password'),
        })
      );
      expect(result).toEqual(mockTokenData);
    });

    it('handles 401 unauthorized error', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const realm = 'test-realm';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      });

      await expect(
        authApi.loginWithKeycloak(username, password, realm)
      ).rejects.toThrow('Invalid username or password');
    });

    it('handles 400 bad request error', async () => {
      const username = 'testuser';
      const password = 'password';
      const realm = 'test-realm';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      });

      await expect(
        authApi.loginWithKeycloak(username, password, realm)
      ).rejects.toThrow('Invalid request. Please try again.');
    });

    it('handles other HTTP errors', async () => {
      const username = 'testuser';
      const password = 'password';
      const realm = 'test-realm';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server Error'),
      });

      await expect(
        authApi.loginWithKeycloak(username, password, realm)
      ).rejects.toThrow('Authentication failed (500)');
    });

    it('handles fetch errors', async () => {
      const username = 'testuser';
      const password = 'password';
      const realm = 'test-realm';

      const fetchError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(fetchError);

      await expect(
        authApi.loginWithKeycloak(username, password, realm)
      ).rejects.toThrow('Network error');
    });

    it('handles non-Error rejections', async () => {
      const username = 'testuser';
      const password = 'password';
      const realm = 'test-realm';

      (global.fetch as jest.Mock).mockRejectedValue('String error');
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'An error occurred',
        status: 500,
      });

      await expect(
        authApi.loginWithKeycloak(username, password, realm)
      ).rejects.toEqual({
        message: 'An error occurred',
        status: 500,
      });
    });
  });

  describe('getUserProfile', () => {
    it('successfully gets user profile', async () => {
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      const mockProfile = {
        data: {
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      const mockResponse = {
        data: mockProfile,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getUserProfile(tenantId, userId);

      expect(apiClient.get).toHaveBeenCalledWith('/users/user-1');
      expect(result).toEqual(mockProfile);
    });

    it('handles errors', async () => {
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      const error = new Error('Failed to get profile');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get profile',
        status: 404,
      });

      await expect(authApi.getUserProfile(tenantId, userId)).rejects.toEqual({
        message: 'Failed to get profile',
        status: 404,
      });
    });
  });

  describe('login (legacy)', () => {
    it('successfully logs in', async () => {
      const loginData = {
        action: 'login' as const,
        username: 'testuser',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          token: 'token-123',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.login(loginData);

      expect(apiClient.post).toHaveBeenCalledWith('auth', loginData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles login errors', async () => {
      const loginData = {
        action: 'login' as const,
        username: 'testuser',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Invalid credentials',
        status: 401,
      });

      await expect(authApi.login(loginData)).rejects.toEqual({
        message: 'Invalid credentials',
        status: 401,
      });
    });
  });
});

