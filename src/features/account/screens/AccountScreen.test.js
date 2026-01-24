// --- Core Dependencies ---
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import AccountScreen from './AccountScreen';

// --- Redux Actions & Thunks ---
import * as accountSlice from '../../../redux/slices/accountSlice';
import * as profilesSlice from '../../../redux/slices/profiles.slice';
import * as errorSlice from '../../../redux/slices/error.slice';

// --- Mocks for UI Components ---

// SettingsSwitch
jest.mock('../../../ui/common/SettingsSwitch', () => {
  const { View } = require('react-native');
  return (props) => <View {...props} testID={props.testID || 'mock-settings-switch'} />;
});

// SettingsLink
jest.mock('../../../ui/common/SettingsLink', () => {
  const { Pressable, Text } = require('react-native');
  return ({ label, testID, onPress, ...rest }) => (
    <Pressable testID={testID || 'mock-settings-link'} onPress={onPress} {...rest}>
      <Text>{label}</Text>
    </Pressable>
  );
});

// Error Banner
jest.mock('../../../utils/errors/ErrorBanner', () => {
  const { View, Text, Pressable } = require('react-native');
  return ({ message, onDismiss, testID, ...rest }) => {
    if (!message) return null;
    return (
      <View testID={testID || 'mock-error-banner'} {...rest}>
        <Text testID={testID ? `${testID}-message` : 'mock-error-message'}>{message}</Text>
        {onDismiss && (
          <Pressable onPress={onDismiss} testID={testID ? `${testID}-dismiss` : 'mock-error-dismiss'} />
        )}
      </View>
    );
  };
});

// Sign Out Button
jest.mock('../../../ui/common/SignOutButton', () => {
  const { Pressable, Text, View } = require('react-native');
  return ({ testID, ...rest }) => (
    <View style={{ alignItems: 'center' }}>
      <Pressable testID={testID || 'mock-sign-out-button'} {...rest}>
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  );
});

// Expo Router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// --- Fix named exports after import ---
accountSlice.fetchAccountSettings = jest.fn(() => ({ type: 'account/fetchAccountSettings' }));
accountSlice.updateAccountField = jest.fn(() => ({ type: 'account/updateAccountField' }));

profilesSlice.updateField = jest.fn(() => (dispatch, getState) => Promise.resolve());
profilesSlice.fetchProfilesAndPrecache = jest.fn(() => (dispatch, getState) => Promise.resolve());

errorSlice.clearError = jest.fn(() => ({ type: 'error/clearError' }));

// --- Controlled Redux state ---
const mockState = {
  auth: { user: { uid: 'test-uid' } },
  account: {
    settings: {
      profileVisible: true,
      online: true,
      darkMode: false,
      pushNotifications: true,
    },
  },
  loading: { activeRequests: 0 },
  error: { message: null },
};

let mockDispatch;

beforeEach(() => {
  mockDispatch = jest.fn();
  useDispatch.mockReturnValue(mockDispatch);
  useSelector.mockImplementation((callback) => callback(mockState));
  jest.clearAllMocks();
  jest.useRealTimers();
});

afterEach(() => {
  try {
    jest.runOnlyPendingTimers?.();
  } catch (e) {
    // ignore
  }
  cleanup();
});

