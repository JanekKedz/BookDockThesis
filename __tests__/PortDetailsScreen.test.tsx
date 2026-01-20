import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { useFocusEffect } from '@react-navigation/native';
import PortDetailsScreen from '../screens/PortDetailsScreen';

// --- Mocking Dependencies ---

// Mock native-heavy libraries like Mapbox to prevent native code errors in Jest
jest.mock('@rnmapbox/maps', () => ({
  __esModule: true,
  default: {
    MapView: ({ children }) => <div data-testid="map-view">{children}</div>,
    Camera: () => <div data-testid="map-camera" />,
    PointAnnotation: () => <div data-testid="map-annotation" />,
  },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1 } }), // Use integer ID
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(callback => callback()), // Immediately invoke the effect
}));

jest.mock('../components/Header', () => 'Header');

jest.mock('../components/DockCard', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (props) => (
      <View>
        <Text>{props.dock.name}</Text>
        <TouchableOpacity testID={`details-button-${props.dock.id}`} onPress={props.onPress}>
          <Text>View Details</Text>
        </TouchableOpacity>
      </View>
    );
});

global.fetch = jest.fn();

const mockNavigation = {
  navigate: jest.fn(),
};

const mockRoute = {
  params: {
    portId: 1, // Use integer ID
  },
};

const mockPortDetails = {
  id: 1,
  name: 'Seaside Port',
  location: 'Coastal City',
  description: 'A bustling port with many amenities.',
  owner_id: 1, // Assume the current user is the owner
  latitude: 34.0522, // Add coordinates to trigger map rendering
  longitude: -118.2437,
};

const mockDocks = [
  { id: 1, name: 'Alpha Dock', pricePerNight: 100, port_id: 1, owner_id: 1 },
  { id: 2, name: 'Bravo Dock', pricePerNight: 120, port_id: 1, owner_id: 1 },
];

describe('PortDetailsScreen', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (useFocusEffect as jest.Mock).mockClear();
    mockNavigation.navigate.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show a loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { getByText } = render(<PortDetailsScreen route={mockRoute} navigation={mockNavigation} />);
    expect(getByText('Loading...')).toBeTruthy(); // Generic loading text
  });

  it('should fetch and display port details, docks, and the map', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPortDetails) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockDocks) });

    const { getByText, getByTestId } = render(<PortDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => {
      // Check for port details
      expect(getByText('Seaside Port')).toBeTruthy();
      expect(getByText('Location: Coastal City')).toBeTruthy(); // Match component output

      // Check for dock details from the mock DockCard
      expect(getByText('Alpha Dock')).toBeTruthy();
      expect(getByText('Bravo Dock')).toBeTruthy();
      
      // Check if the mock map view is rendered
      expect(getByTestId('map-view')).toBeTruthy();
    });

    expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/ports/1');
    expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/docking-spots');
  });

  it('should display a message if no docks are available', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPortDetails) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    const { findByText } = render(<PortDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    expect(await findByText('No docks available for this port.')).toBeTruthy();
  });

  it('should show an "Add New Dock" button if the user is the owner', async () => {
    const ownerPort = { ...mockPortDetails, ownerId: 1 };
     (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(ownerPort) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    const { findByText } = render(<PortDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    expect(await findByText('+ Add New Dock')).toBeTruthy();
  });

   it('should NOT show an "Add New Dock" button if the user is not the owner', async () => {
     const notOwnerPort = { ...mockPortDetails, ownerId: 999 }; // Different owner ID
     (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(notOwnerPort) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    const { queryByText } = render(<PortDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => {
        expect(queryByText('+ Add New Dock')).toBeNull();
    });
  });

  it('should handle fetch errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API is down'));
    const { findByText } = render(<PortDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    // The component shows a generic error, not a specific one for the port
    expect(await findByText('Port not found.')).toBeTruthy();
  });

  it('should navigate to DockDetails when a dock card is pressed', async () => {
     (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPortDetails) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockDocks) });

    const { findByTestId } = render(<PortDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    const detailsButton = await findByTestId('details-button-1');
    fireEvent.press(detailsButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('DockDetails', expect.any(Object));
  });
});
