import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import Header from '../components/Header';

// --- Integration Test Setup ---

const Stack = createNativeStackNavigator();

// --- Mocks ---

// 1. Mock Screens
const HomeScreen = () => (
    <View>
        <Header title="Home" />
        <Text>Screen: Home</Text>
    </View>
);
const MapScreen = () => <View><Text>Screen: Map</Text></View>;
const ProfileViewScreen = () => <View><Text>Screen: ProfileView</Text></View>;
const GuideListingsScreen = () => <View><Text>Screen: GuideListings</Text></View>;
const BookingListingsScreen = () => <View><Text>Screen: BookingListings</Text></View>;
const DockOwnerScreen = () => <View><Text>Screen: DockOwnerScreen</Text></View>;

// 2. Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@test.com', role: 'DOCK_OWNER' }, 
  }),
}));

// 3. Mock Icons
// We render a Text element with the icon name so we can easily find it in tests.
jest.mock('react-native-vector-icons/Ionicons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return ({ name }) => <Text>ICON:{name}</Text>;
});

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="ProfileView" component={ProfileViewScreen} />
      <Stack.Screen name="GuideListings" component={GuideListingsScreen} />
      <Stack.Screen name="BookingListings" component={BookingListingsScreen} />
      <Stack.Screen name="DockOwnerScreen" component={DockOwnerScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Navigation Integration (Header)', () => {

  it('navigates to MapScreen when Map icon is pressed', async () => {
    const { getByText } = render(<TestNavigator />);
    expect(getByText('Screen: Home')).toBeTruthy();

    // Find and press the Map icon
    fireEvent.press(getByText('ICON:map'));

    await waitFor(() => {
        expect(getByText('Screen: Map')).toBeTruthy();
    });
  });

  it('navigates to ProfileViewScreen when Profile icon is pressed', async () => {
    const { getByText } = render(<TestNavigator />);
    fireEvent.press(getByText('ICON:person-circle-outline'));

    await waitFor(() => {
        expect(getByText('Screen: ProfileView')).toBeTruthy();
    });
  });

  it('navigates to GuideListingsScreen when Guide icon is pressed', async () => {
    const { getByText } = render(<TestNavigator />);
    fireEvent.press(getByText('ICON:book-outline'));

    await waitFor(() => {
        expect(getByText('Screen: GuideListings')).toBeTruthy();
    });
  });

  it('navigates to BookingListingsScreen when Booking icon is pressed', async () => {
      const { getByText } = render(<TestNavigator />);
      fireEvent.press(getByText('ICON:bookmark-outline'));
  
      await waitFor(() => {
          expect(getByText('Screen: BookingListings')).toBeTruthy();
      });
  });

  it('navigates to DockOwnerScreen when Boat icon is pressed (DOCK_OWNER role)', async () => {
    // The mock AuthContext sets role to DOCK_OWNER, so this icon should be visible
    const { getByText } = render(<TestNavigator />);
    fireEvent.press(getByText('ICON:boat-outline'));

    await waitFor(() => {
        expect(getByText('Screen: DockOwnerScreen')).toBeTruthy();
    });
  });
});
