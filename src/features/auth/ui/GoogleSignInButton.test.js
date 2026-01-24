import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';

const GoogleSignIn = jest.requireActual('./GoogleSignInButton').default;

// --- react-redux mocks (controllable per test) ---
const mockDispatch = jest.fn();
const mockUseSelector = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => mockUseSelector(selector),
}));

// Thunk mock just so the import exists
jest.mock('../../../redux/slices/auth.slice', () => ({
  signInWithGoogle: jest.fn(() => ({ type: 'auth/signInWithGoogle' })),
}));


describe('GoogleSignInButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default Redux auth state: not loading
    mockUseSelector.mockImplementation((selector) =>
      selector({ auth: { loading: false } }),
    );

    // Default dispatch: does nothing (override per test)
    mockDispatch.mockImplementation(() => ({}));

    // Default NetInfo: online (override per test)
    NetInfo.fetch.mockResolvedValue({ isConnected: true });

    // Ensure performance + signInStartTimeGlobal exist
    if (typeof global.performance === 'undefined') {
      global.performance = { now: Date.now };
    }
    if (typeof global.signInStartTimeGlobal === 'undefined') {
      global.signInStartTimeGlobal = 0;
    }
  });

  it('renders the button when not loading', () => {
    const { getByTestId, queryByTestId } = render(<GoogleSignIn />);

    // Button is present
    expect(getByTestId('google-signin-button')).toBeTruthy();

    // Spinner is not shown in idle state
    expect(queryByTestId('loading-spinner')).toBeNull();
  });

  it('shows spinner when loading is true', () => {
    // Override selector to simulate loading
    mockUseSelector.mockImplementation((selector) =>
      selector({ auth: { loading: true } }),
    );

    const { getByTestId, queryByTestId } = render(<GoogleSignIn />);

    // Spinner is visible
    expect(getByTestId('loading-spinner')).toBeTruthy();

    // Label should not exist when loading
    expect(queryByTestId('sign-in-text')).toBeNull();
  });

  it('shows "No Internet" toast and does not dispatch when offline', async () => {
    // Not loading
    mockUseSelector.mockImplementation((selector) =>
      selector({ auth: { loading: false } }),
    );

    // NetInfo reports offline
    NetInfo.fetch.mockResolvedValue({ isConnected: false });

    const { getByTestId } = render(<GoogleSignIn />);

    fireEvent.press(getByTestId('google-signin-button'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'No Internet',
        text2: 'Please check connection.',
      });
    });

    // No sign-in attempt should be dispatched
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('dispatches signInWithGoogle and stores token on successful sign-in', async () => {
    // Not loading
    mockUseSelector.mockImplementation((selector) =>
      selector({ auth: { loading: false } }),
    );

    // Online
    NetInfo.fetch.mockResolvedValue({ isConnected: true });

    // dispatch returns an object with unwrap() that resolves with idToken
    const mockUnwrap = jest.fn().mockResolvedValue({ idToken: 'fake-token-123' });
    mockDispatch.mockImplementation(() => ({ unwrap: mockUnwrap }));

    const { getByTestId } = render(<GoogleSignIn />);

    fireEvent.press(getByTestId('google-signin-button'));

    await waitFor(() => {
      // dispatch was called with the thunk
      expect(mockDispatch).toHaveBeenCalled();

      // unwrap() was called
      expect(mockUnwrap).toHaveBeenCalled();

      // Token stored securely
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'userToken',
        'fake-token-123',
      );
    });

    // No error toast on success
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('shows error toast when sign-in fails and does not store token', async () => {
    // Not loading
    mockUseSelector.mockImplementation((selector) =>
      selector({ auth: { loading: false } }),
    );

    // Online
    NetInfo.fetch.mockResolvedValue({ isConnected: true });

    // unwrap rejects with an error
    const error = new Error('Boom');
    const mockUnwrap = jest.fn().mockRejectedValue(error);
    mockDispatch.mockImplementation(() => ({ unwrap: mockUnwrap }));

    const { getByTestId } = render(<GoogleSignIn />);

    fireEvent.press(getByTestId('google-signin-button'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Sign-In Failed',
        text2: 'Boom',
      });
    });

    // Should not attempt to store token on failure
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});
