import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DockOwnerScreen from '../screens/DockOwnerScreen';
import AddPortScreen from '../screens/AddPortScreen';

// --- Integration Test Setup ---

const Stack = createNativeStackNavigator();

// --- Mocks ---

// Correctly mock components by importing React inside the mock factory
jest.mock('../components/Header', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return (props) => <View><Text>{props.title}</Text></View>;
});

// Mock PortCard
jest.mock('../components/PortCard.tsx', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const MockPortCard = (props) => {
    // Ensure we handle cases where port might be undefined during render cycles
    if (!props.port) return null;
    return <View><Text>Port: {props.port.name}</Text></View>;
  };
  return MockPortCard;
});

// Mock global fetch
global.fetch = jest.fn();

// Mock Alert
jest.spyOn(console, 'error').mockImplementation(() => {});
const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');

// Mock AuthContext
// We only need to mock useAuth because we are not rendering the Provider
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 99, email: 'owner@test.com', role: 'DOCK_OWNER' },
  }),
}));

// Wrapper with Navigation and Providers
// Removed AuthProvider because useAuth is already mocked directly
const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="DockOwnerScreen" component={DockOwnerScreen} />
      <Stack.Screen name="AddPortScreen" component={AddPortScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Owner Management Flow Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    alertSpy.mockClear();
  });

  it('navigates to AddPortScreen and adds a new port successfully', async () => {
    // 1. Initial State: Dock Owner Screen with NO ports
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]) 
    });

    const { getByText, getByPlaceholderText } = render(<TestNavigator />);

    // Verify we are on DockOwnerScreen
    await waitFor(() => expect(getByText('My Ports')).toBeTruthy());
    expect(getByText('You have no ports yet.')).toBeTruthy();

    // 2. Click "Add New Port" (Navigate to AddPortScreen)
    fireEvent.press(getByText('+ Add New Port'));

    // Wait for navigation to AddPortScreen
    await waitFor(() => expect(getByText('Add Port')).toBeTruthy());

    // 3. Prepare mocks for Add Port Flow
    // Mock initial fetch for AddPortScreen (empty list)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]) 
    });
    
    // Toggle the form visibility
    const toggleButton = getByText('+ Add New Port'); // Same button text reused in AddPortScreen
    fireEvent.press(toggleButton);

    // Verify form is visible
    expect(getByPlaceholderText('Enter port name')).toBeTruthy();

    // 4. Fill out the form
    fireEvent.changeText(getByPlaceholderText('Enter port name'), 'New Marina');
    fireEvent.changeText(getByPlaceholderText('Enter location'), 'Florida');
    fireEvent.changeText(getByPlaceholderText('longitude'), '80.123');
    fireEvent.changeText(getByPlaceholderText('latitude'), '25.456');
    
    // Mock the POST request response (Success)
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 101, name: 'New Marina' })
    });

    // Mock the subsequent fetchPorts call that happens after success
    // Important: We need to make sure the component actually calls this. 
    // AddPortScreen calls fetchPorts() inside handleAddPort after success.
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: 101, name: 'New Marina', location: 'Florida' }])
    });

    // 5. Submit the form
    fireEvent.press(getByText('Submit'));

    // 6. Verify API Call
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/ports'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"name":"New Marina"')
            })
        );
    });

    // 7. Verify Success Alert
    await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Success', 'Port added!');
    });

    // 8. Verify the list updates (The new port should appear)
    // We wait specifically for the text to appear. 
    await waitFor(() => {
        expect(getByText('New Marina')).toBeTruthy();
    });
  });

  it('shows validation error when adding empty port', async () => {
      // 1. Initial State for AddPortScreen directly (or navigate to it)
      // Since we are reusing the navigator, we start at DockOwnerScreen
      (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
      });

      const { getByText } = render(<TestNavigator />);

      // Navigate to AddPortScreen
      fireEvent.press(getByText('+ Add New Port'));
      await waitFor(() => expect(getByText('Add Port')).toBeTruthy());

      // Mock fetch for AddPortScreen
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

      // Open Form
      fireEvent.press(getByText('+ Add New Port'));

      // Submit Empty Form
      fireEvent.press(getByText('Submit'));

      // Verify Validation Alert
      await waitFor(() => {
          expect(alertSpy).toHaveBeenCalledWith('Error', 'Please fill in all required fields.');
      });

      // Verify POST was NOT called (fetch count should account for initial GETs only)
      // Initial GET (OwnerScreen) + GET (AddPortScreen) = 2 calls. No POST.
      const postCalls = (fetch as jest.Mock).mock.calls.filter(call => call[1] && call[1].method === 'POST');
      expect(postCalls.length).toBe(0);
  });
});
