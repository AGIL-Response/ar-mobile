import axios from 'axios';

// eslint-disable-next-line import/no-cycle
import useAuthStore from '@/stores/auth';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: 'https://web-base-dev.agilres.net/api',
  headers: {
    'X-API-Key':
      'GNUj1mZYuKKIWMSONR0VCzNbwJPnCaj1EZVPbSP7RC6VcWtiPIE3CzToBCTRgCMU',
    'X-Mobile-App':
      'dy5K225i3j2PIfjNW5bK1BsyCjLUb0fM9mq1i2RqNbWrx662PEFSzVEhIFHrqaaq',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Add request interceptor for auth token and logging
apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().token?.accessToken;

  // Log request details
  console.log(
    `\x1b[34m🚀 Request: ${config.method?.toUpperCase()} ${config.url}\x1b[0m`
  );
  if (config.params) {
    console.log(
      `\x1b[34m📝 Request Params: ${JSON.stringify(config.params, undefined, 2)}\x1b[0m`
    );
  }
  if (config.data) {
    console.log(
      `\x1b[34m📦 Request Body: ${JSON.stringify(config.data, undefined, 2)}\x1b[0m`
    );
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Add response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(
      `\x1b[32m✅ Response [${response.status}]: ${response.config.method?.toUpperCase()} ${response.config.url}\x1b[0m`
    );
    console.log(
      `\x1b[32m📦 Response Data: ${JSON.stringify(response.data, undefined, 2)}\x1b[0m`
    );
    return response;
  },
  (error) => {
    // Log error response
    console.log(
      `\x1b[31m❌ Error [${error.response?.status || 'No Status'}]: ${error.config?.method?.toUpperCase()} ${error.config?.url}\x1b[0m`
    );
    if (error.response?.data) {
      console.log(
        `\x1b[31m📦 Error Data: ${JSON.stringify(error.response.data, undefined, 2)}\x1b[0m`
      );
    }

    if (error.response?.status === 401) {
      // Handle unauthorized access
      // localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
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
