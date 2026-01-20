import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../screens/WelcomeScreen';

// --- Mocking Dependencies ---

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// --- Test Suite for WelcomeScreen ---

describe('WelcomeScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.restoreAllMocks();
  });

  it('should render all main elements correctly', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    expect(getByText('Welcome to')).toBeTruthy();
    expect(getByText('Book&Dock!')).toBeTruthy();
    expect(getByText('Best way to sail off to a new journey')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
    expect(getByText('Sign in')).toBeTruthy();
  });

  it('should navigate to Register screen when Register button is pressed', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    const registerButton = getByText('Register');
    fireEvent.press(registerButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('should navigate to SignIn screen when Sign in button is pressed', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    const signInButton = getByText('Sign in');
    fireEvent.press(signInButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('SignIn');
  });
});
