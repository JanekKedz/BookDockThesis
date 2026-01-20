import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import BookingListingsScreen from '../screens/BookingListingsScreen'; // Corrected filename

// --- Mocking Dependencies ---

// Mock AuthContext to provide a user ID
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 123 } }),
}));

// Mock navigation hooks (though the component doesn't use them for navigation actions)
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../components/Header', () => 'Header');

// Mock global fetch
global.fetch = jest.fn();

// --- Test Data ---

// Updated mock data to match the structure rendered by the component
const mockBookings = [
  {
    id: 1,
    sailorId: 123,
    dockId: 101,
    startDate: '2024-09-01',
    endDate: '2024-09-03',
    people: 2,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
  },
  {
    id: 2,
    sailorId: 123,
    dockId: 102,
    startDate: '2024-10-15',
    endDate: '2024-10-20',
    people: 4,
    paymentMethod: 'PayPal',
    paymentStatus: 'PENDING',
  },
];

// --- Test Suite for BookingListingsScreen ---

describe('BookingListingsScreen', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch and display a list of bookings correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve(mockBookings)
    });

    const { getByText } = render(<BookingListingsScreen />);

    await waitFor(() => {
      // Assert that the correct text is rendered based on the component's structure
      expect(getByText('Booking #1')).toBeTruthy();
      expect(getByText('Sailor ID: 123')).toBeTruthy();
      expect(getByText('Status: PAID')).toBeTruthy();
      
      expect(getByText('Booking #2')).toBeTruthy();
      expect(getByText('Dock ID: 102')).toBeTruthy();
      expect(getByText('Status: PENDING')).toBeTruthy();
    });

    // Assert the correct fetch URL is used
    expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/bookings/sailor/123');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should display a message when there are no bookings', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    const { getByText } = render(<BookingListingsScreen />);

    await waitFor(() => {
      // Assert the correct placeholder text is shown
      expect(getByText("You don't have any bookings yet.")).toBeTruthy();
    });
  });

  it('should handle API fetch error gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API is down'));

    const { getByText } = render(<BookingListingsScreen />);

    await waitFor(() => {
      // The component should log an error and show the placeholder text
      expect(console.error).toHaveBeenCalledWith('Failed to fetch bookings:', expect.any(Error));
      expect(getByText("You don't have any bookings yet.")).toBeTruthy();
    });
  });

  it('should render a search input field', () => {
    const { getByPlaceholderText } = render(<BookingListingsScreen />);
    expect(getByPlaceholderText('Search by any field')).toBeTruthy();
  });
});
