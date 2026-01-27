// 🔥 Full Synchronized AccountScreen.test.js
import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import AccountScreen from './AccountScreen';

// 1. Import the synchronized mock object
import { __mockRouter } from '../../../../global.mocks'; 

// 2. Mock the slice actions as spies
import * as accountSlice from '../../../redux/slices/accountSlice';
jest.mock('../../../redux/slices/accountSlice', () => ({
  fetchAccountSettings: jest.fn(() => ({ type: 'fetch' })),
  updateAccountField: jest.fn((payload) => ({ type: 'update', payload })),
}));

const mockState = {
  auth: { user: { uid: 'test-uid' } },
  account: { settings: { profileVisible: true, online: true } },
  loading: { activeRequests: 0 },
  error: { message: null },
};

describe('AccountScreen', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation((selector) => selector(mockState));
    
    jest.clearAllMocks();
    jest.useFakeTimers(); // Fixes the background timer leak
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers(); // Kills the handleToggle timeout
    });
    jest.useRealTimers();
    cleanup();
  });

  it('navigates to Edit Profile using the global mock', () => {
    render(<AccountScreen />);
    
    // Using getAllBy because of the duplicate ID in the component
    const links = screen.getAllByTestId('edit-profile-link');
    fireEvent.press(links[0]);

    // Now matches global.mocks.js exactly
    expect(__mockRouter.mockPush).toHaveBeenCalledWith('/profile-settings');
  });

  it('dispatches updateAccountField on toggle', () => {
    render(<AccountScreen />);
    const visibilitySwitch = screen.getByTestId('visibility-switch-switch');
    
    fireEvent(visibilitySwitch, 'onValueChange', false);
    
    expect(accountSlice.updateAccountField).toHaveBeenCalledWith({
      key: 'profileVisible',
      value: false,
    });
  });
});