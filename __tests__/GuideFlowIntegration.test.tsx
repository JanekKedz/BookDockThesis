import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GuideListingScreen from '../screens/GuideListingScreen';
import GuideDetailsScreen from '../screens/GuideDetailsScreen';

// --- Integration Test Setup ---

const Stack = createNativeStackNavigator();

// --- Mocks ---

// Mock Header
jest.mock('../components/Header', () => {
    const { View, Text } = require('react-native');
    return (props) => <View><Text>{props.title}</Text></View>;
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
jest.spyOn(console, 'error').mockImplementation(() => {});

// Test Navigator
const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="GuideListings">
      <Stack.Screen name="GuideListings" component={GuideListingScreen} />
      <Stack.Screen name="GuideDetailsScreen" component={GuideDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Sailor Guide Flow Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('allows a sailor to view guide listings and read a specific guide', async () => {
    // 1. Initial State: Guide Listings Screen
    const mockGuides = [
        { id: 101, title: 'Sailing 101', description: 'Basics of sailing' },
        { id: 102, title: 'Advanced Knots', description: 'Knot tying guide' }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({ 
        ok: true,
        json: () => Promise.resolve(mockGuides)
    });

    const { getByText, getAllByText } = render(<TestNavigator />);

    // Verify Listings Loaded
    // Wait for the title of the first guide
    await waitFor(() => expect(getByText('Sailing 101')).toBeTruthy());
    expect(getByText('Advanced Knots')).toBeTruthy();

    // 2. Click on a Guide -> Navigate to Guide Details
    fireEvent.press(getByText('Sailing 101'));

    // Verify Guide Details Screen
    // Mock fetch for Guide Details
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
            id: 101, 
            title: 'Sailing 101', 
            content: 'Full content of the sailing guide...',
            authorId: 5,
            publicationDate: '2023-01-01',
            guideCategory: 'Beginner',
            guideStatus: 'PUBLISHED'
        })
    });

    // Mock fetch for Author Details (GuideDetailsScreen fetches author)
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
            id: 5, 
            name: 'Captain', 
            surname: 'Jack',
            email: 'jack@sea.com'
        })
    });

    // Wait for Guide Details content
    await waitFor(() => {
        // The component fetches details. 
        // We look for the full content or author info
        expect(getByText('Full content of the sailing guide...')).toBeTruthy();
    });

    expect(getByText('Category: Beginner')).toBeTruthy();
    
    // Verify Author Info
    await waitFor(() => {
        expect(getByText('Captain Jack')).toBeTruthy();
    });
  });
});
