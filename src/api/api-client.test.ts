import axios from 'axios';

import { API_CODE, apiClient, handleApiError } from './api-client';
import { requestQueue } from './request-queue';

// Unmock api-client for this test file since we're testing the actual implementation
jest.unmock('./api-client');

const useAuthStoreModule = require('@/stores/auth');
const useAuthStore = useAuthStoreModule.default;

describe('api-client', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('apiClient configuration', () => {
    it('creates axios instance with correct base config', () => {
      expect(apiClient.defaults.baseURL).toBe('https://dev.agilres.net/api/be');
      expect(apiClient.defaults.headers['Content-Type']).toBe(
        'application/json'
      );
      expect(apiClient.defaults.headers.Accept).toBe('application/json');
      expect(apiClient.defaults.withCredentials).toBe(false);
    });
  });

  describe('request interceptor', () => {
    it('adds Authorization header when access token exists', async () => {
      const mockAccessToken = 'test-access-token';
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: { accessToken: mockAccessToken },
      });

      const config = {
        url: '/test',
        method: 'get',
        headers: {},
      };

      const interceptor = (apiClient.interceptors.request as any).handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockAccessToken}`);
    });

    it('does not add Authorization header when access token is missing', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: { accessToken: undefined },
      });

      const config = {
        url: '/test',
        method: 'get',
        headers: {},
      };

      const interceptor = (apiClient.interceptors.request as any).handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('logs request details', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: { accessToken: undefined },
      });

      const consoleLogSpy = jest.spyOn(console, 'log');

      const config = {
        url: '/test',
        method: 'get',
        headers: {},
        params: { page: 1 },
        data: { name: 'test' },
      };

      const interceptor = (apiClient.interceptors.request as any).handlers[0];
      await interceptor.fulfilled(config);

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('error interceptor', () => {
    it('logs error response', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      const logoutSpy = jest.fn();

      (useAuthStore.getState as jest.Mock).mockReturnValue({
        actions: { logout: logoutSpy },
      });

      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
        config: {
          method: 'get',
          url: '/test',
        },
      };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('calls logout on 401 error', async () => {
      const logoutSpy = jest.fn();
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: null,
        user: { realm: 'test-realm' },
        actions: { logout: logoutSpy },
      });

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'get',
          url: '/test',
        },
      };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      await expect(interceptor.rejected(error)).rejects.toThrow('No refresh token available');
      expect(logoutSpy).toHaveBeenCalled();
    });
  });

  describe('handleApiError', () => {
    it('handles axios errors with response', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Bad request',
            errors: { field: ['Error message'] },
          },
        },
      };

      // Mock axios.isAxiosError
      const isAxiosErrorSpy = jest
        .spyOn(axios, 'isAxiosError')
        .mockReturnValue(true);

      const result = handleApiError(error as unknown);

      expect(result).toEqual({
        message: 'Bad request',
        status: 400,
        errors: { field: ['Error message'] },
      });

      isAxiosErrorSpy.mockRestore();
    });

    it('handles axios errors without response data message', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
        },
      };

      const isAxiosErrorSpy = jest
        .spyOn(axios, 'isAxiosError')
        .mockReturnValue(true);

      const result = handleApiError(error as unknown);

      expect(result).toEqual({
        message: 'An error occurred',
        status: 500,
      });

      isAxiosErrorSpy.mockRestore();
    });

    it('handles axios errors without response', () => {
      const error = {
        isAxiosError: true,
      };

      const isAxiosErrorSpy = jest
        .spyOn(axios, 'isAxiosError')
        .mockReturnValue(true);

      const result = handleApiError(error as unknown);

      expect(result).toEqual({
        message: 'An error occurred',
        status: 500,
      });

      isAxiosErrorSpy.mockRestore();
    });

    it('handles non-axios errors', () => {
      const error = new Error('Unexpected error');

      const isAxiosErrorSpy = jest
        .spyOn(axios, 'isAxiosError')
        .mockReturnValue(false);

      const result = handleApiError(error);

      expect(result).toEqual({
        message: 'An unexpected error occurred',
        status: 500,
      });

      isAxiosErrorSpy.mockRestore();
    });
  });

  describe('API_CODE', () => {
    it('exports OK constant', () => {
      expect(API_CODE.OK).toBe(200);
    });
  });

  describe('token refresh and request queue', () => {
    let mockAuthApi: any;
    let setTokensSpy: jest.Mock;
    let logoutSpy: jest.Mock;

    beforeEach(() => {
      requestQueue.clear();
      requestQueue.setRefreshing(false);
      requestQueue.setRefreshPromise(null);

      mockAuthApi = {
        refreshToken: jest.fn(),
      };

      setTokensSpy = jest.fn();
      logoutSpy = jest.fn();

      (useAuthStore.getState as jest.Mock).mockReturnValue({
        token: {
          accessToken: 'old-access-token',
          refreshToken: 'test-refresh-token',
          idToken: 'test-id-token',
          expiresIn: 3600,
        },
        user: { realm: 'test-realm' },
        actions: {
          setTokens: setTokensSpy,
          logout: logoutSpy,
        },
      });

      // Mock the auth API module
      jest.mock('./auth', () => ({
        authApi: mockAuthApi,
      }));
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('refreshes token on 401 error', async () => {
      const newAccessToken = 'new-access-token';
      
      mockAuthApi.refreshToken.mockResolvedValue({
        access_token: newAccessToken,
        refresh_token: 'new-refresh-token',
        id_token: 'new-id-token',
        expires_in: 3600,
      });

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'get',
          url: '/api/protected',
          headers: {},
        },
      };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      await expect(interceptor.rejected(error)).rejects.toThrow();

      expect(mockAuthApi.refreshToken).toHaveBeenCalledWith(
        'test-refresh-token',
        'test-realm'
      );

      expect(setTokensSpy).toHaveBeenCalledWith({
        accessToken: newAccessToken,
        refreshToken: 'new-refresh-token',
        idToken: 'new-id-token',
        expiresIn: 3600,
      });
    });

    it('queues requests when token refresh is in progress', async () => {
      requestQueue.setRefreshing(true);

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'get',
          url: '/api/protected',
          headers: {},
        },
      };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      const resultPromise = interceptor.rejected(error);

      expect(requestQueue.length()).toBe(1);

      requestQueue.setRefreshing(false);
      const queuedRequests = requestQueue.getQueuedRequests();
      expect(queuedRequests).toHaveLength(1);

      const mockResponse = { data: { success: true } };
      queuedRequests[0].resolve(mockResponse);

      await expect(resultPromise).resolves.toEqual(mockResponse);
    });

    it('queues requests when refresh is already in progress', async () => {
      requestQueue.setRefreshing(true);

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'get',
          url: '/api/users/1',
          headers: {},
        },
      };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      const rejectedPromise = interceptor.rejected(error);

      expect(requestQueue.length()).toBe(1);

      expect(mockAuthApi.refreshToken).not.toHaveBeenCalled();

      requestQueue.setRefreshing(false);
      
      const queued = requestQueue.getQueuedRequests();
      expect(queued).toHaveLength(1);
      expect(queued[0].config.url).toBe('/api/users/1');
      
      queued[0].reject(new Error('Test completed'));
      
      await expect(rejectedPromise).rejects.toThrow('Test completed');
    });

    it('skips refresh for auth endpoints and logs out', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'post',
          url: '/auth/login',
          headers: {},
        },
      };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      await expect(interceptor.rejected(error)).rejects.toEqual(error);

      expect(mockAuthApi.refreshToken).not.toHaveBeenCalled();

      expect(logoutSpy).toHaveBeenCalled();
    });

    it('rejects request that has already been retried once', async () => {
      const newAccessToken = 'new-access-token';

      mockAuthApi.refreshToken.mockResolvedValue({
        access_token: newAccessToken,
        refresh_token: 'new-refresh-token',
        id_token: 'new-id-token',
        expires_in: 3600,
      });

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'get',
          url: '/api/protected',
          headers: {},
          __retryCount: 1,
        },
      };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      await expect(interceptor.rejected(error)).rejects.toThrow(
        'Request failed after token refresh retry'
      );

      expect(mockAuthApi.refreshToken).not.toHaveBeenCalled();
    });
    
    it('handles multiple concurrent 401 errors correctly', async () => {
      const newAccessToken = 'new-access-token';

      mockAuthApi.refreshToken.mockResolvedValue({
        access_token: newAccessToken,
        refresh_token: 'new-refresh-token',
        id_token: 'new-id-token',
        expires_in: 3600,
      });

      requestQueue.setRefreshing(true);

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      const error1 = {
        response: { status: 401, data: { message: 'Unauthorized' } },
        config: { method: 'get', url: '/api/users/1', headers: {} },
      };
      const error2 = {
        response: { status: 401, data: { message: 'Unauthorized' } },
        config: { method: 'get', url: '/api/users/2', headers: {} },
      };
      const error3 = {
        response: { status: 401, data: { message: 'Unauthorized' } },
        config: { method: 'get', url: '/api/users/3', headers: {} },
      };

      const promise1 = interceptor.rejected(error1);
      const promise2 = interceptor.rejected(error2);
      const promise3 = interceptor.rejected(error3);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(requestQueue.length()).toBe(3);

      expect(mockAuthApi.refreshToken).not.toHaveBeenCalled();

      const queuedRequests = requestQueue.getQueuedRequests();
      expect(queuedRequests).toHaveLength(3);
      
      queuedRequests.forEach(req => req.reject(new Error('Test: Queue processed')));

      requestQueue.setRefreshing(false);

      const results = await Promise.allSettled([promise1, promise2, promise3]);

      results.forEach(result => {
        expect(result.status).toBe('rejected');
      });

      expect(requestQueue.length()).toBe(0);
    });
  });
});
