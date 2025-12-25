import axios from 'axios';

// Unmock api-client for this test file since we're testing the actual implementation
jest.unmock('./api-client');

import { API_CODE, apiClient, handleApiError } from './api-client';

const useAuthStoreModule = require('@/stores/auth');
const useAuthStore = useAuthStoreModule.default;

describe('api-client', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
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

      await expect(interceptor.rejected(error)).rejects.toEqual(error);
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
});
