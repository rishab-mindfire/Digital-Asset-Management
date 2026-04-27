import { createContext } from 'react';
import type { AuthContextType } from '../models/Types';

/**
 * AuthContext
 *
 * Provides authentication state and actions (login/logout)
 * across the application.
 *
 * Default value is undefined to enforce usage within AuthProvider.
 *
 * @example
 * const { state, login, logout } = useAuth();
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
