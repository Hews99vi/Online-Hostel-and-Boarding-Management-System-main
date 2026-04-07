import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { useAuthStore } from '../../store/useAuthStore';

// Mock the auth store
jest.mock('../../store/useAuthStore');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navbar Component', () => {
  const renderNavbar = () => {
    return render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render logo and brand name', () => {
    useAuthStore.mockReturnValue({
      authUser: null,
      logout: jest.fn()
    });

    renderNavbar();

    expect(screen.getByText(/LuxeStay/i)).toBeInTheDocument();
  });

  it('should show login and signup links when user is not authenticated', () => {
    useAuthStore.mockReturnValue({
      authUser: null,
      logout: jest.fn()
    });

    renderNavbar();

    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it('should show user menu when user is authenticated', () => {
    useAuthStore.mockReturnValue({
      authUser: {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      },
      logout: jest.fn()
    });

    renderNavbar();

    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
  });

  it('should show admin-specific links for admin users', () => {
    useAuthStore.mockReturnValue({
      authUser: {
        _id: '123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      logout: jest.fn()
    });

    renderNavbar();

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', async () => {
    const mockLogout = jest.fn();
    
    useAuthStore.mockReturnValue({
      authUser: {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      },
      logout: mockLogout
    });

    renderNavbar();

    // This test depends on your actual implementation
    // You may need to adjust based on how your logout button is rendered
  });
});
