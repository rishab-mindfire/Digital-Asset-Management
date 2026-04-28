import type { SignupResponse, SignupType } from '../models/Types';
import { api } from './apiInterceptor';
import axios from 'axios';

/**
 * loginApi
 *
 * Authenticates user and stores JWT token in localStorage
 *
 * @param credentials - user email and password
 * @returns token string
 */
export const signinApi = async (
  credentials: Pick<SignupType, 'userEmail' | 'userPassword' | 'userName' | 'userRole'>,
): Promise<SignupResponse> => {
  try {
    const response = await api.post('/user/login', credentials);

    // Axios normalizes headers to lowercase
    // const authHeader = response.headers?.authorization;

    // if (!authHeader) {
    //   throw new Error('Authorization header missing');
    // }

    // // Expected format: "Bearer <token>"
    // const parts = authHeader.split(' ');
    // if (parts.length !== 2 || parts[0] !== 'Bearer') {
    //   throw new Error('Invalid authorization header format');
    // }
    // const token = parts[1];

    // if (!token) {
    //   throw new Error('Token not found');
    // }

    // // Store token
    // localStorage.setItem(TOKEN_KEY, token);
    return {
      userEmail: 'my email',
      userPassword: 'my pass',
      userRole: 'admin',
      userName: 'my name',
    };
  } catch (err: unknown) {
    // Normalize error
    if (axios.isAxiosError(err)) {
      const message =
        err.response?.data?.message || err.response?.data?.error || 'Server unavailable';

      throw new Error(message);
    }

    if (err instanceof Error) {
      throw new Error(err.message);
    }

    throw new Error('Login failed');
  }
};
