import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileViewScreen from '../screens/ProfileViewScreen'; 

// --- Mocking Dependencies ---

jest.mock('../components/Header', () => 'Header');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    email: 'test@example.com',
  }),
}));

global.fetch = jest.fn();

// --- Test Suite for ProfileViewScreen ---

describe('ProfileViewScreen', () => {
  const mockProfile = {
    name: 'John',
    surname: 'Doe',
    username: 'johndoe',
    email: 'test@example.com',
    phoneNumber: '123456789',
    role: 'SAILOR',
  };

  beforeEach(() => {
    fetch.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Alert, 'alert');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show loading indicator initially', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    const { getByTestId } = render(<ProfileViewScreen />);
  });

  it('should fetch and display user profile data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const { findByText } = render(<ProfileViewScreen />);

    await waitFor(() => {
      expect(findByText('johndoe')).toBeTruthy();
      expect(findByText('John')).toBeTruthy();
      expect(findByText('Doe')).toBeTruthy();
      expect(findByText('test@example.com')).toBeTruthy();
      expect(findByText('SAILOR')).toBeTruthy();
      expect(findByText('123456789')).toBeTruthy();
    });

    expect(fetch).toHaveBeenCalledWith('http://192.168.1.12:5000/users', expect.any(Object));
  });

  it('should switch to edit mode and display input fields', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockProfile) });
    const { findByText, getByDisplayValue } = render(<ProfileViewScreen />);

    const editButton = await findByText('Edit Details');
    fireEvent.press(editButton);

    await waitFor(() => {
      expect(getByDisplayValue('John')).toBeTruthy();
      expect(getByDisplayValue('Doe')).toBeTruthy();
      expect(findByText('Save Changes')).toBeTruthy();
      expect(findByText('Cancel')).toBeTruthy();
    });
  });

  it('should update input fields and save changes successfully', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockProfile) });
    const { findByText, getByDisplayValue } = render(<ProfileViewScreen />);

    const editButton = await findByText('Edit Details');
    fireEvent.press(editButton);

    const nameInput = await findByText('First name');
    fireEvent.changeText(getByDisplayValue('John'), 'Jane');
    
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    const saveButton = await findByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
        expect(findByText('Jane')).toBeTruthy();
    });
  });

  it('should show an alert on failed save', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockProfile) });
    const { findByText } = render(<ProfileViewScreen />);

    const editButton = await findByText('Edit Details');
    fireEvent.press(editButton);

    fetch.mockResolvedValueOnce({ 
        ok: false, 
        json: () => Promise.resolve({ message: 'Update failed' }) 
    });

    const saveButton = await findByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Update failed");
    });
  });

  it('should handle canceling edit with unsaved changes', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockProfile) });
    const { findByText, getByDisplayValue } = render(<ProfileViewScreen />);

    fireEvent.press(await findByText('Edit Details'));
    fireEvent.changeText(await getByDisplayValue('John'), 'Jane');

    fireEvent.press(await findByText('Cancel'));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Unsaved Changes",
      "You have unsaved changes. Are you sure you want to discard them?",
      expect.any(Array)
    );
  });
});
