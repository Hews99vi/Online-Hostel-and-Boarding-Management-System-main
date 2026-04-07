import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from '../useAuthStore';
import { axiosInstance } from '../../lib/axios';

// Mock axios
jest.mock('../../lib/axios');

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.authUser = null;
      result.current.isSigningUp = false;
      result.current.isLoggingIn = false;
      result.current.isCheckingAuth = true;
    });
    jest.clearAllMocks();
  });

  describe('checkAuth', () => {
    it('should set authUser on successful check', async () => {
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      axiosInstance.get.mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      await waitFor(() => {
        expect(result.current.authUser).toEqual(mockUser);
        expect(result.current.isCheckingAuth).toBe(false);
      });
    });

    it('should set authUser to null on failed check', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      await waitFor(() => {
        expect(result.current.authUser).toBeNull();
        expect(result.current.isCheckingAuth).toBe(false);
      });
    });
  });

  describe('signup', () => {
    it('should call API and check auth on successful signup', async () => {
      const signupData = {
        name: 'New User',
        email: 'new@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      const mockUser = {
        _id: '123',
        name: 'New User',
        email: 'new@example.com',
        role: 'user'
      };

      axiosInstance.post.mockResolvedValueOnce({ data: { message: 'Success' } });
      axiosInstance.get.mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signup(signupData);
      });

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/signup', signupData);
        expect(result.current.isSigningUp).toBe(false);
      });
    });

    it('should handle signup errors', async () => {
      const signupData = {
        name: 'New User',
        email: 'new@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Email already exists' } }
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signup(signupData);
      });

      await waitFor(() => {
        expect(result.current.isSigningUp).toBe(false);
      });
    });
  });

  describe('login', () => {
    it('should call API and check auth on successful login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      axiosInstance.post.mockResolvedValueOnce({ data: { message: 'Success' } });
      axiosInstance.get.mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login(loginData);
      });

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', loginData);
        expect(result.current.isLoggingIn).toBe(false);
      });
    });

    it('should handle login errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } }
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login(loginData);
      });

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false);
      });
    });
  });
});
