import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './LoginPage';
import { AuthProvider } from '../../context/AuthProvider';
import { loginApi } from '../../services/loginService';
import '@testing-library/jest-dom';

vi.mock('../../services/loginService', () => ({
  loginApi: vi.fn(),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
};

describe('Login Form Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole('button', { name: /login/i });

    // Click the button
    await user.click(submitButton);

    // findByText
    const emailError = await screen.findByText(/email is required/i);
    const passwordError = await screen.findByText(/password is required/i);

    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();

    //  Ensure the API was never called
    expect(loginApi).not.toHaveBeenCalled();
  });

  it('should show validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole('button', { name: /login/i });

    // Click the button
    await user.click(submitButton);

    const emailError = await screen.findByText(/Email is required/i);
    const passwordError = await screen.findByText(/Password is required/i);

    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();

    expect(loginApi).not.toHaveBeenCalled();
  });

  it('should call loginApi with correct payload', async () => {
    const user = userEvent.setup();

    vi.mocked(loginApi).mockResolvedValue('fake-token-123');

    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'dev@example.com');
    await user.type(passwordInput, 'secure123');

    // wait for React state sync
    await waitFor(() => {
      expect(emailInput).toHaveValue('dev@example.com');
      expect(passwordInput).toHaveValue('secure123');
    });

    await user.click(submitButton);

    // wait for async submit + reducer + API call
    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledTimes(1);
      expect(loginApi).toHaveBeenCalledWith({
        userEmail: 'dev@example.com',
        userPassword: 'secure123',
      });
    });
  });

  it('should call loginApi with correct payload', async () => {
    const user = userEvent.setup();

    vi.mocked(loginApi).mockResolvedValue('fake-token-123');

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText(/email address/i), 'dev@example.com');
    await user.type(screen.getByLabelText(/password/i), 'secure123');

    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledWith({
        userEmail: 'dev@example.com',
        userPassword: 'secure123',
      });
    });
  });
});
