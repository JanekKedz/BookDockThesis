import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DockOwnerScreen from '../screens/DockOwnerScreen';

// --- Mocks ---

const mockNavigate = jest.fn();

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: (callback: () => void) => callback(),
}));

// Mock Header
jest.mock('../components/Header', () => {
  const { Text } = require('react-native');
  return () => <Text>MockHeader</Text>;
});

// Mock PortCard
// Note: The source file imports it with .tsx extension
jest.mock('../components/PortCard.tsx', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ port, onPress }: any) => (
        <TouchableOpacity onPress={onPress} testID={`port-card-${port.id}`}>
            <Text>{port.name}</Text>
        </TouchableOpacity>
    );
});

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 123 },
  }),
}));

// Mock Environment Variables
jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://test-api.com',
}));

// Mock Global Fetch
global.fetch = jest.fn();

describe('DockOwnerScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    (fetch as jest.Mock).mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly with empty state when no ports are returned', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { getByText } = render(<DockOwnerScreen navigation={{ navigate: mockNavigate }} />);

    await waitFor(() => {
        expect(getByText('You have no ports yet.')).toBeTruthy();
    });
    expect(getByText('+ Add New Port')).toBeTruthy();
  });

  it('renders ports correctly when fetch is successful', async () => {
    const mockPorts = [
      { id: 1, name: 'Port A', location: 'Loc A', image: 'img.jpg' },
      { id: 2, name: 'Port B', location: 'Loc B', image: 'img.jpg' },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPorts),
    });

    const { getByText, queryByText } = render(<DockOwnerScreen navigation={{ navigate: mockNavigate }} />);

    await waitFor(() => {
        expect(getByText('Port A')).toBeTruthy();
        expect(getByText('Port B')).toBeTruthy();
    });
    expect(queryByText('You have no ports yet.')).toBeNull();
  });

  it('navigates to AddPortScreen when "Add New Port" button is pressed', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
    });
    const { getByText } = render(<DockOwnerScreen navigation={{ navigate: mockNavigate }} />);

    await waitFor(() => expect(getByText('+ Add New Port')).toBeTruthy());
    
    const addButton = getByText('+ Add New Port');
    fireEvent.press(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('AddPortScreen');
  });

  it('navigates to PortDetails when a port card is pressed', async () => {
     const mockPorts = [
      { id: 101, name: 'Sunny Marina' },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPorts),
    });

    const { getByTestId } = render(<DockOwnerScreen navigation={{ navigate: mockNavigate }} />);

    await waitFor(() => {
        expect(getByTestId('port-card-101')).toBeTruthy();
    });

    fireEvent.press(getByTestId('port-card-101'));

    expect(mockNavigate).toHaveBeenCalledWith('PortDetails', { portId: 101 });
  });

  it('logs an error when fetching ports fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<DockOwnerScreen navigation={{ navigate: mockNavigate }} />);

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch ports:", expect.any(Error));
    });
  });
});
