import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { requestQueue } from './request-queue';

const apiHost = Constants.expoConfig?.extra?.env?.API_HOST;

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: `${apiHost}/api/be`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

export const mediaApiClient = axios.create({
  baseURL: `${apiHost}/api/media`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

export const chatApiClient = axios.create({
  baseURL: `${apiHost}/api/chat`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

/**
 * Lazy getter for auth store to avoid circular dependency
 */
function getAuthStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/stores/auth').default;
}

/**
 * Lazy getter for auth API to avoid circular dependency
 */
function getAuthApi() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./auth').authApi;
}

const getTimestamp = () => {
  const now = new Date();
  return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
};

const requestSuccessInterceptor = (config: any) => {
  const authStore = getAuthStore();
  const accessToken = authStore.getState().token?.accessToken;

  // Log request details
  console.log(
    `\x1b[34m${getTimestamp()} 🚀 Request: ${config.method?.toUpperCase()} ${config.url}\x1b[0m`
  );
  if (config.params) {
    console.log(
      `\x1b[34m${getTimestamp()} 📝 Request Params: ${JSON.stringify(config.params, undefined, 2)}\x1b[0m`
    );
  }
  if (config.data) {
    // Don't try to JSON.stringify FormData or Uint8Array
    if (config.data instanceof FormData) {
      console.log(
        `\x1b[34m${getTimestamp()} 📦 Request Body: [FormData]\x1b[0m`
      );
    } else if (config.data instanceof Uint8Array) {
      console.log(
        `\x1b[34m${getTimestamp()} 📦 Request Body: [Binary Data, ${config.data.length} bytes]\x1b[0m`
      );
    } else {
      console.log(
        `\x1b[34m${getTimestamp()} 📦 Request Body: ${JSON.stringify(config.data, undefined, 2)}\x1b[0m`
      );
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // If FormData is being sent, remove Content-Type header to let axios set it automatically
  // with the correct multipart/form-data boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  // For Uint8Array (raw binary), keep the Content-Type header as set in the request
  // Don't override it with the default 'application/json'

  return config;
};

const responseSuccessInterceptor = (response: any) => {

  return response;
};

/**
 * Handle token refresh and retry failed request
 */
const handleTokenRefresh = async (
  originalRequest: InternalAxiosRequestConfig
): Promise<any> => {
  const authStore = getAuthStore();
  const authApi = getAuthApi();
  const state = authStore.getState();

  // Check if request has already been retried
  const retryCount = (originalRequest as any).__retryCount || 0;
  if (retryCount >= 1) {
    // Already retried once, reject
    console.log(
      `\x1b[31m${getTimestamp()} ❌ Request already retried, rejecting: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}\x1b[0m`
    );
    return Promise.reject(
      new Error('Request failed after token refresh retry')
    );
  }

  // Check if refresh token exists
  if (!state.token?.refreshToken || !state.user?.realm) {
    console.log(
      `\x1b[31m${getTimestamp()} ❌ No refresh token available, logging out\x1b[0m`
    );
    if (state.actions.logout) {
      state.actions.logout();
    }
    return Promise.reject(new Error('No refresh token available'));
  }

  // If refresh is already in progress, queue this request
  if (requestQueue.isRefreshInProgress()) {
    console.log(
      `\x1b[33m${getTimestamp()} ⏳ Token refresh in progress, queuing request: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}\x1b[0m`
    );
    return new Promise((resolve, reject) => {
      requestQueue.enqueue({
        resolve,
        reject,
        config: originalRequest,
      });
    });
  }

  // Start token refresh
  requestQueue.setRefreshing(true);
  console.log(
    `\x1b[33m${getTimestamp()} 🔄 Refreshing access token...\x1b[0m`
  );

  try {
    const tokenData = await authApi.refreshToken(
      state.token.refreshToken,
      state.user.realm
    );

    // Update tokens in store
    const tokens = {
      accessToken: tokenData.access_token || '',
      refreshToken: tokenData.refresh_token || state.token.refreshToken || '',
      idToken: tokenData.id_token || state.token.idToken || '',
      expiresIn: tokenData.expires_in || state.token.expiresIn || 3600,
    };

    state.actions.setTokens(tokens);

    console.log(
      `\x1b[32m${getTimestamp()} ✅ Token refreshed successfully\x1b[0m`
    );

    // Get queued requests and retry them
    const queuedRequests = requestQueue.getQueuedRequests();
    
    // Retry the original request
    const originalRetry = retryRequest(originalRequest);
    
    // Retry all queued requests - resolve their promises with the retry promise
    queuedRequests.forEach((queued) => {
      const retried = retryRequest(queued.config);
      // Resolve with the retry promise so the caller can await it
      queued.resolve(retried);
    });

    // Wait for original request retry
    return originalRetry;
  } catch (refreshError) {
    console.log(
      `\x1b[31m${getTimestamp()} ❌ Token refresh failed: ${refreshError}\x1b[0m`
    );

    // Process queued requests with error
    const queuedRequests = requestQueue.getQueuedRequests();
    queuedRequests.forEach((queued) => {
      queued.reject(refreshError);
    });

    // Logout on refresh failure
    if (state.actions.logout) {
      state.actions.logout();
    }

    return Promise.reject(refreshError);
  } finally {
    requestQueue.setRefreshing(false);
    requestQueue.setRefreshPromise(null);
  }
};

/**
 * Retry a request with updated token
 */
const retryRequest = async (
  config: InternalAxiosRequestConfig
): Promise<any> => {
  const authStore = getAuthStore();
  const accessToken = authStore.getState().token?.accessToken;

  // Mark request as retried
  (config as any).__retryCount = ((config as any).__retryCount || 0) + 1;

  // Update authorization header
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  console.log(
    `\x1b[33m${getTimestamp()} 🔁 Retrying request: ${config.method?.toUpperCase()} ${config.url}\x1b[0m`
  );

  // Retry the request
  return axios(config);
};

const responseFailedInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig;

  // Log error response
  if (error.response?.data) {
    console.log(
      `\x1b[31m${getTimestamp()} ❌ Error [${error.response?.status || 'No Status'}]: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}\x1b[0m`
    );
    console.log(
      `\x1b[31m${getTimestamp()} 📦 Error Data: ${JSON.stringify(error.response.data, undefined, 2)}\x1b[0m`
    );
  }

  // Handle 401 Unauthorized - attempt token refresh
  if (error.response?.status === 401 && originalRequest) {
    // Skip refresh for auth endpoints (login, refresh token itself)
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth') ||
      originalRequest.url?.includes('/token');

    if (isAuthEndpoint) {
      // For auth endpoints, just logout
      const authStore = getAuthStore();
      const storeState = authStore.getState();
      if (storeState.actions.logout) {
        storeState.actions.logout();
      }
      return Promise.reject(error);
    }

    // Attempt token refresh and retry
    try {
      return await handleTokenRefresh(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

// Add request interceptor for auth token and logging
apiClient.interceptors.request.use(requestSuccessInterceptor);
mediaApiClient.interceptors.request.use(requestSuccessInterceptor);
chatApiClient.interceptors.request.use(requestSuccessInterceptor);

// Add response interceptor for error handling and logging
apiClient.interceptors.response.use(
  responseSuccessInterceptor,
  responseFailedInterceptor
);
mediaApiClient.interceptors.response.use(
  responseSuccessInterceptor,
  responseFailedInterceptor
);
chatApiClient.interceptors.response.use(
  responseSuccessInterceptor,
  responseFailedInterceptor
);
// API response type
export type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// API error type
export type ApiError = {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
};

export const API_CODE = {
  OK: 200,
};

// Helper function to handle API errors
export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };
  }
  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}
