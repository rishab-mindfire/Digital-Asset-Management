import { useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import styles from './Login.module.css';
import type { Errors } from '../../models/Types';
import { initialLoginState, loginReducer } from '../../reducers/loginReducer';
import { signupApi } from '../../services/loginService';
import logoImage from '../../assets/logo.png';

export default function Signup() {
  const [formState, dispatch] = useReducer(loginReducer, initialLoginState);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Errors = {};

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
      await signupApi({
        userEmail: formState.userEmail,
        userPassword: formState.userPassword,
        role: 'admin',
        userName: 'User-name',
      });

      formState.errors.general = '';
      setMessage('Sign up successfully');

      // redirect to login after signup
      setTimeout(() => {
        navigate('/');
        setMessage('');
      }, 2000);
    } catch (error: unknown) {
      let message = 'Signup failed';

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
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <div className={styles.logoSection}>
          <img src={logoImage} alt="Application logo" className={styles.logoImage} />
          <h2 className={styles.title}>Signup</h2>
        </div>

        {/* EMAIL */}
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            placeholder="Email"
            value={formState.userEmail}
            aria-invalid={!!formState.errors.userEmail}
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
            <span className={styles.fieldError}>{formState.errors.userEmail}</span>
          )}
        </div>

        {/* PASSWORD */}
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formState.userPassword}
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
            <span className={styles.fieldError}>{formState.errors.userPassword}</span>
          )}
        </div>

        {message && <p className={styles.success}>{message}</p>}
        {/* GENERAL ERROR */}
        {formState.errors.general && <p className={styles.error}>{formState.errors.general}</p>}

        {/* BUTTON */}
        <button disabled={formState.loading} className={styles.button}>
          {formState.loading ? 'Signing up...' : 'Signup'}
        </button>
        <div className={styles.redirect}>
          <p>
            Already have an account?{' '}
            <span className={styles.link} onClick={() => navigate('/')} role="button" tabIndex={0}>
              Login
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}
