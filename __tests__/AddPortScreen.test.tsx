import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddPortScreen from '../screens/AddPortScreen';

// --- Mocking Dependencies ---

// 1. Create a STABLE mock object for the auth context value
const mockAuthContextValue = { user: { id: 1 } };
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContextValue,
}));

// 2. Mock React Navigation hooks to prevent crashes
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: require('react').useEffect, // Use useEffect to prevent loops in tests
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://192.168.1.12:5000',
}));

jest.mock('../components/Header', () => 'Header');
jest.mock('../components/PortCard.tsx', () => 'PortCard');

global.fetch = jest.fn();

const mockNavigation = {
  navigate: jest.fn(),
};

describe('AddPortScreen', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = () => render(<AddPortScreen navigation={mockNavigation} />);

  it('fetches and displays existing ports on initial render', async () => {
    const mockPorts = [
      { id: 1, name: 'Port 1', location: 'Location 1' },
      { id: 2, name: 'Port 2', location: 'Location 2' },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true,
      json: () => Promise.resolve(mockPorts),
    });

    const { findByText } = renderComponent();

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/ports/owner/1');
    });

    expect(await findByText('Port 1')).toBeTruthy();
    expect(await findByText('Port 2')).toBeTruthy();
  });

  it('toggles the add port form when the button is pressed', () => {
    const { getByText, queryByPlaceholderText } = renderComponent();

    expect(queryByPlaceholderText('Enter port name')).toBeNull();
    fireEvent.press(getByText('+ Add New Port'));
    expect(queryByPlaceholderText('Enter port name')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    fireEvent.press(getByText('Cancel'));
    expect(queryByPlaceholderText('Enter port name')).toBeNull();
  });

  it('shows a validation error if required fields are empty on submit', async () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText('+ Add New Port'));
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all required fields.');
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('submits the form successfully with all data', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true });

    const { getByText, getByPlaceholderText } = renderComponent();
    fireEvent.press(getByText('+ Add New Port'));

    fireEvent.changeText(getByPlaceholderText('Enter port name'), 'Marina Del Rey');
    fireEvent.changeText(getByPlaceholderText('Enter location'), 'California');
    fireEvent.changeText(getByPlaceholderText('longitude'), '33.9803');
    fireEvent.changeText(getByPlaceholderText('latitude'), '-118.4517');
    fireEvent.changeText(getByPlaceholderText('Enter description'), 'A beautiful marina.');
    fireEvent.changeText(getByPlaceholderText('101,102,103'), '1,2');

    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/ports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Marina Del Rey',
          location: 'California',
          longitude: 33.9803,
          latitude: -118.4517,
          description: 'A beautiful marina.',
          imageIds: [1, 2],
          ownerId: 1,
        }),
      });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Port added!');
    });
  });

  it('handles server errors gracefully on submit', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const { getByText, getByPlaceholderText } = renderComponent();
    fireEvent.press(getByText('+ Add New Port'));

    fireEvent.changeText(getByPlaceholderText('Enter port name'), 'Error Port');
    fireEvent.changeText(getByPlaceholderText('Enter location'), 'Error Land');

    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to add port.');
    });
  });
});
