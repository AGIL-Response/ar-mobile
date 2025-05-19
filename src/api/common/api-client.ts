import axios from 'axios';

// eslint-disable-next-line import/no-cycle
import useAuthStore from "@/stores/auth";

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

// Add request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().token?.accessToken;
  console.log(
    `\x1b[34m🐣️ api-client accessToken`,
    `${JSON.stringify(accessToken, undefined, 2)}\x1b[0m`,
  );
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
