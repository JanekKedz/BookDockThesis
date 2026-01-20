import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen';
import PortDetailsScreen from '../screens/PortDetailsScreen';
import DockDetailsScreen from '../screens/DockDetailsScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';

// --- Integration Test Setup ---

const Stack = createNativeStackNavigator();

// --- Mocks ---

// Mock Header
jest.mock('../components/Header', () => {
    const { View, Text } = require('react-native');
    return (props) => <View><Text>{props.title}</Text></View>;
});

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
    presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  }),
}));

// Mock Mapbox
jest.mock('@rnmapbox/maps', () => {
  const React = require('react');
  const { View, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: {
        setAccessToken: jest.fn(),
        MapView: ({ children }) => <View>{children}</View>,
        Camera: () => <View />,
        PointAnnotation: ({ id, onSelected }) => (
            <TouchableOpacity testID={`marker-${id}`} onPress={onSelected}>
               <View /> 
            </TouchableOpacity>
        ),
    },
  };
});

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 10, email: 'sailor@test.com', role: 'SAILOR' },
  }),
}));

// Mock Environment Variables
jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://test-api.com',
}));

// Mock Global Fetch
global.fetch = jest.fn();

// Mock Alert
const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
jest.spyOn(console, 'error').mockImplementation(() => {});

const MockHomeScreen = () => {
    const React = require('react');
    const { View } = require('react-native');
    return <View />;
};

// Test Navigator
const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Map">
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="PortDetails" component={PortDetailsScreen} />
      <Stack.Screen name="DockDetails" component={DockDetailsScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="Home" component={MockHomeScreen} /> 
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Sailor Booking Flow Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    alertSpy.mockClear();
  });

  it('allows a sailor to find a port, select a dock, and book it', async () => {
    // 1. Initial State: Map Screen with Ports
    const mockPorts = [
        { id: 101, name: 'Sunny Marina', latitude: 10, longitude: 20 },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({ // fetch ports
        ok: true,
        json: () => Promise.resolve(mockPorts)
    });

    const { getByTestId, getByText } = render(<TestNavigator />);

    // Verify Map Loaded and Marker Present
    await waitFor(() => expect(getByTestId('marker-101')).toBeTruthy());

    // 2. Click Marker -> Navigate to Port Details
    fireEvent.press(getByTestId('marker-101'));

    // Verify Port Details Screen Navigation
    // The screen header title is 'Port Details'
    await waitFor(() => expect(getByText('Port Details')).toBeTruthy());
    
    // Mock fetch for Port Details (Port info + Docks)
    (fetch as jest.Mock)
        .mockResolvedValueOnce({ // Port Info
            ok: true, 
            json: () => Promise.resolve({ 
                id: 101, 
                name: 'Sunny Marina', 
                location: 'Florida', 
                latitude: 10, 
                longitude: 20 
            })
        })
        .mockResolvedValueOnce({ // Docks List
            ok: true,
            json: () => Promise.resolve([{ id: 201, portId: 101, name: 'Dock A', pricePerNight: 50, availability: 1 }])
        });

    // Check if port name is displayed
    await waitFor(() => expect(getByText('Sunny Marina')).toBeTruthy());
    
    // Check if Dock is displayed
    await waitFor(() => expect(getByText('Dock A')).toBeTruthy());

    // 3. Select Dock -> Navigate to Dock Details
    fireEvent.press(getByText('Dock A'));

    // Verify Dock Details Screen
    await waitFor(() => expect(getByText('Dock Details')).toBeTruthy());

    // Mock fetch for Dock Details (Dock Info + Owner Info)
    (fetch as jest.Mock)
        .mockResolvedValueOnce({ // Dock Info
            ok: true,
            json: () => Promise.resolve({ 
                id: 201, 
                name: 'Dock A', 
                location: 'Florida', 
                pricePerNight: 50,
                pricePerPerson: 10,
                ownerId: 99
            })
        })
        .mockResolvedValueOnce({ // Owner Info
            ok: true,
            json: () => Promise.resolve({ id: 99, username: 'owner_dave' })
        });

    await waitFor(() => expect(getByText('Dock A')).toBeTruthy());
    
    // 4. Click "Book Now" -> Navigate to Booking Details
    fireEvent.press(getByText('Book now'));

    // Verify Booking Details Screen
    await waitFor(() => expect(getByText('Booking Details')).toBeTruthy());

    // 5. Confirm Booking
    // Mock Booking POST response
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 301, status: 'CONFIRMED' })
    });

    fireEvent.press(getByText('Book now'));

    // 6. Verify Success Alert
    await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Success', 'Booking created!');
    });
  });
});
