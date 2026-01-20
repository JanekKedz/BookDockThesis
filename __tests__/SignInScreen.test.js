import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignInScreen from '../screens/SignInScreen';

// --- Mocking Dependencies ---

// The component receives navigation as a prop. We create a mock for it.
const mockReplace = jest.fn();
const mockNavigation = { replace: mockReplace };

// Mock AuthContext with a realistic async signIn function
const mockSignIn = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

// --- Test Suite for SignInScreen ---

describe('SignInScreen', () => {
  let alertSpy;

  // Helper function to render the component correctly with the required prop
  const renderComponent = () => {
    return render(<SignInScreen navigation={mockNavigation} />);
  };

  beforeEach(() => {
    // Clear all mocks before each test
    mockReplace.mockClear();
    mockSignIn.mockClear();
    // Spy on Alert.alert to track calls
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  it('should render all UI elements correctly', () => {
    const { getAllByText, getByPlaceholderText, getByText } = renderComponent();
    
    // Use getAllByText to avoid ambiguity with multiple 'Sign In' texts
    expect(getAllByText('Sign In').length).toBeGreaterThan(0);
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  it('should update email and password inputs when the user types', () => {
    const { getByPlaceholderText } = renderComponent();
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('should call signIn and navigate on successful sign-in', async () => {
    mockSignIn.mockResolvedValue(true);

    const { getByPlaceholderText, getAllByText } = renderComponent();
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getAllByText('Sign In')[1]; // Assumes the button is the second element

    fireEvent.changeText(emailInput, 'user@domain.com');
    fireEvent.changeText(passwordInput, 'correct-password');
    fireEvent.press(signInButton);

    // The async operations should be wrapped in waitFor
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@domain.com', 'correct-password');
      expect(mockReplace).toHaveBeenCalledWith('Home');
    });
  });

  it('should show an alert if fields are empty on submit', () => {
    const { getAllByText } = renderComponent();
    const signInButton = getAllByText('Sign In')[1];
    
    fireEvent.press(signInButton);

    expect(alertSpy).toHaveBeenCalledWith("Error", "Please enter your email and password.");
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should show an alert if sign-in fails server-side', async () => {
    const signInError = new Error('Invalid credentials');
    mockSignIn.mockRejectedValue(signInError);

    const { getByPlaceholderText, getAllByText } = renderComponent();
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getAllByText('Sign In')[1];

    fireEvent.changeText(emailInput, 'user@domain.com');
    fireEvent.changeText(passwordInput, 'wrong-password');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(alertSpy).toHaveBeenCalledWith("Sign In Failed", signInError.message);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should navigate to Register screen when the register button is pressed', () => {
    const { getByText } = renderComponent();
    const registerButton = getByText('Register');

    fireEvent.press(registerButton);

    expect(mockReplace).toHaveBeenCalledWith('Register');
  });
});
