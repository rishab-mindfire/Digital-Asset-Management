// AUTH TYPES
export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};
// Auth context shape used across the app.
export type AuthContextType = {
  state: AuthState;

  /**
   * Logs in the user by storing token
   * @param token - JWT token received from backend
   */
  login: (token: string) => void;

  // Logs out the user and clears session
  logout: () => void;
};

// LOGIN TYPES
// Represents validation errors for login form.
export interface Errors {
  userEmail?: string;
  userPassword?: string;
  general?: string;
}

// Login form state.
export interface LoginType {
  userEmail: string;
  userPassword: string;
  loading: boolean;
  errors: Errors;
}
//signUp
export interface SignupType {
  userEmail: string;
  userPassword: string;
  role: string;
  userName: string;
}

// Actions supported by login reducer.
export type LoginAction =
  | { type: 'SET_FIELD'; field: keyof LoginType; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Errors }
  | { type: 'RESET' };

// Login API response.
export type LoginResponse = {
  token: string;
};
