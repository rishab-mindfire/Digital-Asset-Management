import axios from 'axios';

/**
 * Axios instance configuration
 *
 * - Sets base URL from environment
 * - Attaches auth token automatically
 * - Handles JSON vs FormData requests
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

/**
 * Request Interceptor
 *
 * - Adds Authorization header if token exists
 * - Sets Content-Type for non-FormData requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY);

    // Ensure headers object exists
    config.headers = config.headers ?? {};

    // Attach token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set JSON content type only when not sending FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor
 *
 * - Handles global API errors
 * - Example: auto logout on 401 or 405 invalid/expired
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Handle unauthorized (token  invalid/expired)
    if (status === 401 || status === 405) {
      localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);

      // redirect to login
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
