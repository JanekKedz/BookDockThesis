import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from '../context/AuthContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import RegisterScreen from '../screens/RegisterScreen';

// --- Integration Test Setup ---

const Stack = createNativeStackNavigator();

// --- Mocks ---

// Mock Header to simplify component tree
jest.mock('../components/Header', () => {
    const { View, Text } = require('react-native');
    return (props) => <View><Text>{props.title || 'Header'}</Text></View>;
});

// Mock AuthContext if needed, though we use AuthProvider here
// We actually want the real AuthProvider logic usually, but we need to mock api calls.
// The existing tests mock useAuth but here we are using the provider so we should mock fetch.

// Mock Fetch
global.fetch = jest.fn();

// Mock Alert
jest.spyOn(console, 'error').mockImplementation(() => {});
const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');

// Mock HomeScreen content
const MockHomeScreen = () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (
        <View>
            <Text>Welcome to Home Screen</Text>
        </View>
    );
};

// Test Navigator
const TestNavigator = () => (
  <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={MockHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </AuthProvider>
);

describe('Welcome Flow Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    alertSpy.mockClear();
  });

  it('navigates from Welcome to SignIn and successfully logs in', async () => {
    const { getByText, getByPlaceholderText, getAllByText } = render(<TestNavigator />);

    // 1. Initial State: Welcome Screen
    expect(getByText('Welcome to')).toBeTruthy();
    expect(getByText('Book&Dock!')).toBeTruthy();

    // 2. Press "Sign in"
    fireEvent.press(getByText('Sign in'));

    // 3. Verify Navigation to SignIn Screen
    await waitFor(() => expect(getAllByText('Sign In').length).toBeGreaterThan(0));

    // 4. Perform Login
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 1,
        email: 'user@test.com',
        role: 'SAILOR',
        token: 'fake-token'
      })
    });

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'user@test.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');

    // Find Sign In button (it's the second text usually, or last)
    const signInButtons = getAllByText('Sign In');
    fireEvent.press(signInButtons[signInButtons.length - 1]);

    // 5. Verify Navigation to Home
    await waitFor(() => {
        expect(getByText('Welcome to Home Screen')).toBeTruthy();
    });
  });

  it('navigates from Welcome to Register and creates an account', async () => {
    const { getByText, getByPlaceholderText, getAllByPlaceholderText, getAllByText } = render(<TestNavigator />);

    // 1. Initial State: Welcome Screen
    expect(getByText('Welcome to')).toBeTruthy();

    // 2. Press "Register"
    fireEvent.press(getByText('Register'));

    // 3. Verify Navigation to Register Screen
    await waitFor(() => expect(getAllByText('Register').length).toBeGreaterThan(0));

    // 4. Fill Registration Form
    const valueInputs = getAllByPlaceholderText('Value');
    const phoneInput = getByPlaceholderText('+48');
  
    // Assuming order: Name, Surname, Email, Username, Password based on RegisterScreen implementation
    fireEvent.changeText(valueInputs[0], 'Jane'); 
    fireEvent.changeText(valueInputs[1], 'Doe'); 
    fireEvent.changeText(valueInputs[2], 'jane@test.com');
    fireEvent.changeText(valueInputs[3], 'janedoe'); 
    fireEvent.changeText(valueInputs[4], 'secretpass');
    fireEvent.changeText(phoneInput, '987654321');
  
    fireEvent.press(getByText('Select User Type'));
    fireEvent.press(getByText('Sailor'));

    // 5. Submit Registration
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: "Success" }),
    });

    const registerButtons = getAllByText('Register');
    // Button is likely the second one (first is header title)
    fireEvent.press(registerButtons[1]);

    // 6. Verify Success Alert and Navigation (Register usually navigates to Home or SignIn)
    // In RegisterScreen.tsx: Alert "Success" -> navigation.replace("Home")
    await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Success", "Registration successful!");
        expect(getByText('Welcome to Home Screen')).toBeTruthy();
    });
  });
});
