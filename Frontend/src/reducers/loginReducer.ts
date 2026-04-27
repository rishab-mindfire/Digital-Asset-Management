import type { LoginAction, LoginType } from '../models/Types';

/**
 * Initial state for login form
 */
export const initialLoginState: LoginType = {
  userEmail: '',
  userPassword: '',
  loading: false,
  errors: {},
};

/**
 * loginReducer
 *
 * Handles login form state:
 * - Field updates (email/password)
 * - Loading state during API calls
 * - Validation errors
 * - Resetting form
 *
 * @param state - Current login state
 * @param action - Action describing state change
 */

export function loginReducer(state: LoginType, action: LoginAction): LoginType {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,

        // Dynamically update field (email or password)
        [action.field]: action.value,

        // Clear error for that specific field
        errors: {
          ...state.errors,
          [action.field]: '',
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };

    case 'RESET':
      return {
        ...initialLoginState,
      };

    default:
      return state;
  }
}
