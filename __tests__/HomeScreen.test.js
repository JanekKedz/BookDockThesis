import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

// --- Mocking Dependencies ---

// 1. Mock AuthContext to provide a STABLE user object and prevent re-render loops
const mockAuthContextValue = {
  user: { id: 'test-user-id', role: 'USER' },
};
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContextValue,
}));

// 2. Mock navigation hooks, including useFocusEffect
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
  }),
  useFocusEffect: require('react').useEffect, // Mocks useFocusEffect with useEffect for tests
}));

// 3. Mock child components and libraries
jest.mock('../components/Header', () => 'Header');
jest.mock('../components/PortCard', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return (props) => (
    <TouchableOpacity onPress={props.onPress}>
      <Text>PortCard: {props.port.name}</Text>
    </TouchableOpacity>
  );
});
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('@react-native-community/datetimepicker', () => {
    const { View } = require('react-native');
    return () => <View testID="dateTimePicker" />;
});

// NOTE: The @env mock is likely being overridden by a babel plugin.
// For the test to pass, we will assert against the actual URL.
jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://192.168.1.12:5000', 
}));
global.fetch = jest.fn();

// --- Test Suite for HomeScreen ---

describe('HomeScreen', () => {
  const mockPorts = [
    { id: 1, name: 'Port of Hamburg', location: 'Hamburg' },
    { id: 2, name: 'Port of Rotterdam', location: 'Rotterdam' },
  ];
  
  beforeEach(() => {
    mockNavigate.mockClear();
    fetch.mockClear();
    // Mock fetch to return an empty array by default for all tests
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderScreen = () => render(<HomeScreen navigation={{ navigate: mockNavigate, replace: jest.fn() }} />);


  it('should render initial UI elements', () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    expect(getByPlaceholderText('Search location...')).toBeTruthy();
    expect(getByText('From')).toBeTruthy();
    expect(getByText('To')).toBeTruthy();
  });

  it('should fetch ports and render them', async () => {
    // Override default fetch mock for this specific test
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPorts),
    });

    const { findAllByText } = renderScreen();

    // Wait for the ports to be rendered
    const portCards = await findAllByText(/PortCard:/);
    expect(portCards).toHaveLength(2);

    // Assert that fetch was called correctly
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/ports');
  });

  it('should show placeholder text when no ports are fetched', async () => {
    // The default mock already returns [], so no need to mock fetch again
    const { findByText } = renderScreen();
    expect(await findByText('There are currently no ports')).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  
  it('should handle API fetch error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API is down'));

    renderScreen();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to fetch ports:', expect.any(Error));
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should navigate when a port is pressed', async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPorts),
    });

    const { findByText } = renderScreen();
    const portCard = await findByText('Port of Hamburg');
    fireEvent.press(portCard);

    expect(mockNavigate).toHaveBeenCalledWith('PortDetails', expect.objectContaining({ portId: 1 }));
  });
});
