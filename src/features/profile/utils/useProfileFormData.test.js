import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import { useProfileData } from './useProfileFormData';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileData } from '../../../redux/slices/profile.slice';
import { callGetUserProfile } from '../../../utils/apiUtilities/api';

// --- Local mocks for the slice & api used by the hook ---

jest.mock('../../../redux/slices/profile.slice', () => ({
  setProfileData: jest.fn((payload) => ({
    type: 'SET_PROFILE_DATA',
    payload,
  })),
}));


const mockDispatch = jest.fn();

// Helper to simulate Redux state
const mockSelectorState = (authState, profileState) => {
  useSelector.mockImplementation((selectorFn) =>
    selectorFn({
      auth: authState,
      profile: profileState,
    })
  );
};

// Test harness: a simple component that uses the hook
const HookTestComponent = ({ onRender }) => {
  const hookValue = useProfileData();
  onRender(hookValue);
  return null;
};

beforeEach(() => {
  jest.clearAllMocks();
  // useDispatch is defined as a jest.fn in global.mocks.js, we override its return
  useDispatch.mockReturnValue(mockDispatch);
});

describe('useProfileData', () => {
  it('uses storedProfileData when available and does not call callGetUserProfile', async () => {
    const storedProfile = {
      displayName: 'Jane Doe',
      currYear: '3',
      accountType: 'Student',
    };

    mockSelectorState(
      { user: { uid: 'user-123' } },
      { data: storedProfile }
    );

    let latest;
    const onRender = (value) => {
      latest = value;
    };

    render(<HookTestComponent onRender={onRender} />);

    await waitFor(() => {
      expect(latest).toBeDefined();
      // prepareInitialData should coerce currYear to number
      expect(latest.initialValues).toEqual({
        displayName: 'Jane Doe',
        currYear: 3,
        accountType: 'Student',
      });
    });

    expect(latest.loading).toBe(false);
    expect(latest.error).toBeNull();
    expect(latest.accountType).toBe('student');

    // Should NOT call API if we already have stored profile data
    expect(callGetUserProfile).not.toHaveBeenCalled();
    expect(setProfileData).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('fetches profile from API when no storedProfileData is present', async () => {
    const apiProfile = {
      displayName: 'John Smith',
      currYear: '2',
      accountType: 'Resident',
    };

    mockSelectorState(
      { user: { uid: 'user-456' } },
      { data: {} }
    );

    callGetUserProfile.mockResolvedValueOnce(apiProfile);

    let latest;
    const onRender = (value) => {
      latest = value;
    };

    render(<HookTestComponent onRender={onRender} />);

    // Wait for final resolved state
    await waitFor(() => {
      expect(latest).toBeDefined();
      expect(latest.loading).toBe(false);
      expect(latest.initialValues).toEqual({
        displayName: 'John Smith',
        currYear: 2,
        accountType: 'Resident',
      });
      expect(latest.error).toBeNull();
      expect(latest.accountType).toBe('resident');
    });

    // API called (no args, backend uses auth)
    expect(callGetUserProfile).toHaveBeenCalledTimes(1);
    expect(callGetUserProfile).toHaveBeenCalledWith();

    // setProfileData dispatched with prepared data
    expect(setProfileData).toHaveBeenCalledTimes(1);
    expect(setProfileData).toHaveBeenCalledWith({
      displayName: 'John Smith',
      currYear: 2,
      accountType: 'Resident',
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      setProfileData({
        displayName: 'John Smith',
        currYear: 2,
        accountType: 'Resident',
      })
    );
  });

  it('sets an error when API call fails', async () => {
    mockSelectorState(
      { user: { uid: 'user-789' } },
      { data: {} }
    );

    callGetUserProfile.mockRejectedValueOnce(new Error('Network error'));

    let latest;
    const onRender = (value) => {
      latest = value;
    };

    render(<HookTestComponent onRender={onRender} />);

    await waitFor(() => {
      expect(latest).toBeDefined();
      expect(latest.loading).toBe(false);
      expect(latest.error).toBe('Failed to load profile data.');
    });

    // No data should be dispatched if the call failed
    expect(setProfileData).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('does nothing if there is no auth user (no user)', async () => {
    mockSelectorState(
      { user: null },
      { data: {} }
    );

    let latest;
    const onRender = (value) => {
      latest = value;
    };

    render(<HookTestComponent onRender={onRender} />);

    await waitFor(() => {
      expect(latest).toBeDefined();
      expect(latest.initialValues).toEqual({});
      expect(latest.loading).toBe(false);
      expect(latest.error).toBeNull();
      expect(latest.accountType).toBeNull();
    });

    expect(callGetUserProfile).not.toHaveBeenCalled();
    expect(setProfileData).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
