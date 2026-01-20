import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../screens/RegisterScreen';

// --- Mocking Dependencies ---

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    replace: mockReplace,
  }),
}));

const mockSetEmail = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    setEmail: mockSetEmail,
  }),
}));

global.fetch = jest.fn();

const fillOutForm = (getAllByPlaceholderText, getByPlaceholderText, getByText) => {
  const valueInputs = getAllByPlaceholderText('Value');
  const phoneInput = getByPlaceholderText('+48');

  fireEvent.changeText(valueInputs[0], 'John'); 
  fireEvent.changeText(valueInputs[1], 'Doe'); 
  fireEvent.changeText(valueInputs[2], 'john.doe@test.com');
  fireEvent.changeText(valueInputs[3], 'johndoe'); 
  fireEvent.changeText(valueInputs[4], 'password123');
  fireEvent.changeText(phoneInput, '123456789');

  fireEvent.press(getByText('Select User Type'));
  fireEvent.press(getByText('Sailor'));
};


// --- Test Suite for RegisterScreen ---

describe('RegisterScreen', () => {
  const mockNavigationProps = {
    replace: mockReplace,
  };

  beforeEach(() => {
    mockReplace.mockClear();
    mockSetEmail.mockClear();
    fetch.mockClear();
    jest.restoreAllMocks();
  });

  it('should render all form elements correctly', () => {
    const { getByText, getAllByText, getAllByPlaceholderText, getByPlaceholderText } = render(<RegisterScreen navigation={mockNavigationProps} />);
    
    expect(getAllByText('Register')).toHaveLength(2);
    expect(getAllByPlaceholderText('Value').length).toBe(5);
    expect(getByPlaceholderText('+48')).toBeTruthy();
    expect(getByText('Select User Type')).toBeTruthy();
    expect(getByText('Already have an account?')).toBeTruthy();
    expect(getByText('Sign in')).toBeTruthy();
  });

  it('should allow user to input data into an input field', () => {
    const { getAllByPlaceholderText } = render(<RegisterScreen navigation={mockNavigationProps} />);
    
    const nameInput = getAllByPlaceholderText('Value')[0];
    fireEvent.changeText(nameInput, 'Test Name');
    expect(nameInput.props.value).toBe('Test Name');
  });

  it('should open dropdown and allow user to select a type', () => {
    const { getByText } = render(<RegisterScreen navigation={mockNavigationProps} />);

    fireEvent.press(getByText('Select User Type'));
    expect(getByText('Sailor')).toBeTruthy();
    expect(getByText('Dock Owner')).toBeTruthy();

    fireEvent.press(getByText('Dock Owner'));
    expect(getByText('DOCK_OWNER')).toBeTruthy();
  });

  it('should show an alert if any field is empty on registration attempt', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getAllByText } = render(<RegisterScreen navigation={mockNavigationProps} />);
    const registerButton = getAllByText('Register')[1];

    fireEvent.press(registerButton);

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith("Error", "Please fill in all fields.");
  });
  
  it('should successfully register and go to Home on valid submission', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Success" }),
    });

    const { getAllByPlaceholderText, getByPlaceholderText, getByText, getAllByText } = render(<RegisterScreen navigation={mockNavigationProps} />);
    
    fillOutForm(getAllByPlaceholderText, getByPlaceholderText, getByText);
    const registerButton = getAllByText('Register')[1];
    fireEvent.press(registerButton);
    
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledWith("Success", "Registration successful!");
        expect(mockSetEmail).toHaveBeenCalledWith('john.doe@test.com');
        expect(mockReplace).toHaveBeenCalledWith('Home');
    });
  });

  it('should show an error message on failed registration', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Email already exists" }),
    });

    const { getAllByPlaceholderText, getByPlaceholderText, getByText, getAllByText } = render(<RegisterScreen navigation={mockNavigationProps} />);

    fillOutForm(getAllByPlaceholderText, getByPlaceholderText, getByText);
    const registerButton = getAllByText('Register')[1];
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Error", "Email already exists");
    });
  });

  it('should show an error alert on network failure', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    fetch.mockRejectedValueOnce(new Error("Network request failed"));

    const { getAllByPlaceholderText, getByPlaceholderText, getByText, getAllByText } = render(<RegisterScreen navigation={mockNavigationProps} />);

    fillOutForm(getAllByPlaceholderText, getByPlaceholderText, getByText);
    const registerButton = getAllByText('Register')[1];
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Error", "An error occurred. Please try again. Network request failed");
    });
  });

  it('should navigate to SignIn screen when the sign in button is pressed', () => {
    const { getByText } = render(<RegisterScreen navigation={mockNavigationProps} />);
    fireEvent.press(getByText('Sign in'));
    expect(mockReplace).toHaveBeenCalledWith('SignIn');
  });

});
