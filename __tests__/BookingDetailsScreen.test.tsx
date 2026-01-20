import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';

// --- Mocks ---

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockInitPaymentSheet = jest.fn();
const mockPresentPaymentSheet = jest.fn();

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
        dockId: 101,
        price: 100,
        fromDate: '2023-10-10',
        toDate: '2023-10-12', // 2 nights
    },
  }),
}));

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1 },
  }),
}));

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: mockInitPaymentSheet,
    presentPaymentSheet: mockPresentPaymentSheet,
  }),
}));

// Mock Environment Variables
jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://test-api.com',
}));

// Mock Global Fetch
global.fetch = jest.fn();

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('BookingDetailsScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    mockInitPaymentSheet.mockClear();
    mockPresentPaymentSheet.mockClear();
    (fetch as jest.Mock).mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly and calculates initial cost', () => {
    const { getByText, getAllByText } = render(<BookingDetailsScreen />);

    // 2 nights * 100 PLN/night * 1 person = 200 PLN
    // Since "200 PLN" might appear multiple times or structure is complex
    // We check for presence.
    // Price per night: 100
    // Nights: 2
    // People: 1
    // Total: 200
    
    // Note: The structure in the component is complex, let's just check for values.
    expect(getByText('Booking Details')).toBeTruthy();
    expect(getByText('100 PLN')).toBeTruthy(); // Price per night
    // Total cost might be checked specifically if testID was added or distinct text used.
    // The component renders "200 PLN" for total.
    expect(getAllByText('200 PLN')).toBeTruthy();
  });

  it('updates total cost when number of people changes', () => {
    const { getByText, getAllByText } = render(<BookingDetailsScreen />);

    // Initially 1 person -> 200 PLN
    const plusButton = getByText('+');
    fireEvent.press(plusButton); // Now 2 people

    // 2 nights * 100 PLN * 2 people = 400 PLN
    expect(getAllByText('400 PLN')).toBeTruthy();

    const minusButton = getByText('-');
    fireEvent.press(minusButton); // Back to 1 person
    expect(getAllByText('200 PLN')).toBeTruthy();
  });

  it('creates a standard booking successfully (Book Now)', async () => {
    const { getByText } = render(<BookingDetailsScreen />);
    
    // Mock successful fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
    });

    const bookNowButton = getByText('Book now');
    fireEvent.press(bookNowButton);

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"paymentMethod":"ONLINE"'), // Component sets ONLINE for both? Or maybe just ensure structure.
                // The current code sets "ONLINE" for standard booking too in handleBookNow
            })
        );
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Booking created!");
        expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('handles standard booking failure', async () => {
    const { getByText } = render(<BookingDetailsScreen />);
    
    // Mock failed fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
    });

    const bookNowButton = getByText('Book now');
    fireEvent.press(bookNowButton);

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to create booking.");
    });
  });

  it('initiates "Book & Pay Online" flow successfully', async () => {
    const { getByText } = render(<BookingDetailsScreen />);
    
    // 1. Mock create-and-pay response
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
            clientSecret: 'secret_123',
            booking: { id: 999 }
        })
    });

    // 2. Mock Stripe Init Success
    mockInitPaymentSheet.mockResolvedValue({ error: null });

    // 3. Mock Stripe Present Success
    mockPresentPaymentSheet.mockResolvedValue({ error: null });

    // 4. Mock Update Booking to PAID success
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
    }); // This mock is queued for the *second* fetch call

    const payButton = getByText('Book & Pay Online');
    fireEvent.press(payButton);

    await waitFor(() => {
        // Check first call (create booking)
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/bookings/create-and-pay'),
            expect.any(Object)
        );
        
        // Check Stripe init
        expect(mockInitPaymentSheet).toHaveBeenCalledWith(expect.objectContaining({
            paymentIntentClientSecret: 'secret_123'
        }));

        // Check Stripe present
        expect(mockPresentPaymentSheet).toHaveBeenCalled();

        // Check Update call
        expect(fetch).toHaveBeenCalledWith(
             expect.stringContaining('/bookings/999'),
             expect.objectContaining({
                 method: 'PUT',
                 body: expect.stringContaining('"paymentStatus":"PAID"')
             })
        );
        
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Payment complete and booking updated!");
        expect(mockNavigate).toHaveBeenCalledWith("Home");
    });
  });

  it('handles payment cancellation or failure', async () => {
     const { getByText } = render(<BookingDetailsScreen />);
    
    // 1. Mock create-and-pay response
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
            clientSecret: 'secret_123',
            booking: { id: 999 }
        })
    });

    // 2. Mock Stripe Init Success
    mockInitPaymentSheet.mockResolvedValue({ error: null });

    // 3. Mock Stripe Present FAILURE
    mockPresentPaymentSheet.mockResolvedValue({ 
        error: { message: 'User cancelled' } 
    });

    const payButton = getByText('Book & Pay Online');
    fireEvent.press(payButton);

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Payment Failed", "User cancelled");
        // Should NOT navigate or update booking
        expect(fetch).toHaveBeenCalledTimes(1); // only the creation
        expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('handles failure to initialize payment sheet', async () => {
    const { getByText } = render(<BookingDetailsScreen />);
    
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
            clientSecret: 'secret_123',
            booking: { id: 999 }
        })
    });

    mockInitPaymentSheet.mockResolvedValue({ 
        error: { message: 'Network error' } 
    });

    const payButton = getByText('Book & Pay Online');
    fireEvent.press(payButton);

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Stripe Error", "Network error");
        expect(mockPresentPaymentSheet).not.toHaveBeenCalled();
    });
  });
});
