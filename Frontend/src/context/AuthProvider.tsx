import type { ReactNode } from 'react';
import { useReducer } from 'react';
import type { AuthState } from '../models/Types';
import { AuthContext } from './AuthContext';

type Action = { type: 'LOGIN'; payload: string } | { type: 'LOGOUT' };

// Initial token from localStorage

const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY);

// Initial authentication state
const initialState: AuthState = {
  token,
  isAuthenticated: !!token,
};

/**
 * Auth reducer
 *
 * Handles authentication state transitions:
 * - LOGIN -> stores token and sets authenticated
 * - LOGOUT -> clears token and resets auth state
 */
function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        token: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

/**
 * AuthProvider Component
 *
 * Wraps the app and provides:
 * - auth state (token, isAuthenticated)
 * - login/logout methods
 *
 * Also syncs token with localStorage.
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Child components
 *
 * @returns {JSX.Element}
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Logs in user by:
   * - saving token to localStorage
   * - updating auth state
   */
  const login = (token: string) => {
    localStorage.setItem(import.meta.env.VITE_TOKEN_KEY, token);
    dispatch({ type: 'LOGIN', payload: token });
  };

  /**
   * Logs out user by:
   * - removing token from localStorage
   * - resetting auth state
   */
  const logout = () => {
    localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  return <AuthContext.Provider value={{ state, login, logout }}>{children}</AuthContext.Provider>;
};
