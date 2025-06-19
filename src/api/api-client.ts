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

export const bftClient = axios.create({
  baseURL: 'https://bft-dev.agilres.net/api',
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

const getTimestamp = () => {
  const now = new Date();
  return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
};

const requestSuccessInterceptor = (config: any) => {
  const accessToken = useAuthStore.getState().token?.accessToken;

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
    console.log(
      `\x1b[34m${getTimestamp()} 📦 Request Body: ${JSON.stringify(config.data, undefined, 2)}\x1b[0m`
    );
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

const responseSuccessInterceptor = (response: any) => {
  // Log successful response
  console.log(
    `\x1b[32m${getTimestamp()} ✅ Response [${response.status}]: ${response.config.method?.toUpperCase()} ${response.config.url}\x1b[0m`
  );
  console.log(
    `\x1b[32m${getTimestamp()} 📦 Response Data: ${JSON.stringify(response.data, undefined, 2)}\x1b[0m`
  );
  return response;
};

const responseFailedInterceptor = (error: any) => {
  // Log error response
  console.log(
    `\x1b[31m${getTimestamp()} ❌ Error [${error.response?.status || 'No Status'}]: ${error.config?.method?.toUpperCase()} ${error.config?.url}\x1b[0m`
  );
  if (error.response?.data) {
    console.log(
      `\x1b[31m${getTimestamp()} 📦 Error Data: ${JSON.stringify(error.response.data, undefined, 2)}\x1b[0m`
    );
  }

  if (error.response?.status === 401) {
    // Handle unauthorized access
    // localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

// Add request interceptor for auth token and logging
apiClient.interceptors.request.use(requestSuccessInterceptor);
bftClient.interceptors.request.use(requestSuccessInterceptor);

// Add response interceptor for error handling and logging
apiClient.interceptors.response.use(
  responseSuccessInterceptor,
  responseFailedInterceptor
);
bftClient.interceptors.response.use(
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
