import type { SigninAction, SignupType } from '../models/Types';

/**
 * Initial state for sigup form
 */
export const initialSignInState: SignupType = {
  userName: 'name',
  userEmail: '',
  userPassword: '',
  userRole: 'public',
  loading: false,
  errors: {},
};

/**
 * sigupReducer
 *
 * Handles sigup form state:
 * - Field updates (email/password)
 * - Loading state during API calls
 * - Validation errors
 * - Resetting form
 *
 * @param state - Current sigup state
 * @param action - Action describing state change
 */

export function sigupReducer(state: SignupType, action: SigninAction): SignupType {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,

        // Dynamically update fields
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
        ...initialSignInState,
      };

    default:
      return state;
  }
}
