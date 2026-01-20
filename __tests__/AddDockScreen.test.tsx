import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddDockScreen from '../screens/AddDockScreen';

// Mock dependencies
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1 } }), // Use integer ID
}));

jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://192.168.1.12:5000',
}));

// The fragile mock of Alert's internal path has been removed.

global.fetch = jest.fn();

const mockNavigation = {
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    portId: 123, // Use integer ID
  },
};

describe('AddDockScreen', () => {
  beforeEach(() => {
    // Clear mock history before each test
    (fetch as jest.Mock).mockClear();
    mockNavigation.goBack.mockClear();
    
    // Spy on Alert.alert to create a fresh, silent mock for each test
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all mocks after each test to ensure isolation
    jest.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <AddDockScreen navigation={mockNavigation} route={mockRoute} />
    );

  it('renders all input fields and the submit button', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    expect(getByPlaceholderText('Dock Name')).toBeTruthy();
    expect(getByPlaceholderText('Location')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
    expect(getByPlaceholderText('Services (comma separated)')).toBeTruthy();
    expect(getByPlaceholderText('Services Pricing')).toBeTruthy();
    expect(getByPlaceholderText('Price Per Night')).toBeTruthy();
    expect(getByPlaceholderText('Price Per Person')).toBeTruthy();
    expect(getByText('Add Dock')).toBeTruthy();
  });

  it('shows a validation error if required fields are empty on submit', async () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText('Add Dock'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields.');
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('submits the form successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const { getByPlaceholderText, getByText } = renderComponent();

    // Fill out the form
    fireEvent.changeText(getByPlaceholderText('Dock Name'), 'Test Dock');
    fireEvent.changeText(getByPlaceholderText('Location'), 'Test Location');
    fireEvent.changeText(getByPlaceholderText('Description'), 'A great dock.');
    fireEvent.changeText(getByPlaceholderText('Services (comma separated)'), 'Water, Electricity');
    fireEvent.changeText(getByPlaceholderText('Services Pricing'), '50');
    fireEvent.changeText(getByPlaceholderText('Price Per Night'), '100');
    fireEvent.changeText(getByPlaceholderText('Price Per Person'), '10');

    // Submit the form
    fireEvent.press(getByText('Add Dock'));

    // Assertions
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/docking-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Dock',
          location: 'Test Location',
          description: 'A great dock.',
          ownerId: 1,
          portId: 123,
          services: 'Water, Electricity',
          servicesPricing: 50,
          pricePerNight: 100,
          pricePerPerson: 10,
        }),
      });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Dock added successfully!');
    });

    await waitFor(() => {
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('shows an error alert if the server returns an error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const { getByPlaceholderText, getByText } = renderComponent();

    // Fill out the form
    fireEvent.changeText(getByPlaceholderText('Dock Name'), 'Test Dock');
    fireEvent.changeText(getByPlaceholderText('Location'), 'Test Location');
    fireEvent.changeText(getByPlaceholderText('Description'), 'A great dock.');
    fireEvent.changeText(getByPlaceholderText('Services (comma separated)'), 'Water, Electricity');
    fireEvent.changeText(getByPlaceholderText('Services Pricing'), '50');
    fireEvent.changeText(getByPlaceholderText('Price Per Night'), '100');
    fireEvent.changeText(getByPlaceholderText('Price Per Person'), '10');
    
    // Submit
    fireEvent.press(getByText('Add Dock'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to add dock.');
    });
  });

   it('shows a generic error alert if fetch throws an error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

    const { getByPlaceholderText, getByText } = renderComponent();

    // Fill out the form
    fireEvent.changeText(getByPlaceholderText('Dock Name'), 'Test Dock');
    fireEvent.changeText(getByPlaceholderText('Location'), 'Test Location');
    fireEvent.changeText(getByPlaceholderText('Description'), 'A great dock.');
    fireEvent.changeText(getByPlaceholderText('Services (comma separated)'), 'Water, Electricity');
    fireEvent.changeText(getByPlaceholderText('Services Pricing'), '50');
    fireEvent.changeText(getByPlaceholderText('Price Per Night'), '100');
    fireEvent.changeText(getByPlaceholderText('Price Per Person'), '10');
    
    // Submit
    fireEvent.press(getByText('Add Dock'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Could not add dock.');
    });
  });
});
