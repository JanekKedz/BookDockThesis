import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GuideListingsScreen from '../screens/GuideListingScreen'; // Corrected path

// --- Mocking Dependencies ---

jest.mock('../components/Header', () => 'Header');

jest.mock('../components/GuideCard', () => {
  const { Text } = require('react-native');
  return (props) => <Text onPress={props.onPress}>GuideCard</Text>;
});

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

global.fetch = jest.fn();

// --- Test Suite for GuideListingsScreen ---

describe('GuideListingsScreen', () => {
  const mockNavigationProps = {
    navigate: mockNavigate,
  };

  const mockGuides = [
    { id: 1, title: 'Historic Old Town', latitude: 52.249, longitude: 21.012 },
    { id: 2, title: 'Royal Lazienki Park', latitude: 52.215, longitude: 21.032 },
    { id: 3, title: 'Vistula Riverside', latitude: 52.251, longitude: 21.025 },
  ];

  beforeEach(() => {
    mockNavigate.mockClear();
    fetch.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render initial UI elements and fetch guides', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGuides),
    });

    const { getByPlaceholderText, findAllByText } = render(<GuideListingsScreen navigation={mockNavigationProps} />);

    expect(getByPlaceholderText('Search by title')).toBeTruthy();

    const guideCards = await findAllByText('GuideCard');
    expect(guideCards).toHaveLength(3);
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/guides');
  });

  it('should show a placeholder when no guides are found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { findByText } = render(<GuideListingsScreen navigation={mockNavigationProps} />);

    const placeholder = await findByText('No guides found');
    expect(placeholder).toBeTruthy();
  });

  it('should filter guides based on search query', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGuides),
    });

    const { getByPlaceholderText, findAllByText } = render(<GuideListingsScreen navigation={mockNavigationProps} />);
    
    await findAllByText('GuideCard');

    const searchInput = getByPlaceholderText('Search by title');
    fireEvent.changeText(searchInput, 'Royal');

    const filteredCards = await findAllByText('GuideCard');
    expect(filteredCards).toHaveLength(1);
  });
  
  it('should handle API fetch error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API is down'));

    render(<GuideListingsScreen navigation={mockNavigationProps} />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to fetch guides:', expect.any(Error));
    });
  });

  it('should navigate to GuideDetailsScreen on guide press', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGuides),
    });

    const { findAllByText } = render(<GuideListingsScreen navigation={mockNavigationProps} />);
    
    const guideCards = await findAllByText('GuideCard');
    
    fireEvent.press(guideCards[0]);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('GuideDetailsScreen', { guideId: 1 });
  });

});
