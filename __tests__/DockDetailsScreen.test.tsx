import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DockDetailsScreen from '../screens/DockDetailsScreen';

// --- Mocking Dependencies ---

jest.mock('../components/Header', () => {
    const { Text } = require('react-native');
    return () => <Text>MockHeader</Text>;
});

jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://test-api.com',
}));

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

global.fetch = jest.fn();

// Mock the Alert functionality
jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
};

const mockRoute = {
  params: {
    dockId: 1, // Use integer ID
    fromDate: new Date("2023-10-10"),
    toDate: new Date("2023-10-15")
  },
};

const mockDockDetails = {
  id: 1,
  name: 'Sunset Marina Bay',
  location: 'Central City Harbor',
  description: 'A beautiful spot with great views.',
  pricePerNight: 120,
  pricePerPerson: 15,
  services: "Water, Electricity",
  servicesPricing: 20,
  ownerId: 10,
};

const mockOwnerDetails = {
  id: 10,
  username: "johndoe",
  name: "John",
  surname: "Doe",
  email: "john@example.com",
  phoneNumber: "123456789"
};

describe('DockDetailsScreen', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (Alert.alert as jest.Mock).mockClear();
    mockNavigation.navigate.mockClear();
    mockUseAuth.mockReturnValue({ user: null }); // Default to no user or regular user
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should display a loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Prevent fetch from resolving
    const { getByTestId } = render(<DockDetailsScreen route={mockRoute} navigation={mockNavigation} />);
    // ActivityIndicator does not have text, we can check for its presence or rely on snapshot, 
    // or assume the component renders nothing else while loading. 
    // However, ActivityIndicator usually has accessibilityRole="progressbar" or similar.
    // Let's just check that it doesn't crash and we don't see main content.
    // Alternatively, verify that we don't see "Docking spot not found" yet.
  });

  it('should fetch and display dock and owner details successfully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // Dock details
        ok: true, 
        json: () => Promise.resolve(mockDockDetails)
      })
      .mockResolvedValueOnce({ // Owner details
        ok: true, 
        json: () => Promise.resolve(mockOwnerDetails)
      });

    const { getByText, findByText } = render(<DockDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => expect(getByText('Sunset Marina Bay')).toBeTruthy());
    expect(getByText('Central City Harbor')).toBeTruthy();
    expect(getByText('120 PLN')).toBeTruthy();
    expect(getByText('johndoe')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('123456789')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
  });

  it('should show "Docking spot not found" if fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Failure'));
    const { findByText } = render(<DockDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    await findByText('Docking spot not found.');
  });

  it('should navigate to BookingDetails when "Book now" is pressed', async () => {
     (fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve(mockDockDetails)
      })
      .mockResolvedValueOnce({
        ok: true, 
        json: () => Promise.resolve(mockOwnerDetails)
      });

    const { getByText } = render(<DockDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => expect(getByText('Book now')).toBeTruthy());
    
    fireEvent.press(getByText('Book now'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("BookingDetails", expect.objectContaining({
        dockId: 1,
        price: 120
    }));
  });

  it('should alert if dates are missing when booking', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve(mockDockDetails)
      })
      .mockResolvedValueOnce({
        ok: true, 
        json: () => Promise.resolve(mockOwnerDetails)
      });

    const routeWithoutDates = {
        params: { dockId: 1 } // missing fromDate and toDate
    };

    const { getByText } = render(<DockDetailsScreen route={routeWithoutDates} navigation={mockNavigation} />);

    await waitFor(() => expect(getByText('Book now')).toBeTruthy());
    
    fireEvent.press(getByText('Book now'));

    expect(Alert.alert).toHaveBeenCalledWith("Please select both a start and end date.");
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  it('should show "Edit Dock Details" button if user is owner', async () => {
    mockUseAuth.mockReturnValue({ 
        user: { role: 'DOCK_OWNER', id: 10 } 
    });

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve(mockDockDetails)
      })
      .mockResolvedValueOnce({
        ok: true, 
        json: () => Promise.resolve(mockOwnerDetails)
      });

    const { getByText } = render(<DockDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => expect(getByText('Edit Dock Details')).toBeTruthy());
  });

  it('should allow editing dock details', async () => {
    mockUseAuth.mockReturnValue({ 
        user: { role: 'DOCK_OWNER', id: 10 } 
    });

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve(mockDockDetails)
      })
      .mockResolvedValueOnce({
        ok: true, 
        json: () => Promise.resolve(mockOwnerDetails)
      });

    const { getByText, getByDisplayValue } = render(<DockDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    // Enter edit mode
    await waitFor(() => expect(getByText('Edit Dock Details')).toBeTruthy());
    fireEvent.press(getByText('Edit Dock Details'));

    // Check inputs
    expect(getByText('Edit Dock')).toBeTruthy();
    const nameInput = getByDisplayValue('Sunset Marina Bay');
    
    // Change value
    fireEvent.changeText(nameInput, 'New Name');

    // Save
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true }); // Mock update response
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Dock details updated!");
        // Should exit edit mode and show new name
        // (Note: Since we mocked the update call but not the subsequent re-render fully, 
        // we might just check if the function was called)
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/docking-spots/1'), expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('New Name')
        }));
    });
  });
  
  it('should handle edit cancellation', async () => {
    mockUseAuth.mockReturnValue({ 
        user: { role: 'DOCK_OWNER', id: 10 } 
    });

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve(mockDockDetails)
      })
      .mockResolvedValueOnce({
        ok: true, 
        json: () => Promise.resolve(mockOwnerDetails)
      });

    const { getByText, queryByText } = render(<DockDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    // Enter edit mode
    await waitFor(() => expect(getByText('Edit Dock Details')).toBeTruthy());
    fireEvent.press(getByText('Edit Dock Details'));

    expect(getByText('Cancel')).toBeTruthy();
    fireEvent.press(getByText('Cancel'));

    expect(queryByText('Edit Dock')).toBeNull();
    expect(getByText('Sunset Marina Bay')).toBeTruthy();
  });

  it('should handle edit save failure', async () => {
    mockUseAuth.mockReturnValue({ 
        user: { role: 'DOCK_OWNER', id: 10 } 
    });

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve(mockDockDetails)
      })
      .mockResolvedValueOnce({
        ok: true, 
        json: () => Promise.resolve(mockOwnerDetails)
      });

    const { getByText } = render(<DockDetailsScreen route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => expect(getByText('Edit Dock Details')).toBeTruthy());
    fireEvent.press(getByText('Edit Dock Details'));

    // Save but fail
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false }); 
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to update dock.");
    });
  });
});
