import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useAuthStore } from './store/useAuthStore';

// Mock the auth store
jest.mock('./store/useAuthStore');

// Mock all page components
jest.mock('./pages/HomePage', () => () => <div>Home Page</div>);
jest.mock('./pages/LoginPage', () => () => <div>Login Page</div>);
jest.mock('./pages/SignupPage', () => () => <div>Signup Page</div>);
jest.mock('./pages/DashboardPage', () => () => <div>Dashboard Page</div>);
jest.mock('./pages/RoomsPage', () => () => <div>Rooms Page</div>);
jest.mock('./components/Layout', () => ({ children }) => <div>{children}</div>);

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should render loading state while checking auth', () => {
    useAuthStore.mockReturnValue({
      authUser: null,
      checkAuth: jest.fn(),
      isCheckingAuth: true
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should call checkAuth on mount', () => {
    const mockCheckAuth = jest.fn();
    
    useAuthStore.mockReturnValue({
      authUser: null,
      checkAuth: mockCheckAuth,
      isCheckingAuth: false
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(mockCheckAuth).toHaveBeenCalled();
  });

  it('should render app content after auth check completes', async () => {
    useAuthStore.mockReturnValue({
      authUser: null,
      checkAuth: jest.fn(),
      isCheckingAuth: false
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
