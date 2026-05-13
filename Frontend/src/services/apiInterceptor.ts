import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  // allows the browser to send the HttpOnly refresh cookie
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    //  Get Token and Role from localStorage
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY);
    const userRole = localStorage.getItem(import.meta.env.USERROLE_KEY || 'userRole-DAM');

    config.headers = config.headers ?? {};

    //  Dynamic URL Suffix Injection
    // Only prepend if a role exists and the URL doesn't already have it
    if (userRole && config.url && !config.url.startsWith(`/${userRole}`)) {
      config.url = `/${userRole}${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const errorCode = error?.response?.data?.code;
    //  Check for specific "Expired" error
    if (status === 401 && errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loops

      try {
        // Attempt to get a new Access Token
        // This call automatically includes the cookie
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data;

        //  Update LocalStorage and original request headers
        localStorage.setItem(import.meta.env.VITE_TOKEN_KEY, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        //  If Refresh fails (cookie expired), clean up and redirect
        localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other non-refreshable auth errors
    if (status === 405) {
      localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
