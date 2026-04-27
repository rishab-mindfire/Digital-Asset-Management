import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { JSX } from 'react';

/**
 * ProtectedRoute Component
 *
 * Guards routes that require user authentication.
 * If the user is not authenticated, they are redirected to the login page.
 *
 * @component
 *
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - The protected component to render
 *
 * @returns {JSX.Element} The protected content if authenticated, otherwise a redirect to /login
 *
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }): JSX.Element => {
  const { state } = useAuth();

  // Redirect unauthenticated users to login page
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
