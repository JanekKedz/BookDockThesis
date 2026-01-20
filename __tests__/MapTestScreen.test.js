import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MapScreen from '../screens/MapScreen';
import { View, TouchableOpacity, Text } from 'react-native';

// --- Mocking Dependencies ---

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: (callback) => callback(),
}));

jest.mock('@rnmapbox/maps', () => {
  const React = require('react');
  const { View, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: {
        setAccessToken: jest.fn(),
        MapView: ({ children }) => <View testID="mapbox-map">{children}</View>,
        Camera: () => <View testID="mapbox-camera" />,
        PointAnnotation: ({ id, onSelected }) => (
            <TouchableOpacity testID={`marker-${id}`} onPress={onSelected}>
               <View /> 
            </TouchableOpacity>
        ),
    },
  };
});

jest.mock('../components/Header', () => {
    const { Text } = require('react-native');
    return () => <Text>MockHeader</Text>;
});

jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://test-api.com',
}));

global.fetch = jest.fn();

describe('MapScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    fetch.mockClear();
    jest.restoreAllMocks();
  });

  it('should render loading state initially', async () => {
    // We mock fetch to resolve, but check for loading indicator (absence of map) before waiting
    fetch.mockResolvedValueOnce({
        json: () => Promise.resolve([]),
    });
    
    const { queryByTestId } = render(<MapScreen />);
    
    // While loading, map is not rendered
    expect(queryByTestId('mapbox-map')).toBeNull();
    
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it('should render map and markers after data fetch', async () => {
    const mockPorts = [
      { id: 101, name: 'Port One', latitude: 10, longitude: 20 },
      { id: 102, name: 'Port Two', latitude: 11, longitude: 21 },
    ];

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPorts),
    });

    const { getByTestId } = render(<MapScreen />);

    await waitFor(() => {
        expect(getByTestId('mapbox-map')).toBeTruthy();
        expect(getByTestId('marker-101')).toBeTruthy();
        expect(getByTestId('marker-102')).toBeTruthy();
    });
  });

  it('should navigate to PortDetails when a marker is pressed', async () => {
    const mockPorts = [
      { id: 101, name: 'Port One', latitude: 10, longitude: 20 },
    ];

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPorts),
    });

    const { getByTestId } = render(<MapScreen />);

    await waitFor(() => {
        expect(getByTestId('marker-101')).toBeTruthy();
    });

    fireEvent.press(getByTestId('marker-101'));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('PortDetails', expect.objectContaining({
        portId: 101,
    }));
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error('Fetch failed'));

    const { getByTestId } = render(<MapScreen />);

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch ports:", expect.any(Error));
        // Should still render map (empty) after error
        expect(getByTestId('mapbox-map')).toBeTruthy();
    });
    
    consoleSpy.mockRestore();
  });
});
