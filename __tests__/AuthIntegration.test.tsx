import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from '../context/AuthContext';
import SignInScreen from '../screens/SignInScreen';
import RegisterScreen from '../screens/RegisterScreen';

// --- Integration Test Setup ---

// Create a real stack navigator for testing navigation flows
const Stack = createNativeStackNavigator();

// --- Mocks ---

jest.mock('../components/Header', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>Header Component</Text>;
});

// Mock HomeScreen content to verify we navigated there
const MockHomeScreen = () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (
        <View>
            <Text>Welcome to Home Screen</Text>
        </View>
    );
};

// Mock RegisterScreen content to verify we navigated there
jest.mock('../screens/RegisterScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>Create Account</Text>
    </View>
  );
});

// Mock external fetch to simulate backend responses
global.fetch = jest.fn();

// Mock Alert to prevent test interruptions
jest.spyOn(console, 'error').mockImplementation(() => {});

// Create a wrapper component that includes all necessary providers
const TestNavigator = () => (
  <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Home" component={MockHomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </AuthProvider>
);

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.spyOn(require('react-native').Alert, 'alert');
  });

  it('navigates from SignIn to Home on successful login', async () => {
    // 1. Setup Mock Response for Login API
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 1,
        email: 'test@example.com',
        role: 'SAILOR',
        token: 'fake-jwt-token'
      })
    });

    // 2. Render the full navigator
    const { getByText, getByPlaceholderText, getAllByText } = render(<TestNavigator />);

    // 3. Verify we are on SignIn Screen
    // SignInScreen uses "Sign In" for both header and button, so we handle multiples
    expect(getAllByText('Sign In').length).toBeGreaterThan(0);

    // 4. Fill in credentials
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');

    // 5. Press Sign In
    const signInButtons = getAllByText('Sign In');
    // The button is likely the second one (first is header), or we find by other means
    // In SignInScreen.tsx, the button text is inside a TouchableOpacity inside a View
    // Simpler: fireEvent on the button specifically.
    // Given the structure, let's target the one that is a button text.
    // Or we can assume the last one is the button
    fireEvent.press(signInButtons[signInButtons.length - 1]);

    // 6. Wait for async operations and navigation
    await waitFor(() => {
      // Check if fetch was called
      expect(fetch).toHaveBeenCalled();
      
      // Verify we are now seeing the Home Screen content
      expect(getByText('Welcome to Home Screen')).toBeTruthy();
    });
  });

  it('shows error on invalid credentials and stays on SignIn screen', async () => {
    // 1. Setup Mock Response for Failed Login
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    });

    const { getByText, getByPlaceholderText, queryByText, getAllByText } = render(<TestNavigator />);

    // 2. Fill in wrong credentials
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'wrong@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpass');

    // 3. Press Sign In
    const signInButtons = getAllByText('Sign In');
    fireEvent.press(signInButtons[signInButtons.length - 1]);

    // 4. Wait for the API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    // 5. Verify we are STILL on SignIn Screen (Home screen text should NOT be visible)
    expect(queryByText('Welcome to Home Screen')).toBeNull();
    expect(getAllByText('Sign In').length).toBeGreaterThan(0);
  });

  it('navigates to Register screen when Register link is pressed', async () => {
    const { getByText } = render(<TestNavigator />);

    // 1. Find and press Register button
    // The Register button has text "Register"
    const registerButton = getByText('Register');
    fireEvent.press(registerButton);

    // 2. Wait for navigation and verify mock content appears
    await waitFor(() => {
        expect(getByText('Create Account')).toBeTruthy(); 
    });
  });
});
