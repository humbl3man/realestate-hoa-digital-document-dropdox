import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from '@/app/login-form';
import { authClient } from '@/lib/auth-client';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// Mock authClient
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      magicLink: vi.fn(),
    },
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);
    
    const input = screen.getByPlaceholderText('name@example.com');
    const button = screen.getByRole('button', { name: /send magic link/i });

    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.submit(button.closest('form') as HTMLFormElement);

    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(authClient.signIn.magicLink).not.toHaveBeenCalled();
  });

  it('submits successfully and shows success message', async () => {
    // Mock successful auth call
    vi.mocked(authClient.signIn.magicLink).mockResolvedValue({ data: {}, error: null } as any);

    render(<LoginForm />);
    
    const input = screen.getByPlaceholderText('name@example.com');
    const button = screen.getByRole('button', { name: /send magic link/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.submit(button.closest('form') as HTMLFormElement);

    // Should show loading state
    expect(screen.getByText('Sending Link...')).toBeInTheDocument();

    // Should show success state
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });
    
    expect(authClient.signIn.magicLink).toHaveBeenCalledWith({
      email: 'test@example.com',
      callbackURL: '/dashboard',
      errorCallbackURL: '/',
    });
  });

  it('shows error message if magic link fails', async () => {
    // Mock failed auth call
    vi.mocked(authClient.signIn.magicLink).mockResolvedValue({ 
      data: null, 
      error: { message: 'Failed to send' } 
    } as any);

    render(<LoginForm />);
    
    const input = screen.getByPlaceholderText('name@example.com');
    const button = screen.getByRole('button', { name: /send magic link/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.submit(button.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByText('Failed to send')).toBeInTheDocument();
    });
  });
});
