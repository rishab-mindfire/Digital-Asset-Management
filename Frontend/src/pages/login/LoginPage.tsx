import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';
import type { LoginErrors } from '../../models/Types';
import logoImage from '../../assets/logo.png';
import backgroundImage from '../../assets/GlassEffect.webp';
import { initialLoginState, loginReducer } from '../../reducers/loginReducer';
import { loginApi } from '../../services/login.service';

/**
 * Login Component
 *
 * Handles user authentication by:
 * - Managing form state via reducer
 * - Performing client-side validation
 * - Calling login API
 * - Storing auth token via context
 *
 * Features:
 * - Field-level validation
 * - API error handling
 * - Loading state handling
 *
 * @component
 *
 * @returns {JSX.Element} Login form UI
 *
 * @example
 * <Login />
 */
export default function Login() {
  const [formState, dispatch] = useReducer(loginReducer, initialLoginState);
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles login form submission.
   *
   * - Validates input fields
   * - Calls login API
   * - Stores token on success
   * - Displays error messages on failure
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: LoginErrors = {};

    // Validation
    if (!formState.userEmail) {
      newErrors.userEmail = 'Email is required';
    }

    if (!formState.userPassword) {
      newErrors.userPassword = 'Password is required';
    } else if (formState.userPassword.length < 5) {
      newErrors.userPassword = 'Password must be at least 5 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: newErrors });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const token = await loginApi({
        userEmail: formState.userEmail,
        userPassword: formState.userPassword,
      });

      login(token);
      navigate('/dashboard');
    } catch (error: unknown) {
      let message = 'Login failed';

      if (error instanceof AxiosError) {
        message = error.response?.data?.details || error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      dispatch({
        type: 'SET_ERRORS',
        payload: { general: message },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className={styles.loginContainer}>
      <img src={backgroundImage} alt="" className={styles.backgroundImage} aria-hidden="true" />

      <form onSubmit={handleSubmit} className={styles.loginForm} aria-labelledby="login-title">
        <div className={styles.logoSection}>
          <img src={logoImage} alt="Company Name Logo" className={styles.logoImage} />
          <h2 id="login-title" className={styles.title}>
            Login
          </h2>
        </div>

        {/* EMAIL */}
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            aria-label="Email Address"
            aria-describedby={formState.errors.userEmail ? 'email-error' : undefined}
            aria-invalid={!!formState.errors.userEmail}
            value={formState.userEmail}
            className={`${styles.input} ${formState.errors.userEmail ? styles.inputError : ''}`}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'userEmail',
                value: e.target.value,
              })
            }
          />

          {formState.errors.userEmail && (
            <span className={styles.fieldError} id="email-error" role="alert" aria-live="assertive">
              {formState.errors.userEmail}
            </span>
          )}
        </div>

        {/* PASSWORD */}
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={formState.userPassword}
            aria-describedby={formState.errors.userPassword ? 'password-error' : undefined}
            aria-invalid={!!formState.errors.userPassword}
            className={`${styles.input} ${formState.errors.userPassword ? styles.inputError : ''}`}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'userPassword',
                value: e.target.value,
              })
            }
          />

          {formState.errors.userPassword && (
            <span
              className={styles.fieldError}
              id="password-error"
              role="alert"
              aria-live="assertive"
            >
              {formState.errors.userPassword}
            </span>
          )}
        </div>

        {/* GENERAL ERROR */}
        {formState.errors.general && (
          <p className={styles.error} role="alert" aria-live="assertive">
            {formState.errors.general}
          </p>
        )}

        {/* BUTTON & LOADING STATUS */}
        <button
          disabled={formState.loading}
          className={styles.button}
          aria-busy={formState.loading}
          aria-label={formState.loading ? 'Logging in' : 'Login to your account'}
        >
          {formState.loading ? (
            <span role="status" aria-live="polite">
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>

        <div className={styles.redirect}>
          <p>
            Don’t have an account?{' '}
            <span
              className={styles.link}
              onClick={() => navigate('/signup')}
              role="button"
              tabIndex={0}
              aria-label="Go to signup page"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/signup')}
            >
              Sign up
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}
