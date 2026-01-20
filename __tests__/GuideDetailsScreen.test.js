import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import GuideDetailsScreen from '../screens/GuideDetailsScreen';

// --- Mocking Dependencies ---

jest.mock('../components/Header', () => 'Header');

jest.mock('@env', () => ({
  EXPO_PUBLIC_AZURE: 'http://192.168.1.12:5000',
}));

global.fetch = jest.fn();

// --- Test Suite for GuideDetailsScreen ---

describe('GuideDetailsScreen', () => {
  
  const mockRoute = {
    params: {
      guideId: 1, // Use integer ID
    },
  };

  const mockGuideDetails = {
    id: 1,
    title: 'A Beautiful Day in the City',
    content: 'This is the detailed content of the guide about the city.',
    authorId: 123,
    publicationDate: '2023-10-27T10:00:00Z',
    images: ['https://example.com/image.jpg'],
  };

  beforeEach(() => {
    fetch.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show a loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {}));

    const { getByText } = render(<GuideDetailsScreen route={mockRoute} />);

    expect(getByText('Loading guide details...')).toBeTruthy();
  });

  it('should fetch and display guide details successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGuideDetails),
    });

    const { getByText } = render(<GuideDetailsScreen route={mockRoute} />);

    await waitFor(() => {
      expect(getByText('A Beautiful Day in the City')).toBeTruthy();
      expect(getByText('This is the detailed content of the guide about the city.')).toBeTruthy();
      expect(getByText('Author ID: 123')).toBeTruthy();
      expect(getByText(`Published on: ${new Date('2023-10-27T10:00:00Z').toLocaleDateString()}`)).toBeTruthy();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/guides/1');
  });

  it('should show information about loading guides', async () => {
    fetch.mockRejectedValueOnce(new Error('API is unavailable'));

    const { getByText } = render(<GuideDetailsScreen route={mockRoute} />);
	
    await waitFor(() => {
        expect(getByText('Loading guide details...')).toBeTruthy();
    });
  });

  it('should render correctly even if there are no images', async () => {
    const guideWithoutImage = { ...mockGuideDetails, images: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(guideWithoutImage),
    });
  
    const { queryByRole, getByText } = render(<GuideDetailsScreen route={mockRoute} />);
  
    await waitFor(() => {
      expect(getByText('A Beautiful Day in the City')).toBeTruthy();
      expect(queryByRole('image')).toBeNull();
    });
  });

});