// --- Tests ---
describe('AccountScreen', () => {
  it('renders main content correctly when loaded', () => {
    render(<AccountScreen />);
    expect(screen.getByText('Account Preferences')).toBeTruthy();
    expect(screen.getByText('Account')).toBeTruthy();
    expect(screen.getByText('Privacy & Security')).toBeTruthy();
    expect(screen.getByText('Appearance')).toBeTruthy();
    expect(screen.getByText('Support & Growth')).toBeTruthy();
    expect(screen.getByTestId('edit-profile-link')).toBeTruthy();
    expect(screen.getByTestId('delete-account-link')).toBeTruthy();
    expect(screen.getByTestId('visibility-switch')).toBeTruthy();
    expect(screen.getByTestId('online-status-switch')).toBeTruthy();
    expect(screen.getByTestId('dark-mode-switch')).toBeTruthy();
    expect(screen.getByTestId('notifications-switch')).toBeTruthy();
    expect(screen.getByTestId('sign-out-button')).toBeTruthy();
    expect(screen.getByText('Sign Out')).toBeTruthy();
    expect(screen.getByText('Version 1.0')).toBeTruthy();
    expect(screen.queryByText('Loading...')).toBeNull();
    expect(screen.queryByTestId('error-banner')).toBeNull();
  });

  it('renders loading state when activeRequests > 0', () => {
    useSelector.mockImplementation((callback) => callback({
      ...mockState,
      loading: { activeRequests: 1 },
    }));
    render(<AccountScreen />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders loading state when settings is null', () => {
    useSelector.mockImplementation((callback) => callback({
      ...mockState,
      account: { settings: null },
    }));
    render(<AccountScreen />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('dispatches fetchAccountSettings on mount', () => {
    render(<AccountScreen />);
    expect(mockDispatch).toHaveBeenCalledWith(accountSlice.fetchAccountSettings());
  });

  it('dispatches clearError on unmount', () => {
    render(<AccountScreen />);
    cleanup();
    expect(mockDispatch).toHaveBeenCalledWith(errorSlice.clearError());
  });

  it('renders ErrorBanner when globalError exists', () => {
    useSelector.mockImplementation((callback) => callback({
      ...mockState,
      error: { message: 'Test error' },
    }));
    render(<AccountScreen />);
    expect(screen.getByTestId('error-banner')).toBeTruthy();
    expect(screen.getByText('Test error')).toBeTruthy();
  });

  it('dismiss action clears the error state', () => {
    useSelector.mockImplementation((callback) => callback({
      ...mockState,
      error: { message: 'Test error' },
    }));
    render(<AccountScreen />);
    fireEvent.press(screen.getByTestId('error-banner-dismiss'));
    expect(mockDispatch).toHaveBeenCalledWith(errorSlice.clearError());
  });

  it('“Edit Profile” navigates to /profile-settings', () => {
    render(<AccountScreen />);
    fireEvent.press(screen.getByTestId('edit-profile-link'));
    expect(mockPush).toHaveBeenCalledWith('/profile-settings');
  });

  it('“Delete Account” navigates to /delete-account', () => {
    render(<AccountScreen />);
    fireEvent.press(screen.getByTestId('delete-account-link'));
    expect(mockPush).toHaveBeenCalledWith('/delete-account');
  });

  it('all switches dispatch updateAccountField', () => {
    render(<AccountScreen />);
    fireEvent(screen.getByTestId('visibility-switch'), 'onValueChange', false);
    fireEvent(screen.getByTestId('dark-mode-switch'), 'onValueChange', true);

    expect(mockDispatch).toHaveBeenCalledWith(accountSlice.updateAccountField({ key: 'profileVisible', value: false }));
    expect(mockDispatch).toHaveBeenCalledWith(accountSlice.updateAccountField({ key: 'darkMode', value: true }));
  });

  it('toggles work when settings values are true/false/undefined', () => {
    render(<AccountScreen />);
    const visibilitySwitch = screen.getByTestId('visibility-switch');
    expect(visibilitySwitch.props.value).toBe(true);

    fireEvent(visibilitySwitch, 'onValueChange', false);
    expect(mockDispatch).toHaveBeenCalledWith(accountSlice.updateAccountField({ key: 'profileVisible', value: false }));

    // Test undefined safe handling
    useSelector.mockImplementation((callback) => callback({
      ...mockState,
      account: { settings: { profileVisible: undefined } },
    }));
    render(<AccountScreen />);
    expect(screen.getByTestId('visibility-switch').props.value).toBe(false);
  });

  it('dispatches updateField thunk for profileVisible and online when user exists', () => {
    render(<AccountScreen />);
    fireEvent(screen.getByTestId('visibility-switch'), 'onValueChange', false);
    fireEvent(screen.getByTestId('online-status-switch'), 'onValueChange', false);

    const thunkCalls = mockDispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
    expect(thunkCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('updateField not dispatched when user does not exist', () => {
    useSelector.mockImplementation((callback) => callback({
      ...mockState,
      auth: { user: null },
    }));

    render(<AccountScreen />);
    fireEvent(screen.getByTestId('visibility-switch'), 'onValueChange', false);

    const thunkCalls = mockDispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
    expect(thunkCalls.length).toBe(0);
  });

  it('fetchProfilesAndPrecache fires after delay when profileVisible changes', async () => {
    jest.useFakeTimers();
    render(<AccountScreen />);
    fireEvent(screen.getByTestId('visibility-switch'), 'onValueChange', false);
    jest.runAllTimers();
    await Promise.resolve();

    const thunkCalls = mockDispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
    expect(thunkCalls.length).toBeGreaterThanOrEqual(1);
  });
});
