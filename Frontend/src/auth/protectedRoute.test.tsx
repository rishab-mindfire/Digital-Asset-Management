import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const ProtectedChild = () => <div>Protected Content</div>;
  const LoginMockPage = () => <div>Login Page</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when the user is authenticated', () => {
    // Added mock login and logout functions to satisfy AuthContextType
    vi.mocked(useAuth).mockReturnValue({
      state: { isAuthenticated: true, token: 'mock-valid-token' },
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <ProtectedChild />
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('should redirect to /login when the user is not authenticated', () => {
    // Added mock login and logout functions here as well
    vi.mocked(useAuth).mockReturnValue({
      state: { isAuthenticated: false, token: null },
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedChild />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginMockPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
