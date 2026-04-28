import type { SignupType } from '../models/Types';
import { api } from './apiInterceptor';
import axios from 'axios';

/**
 * loginApi
 *
 * Authenticates user and stores JWT token in localStorage
 *
 * @param payload - user email and password
 * @returns token string
 */
export const signupApi = async (
  payload: Pick<SignupType, 'userEmail' | 'userPassword' | 'userName' | 'userRole'>,
): Promise<string | undefined> => {
  try {
    const response = await api.post('/user/register', payload);
    if (response.status === 201) {
      return response.data;
    }
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
