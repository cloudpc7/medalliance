import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
// We don't import useDispatch/useSelector here because we mock the library below
import * as Haptics from 'expo-haptics';

import ProfileSelectionModal from './ProfileSelectionModal';

// IMPORTS for Assertion References
import {
  setProfileType,
  clearError,
  confirmProfile,
  setLoading,
} from '../../../redux/slices/profile.slice';
import { fetchProfileConfig } from '../../../redux/slices/profileConfig.slice';
import { updateAccount } from '../../../utils/apiUtilities/api';

// --- 1. MOCK REACT-REDUX LOCALLY ---
// This overrides any global mocks and guarantees our mockDispatch is used.
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => mockSelector(selector),
  Provider: ({ children }) => children,
}));

// --- 2. MOCK EXTERNAL DEPENDENCIES ---
jest.mock('../../../utils/apiUtilities/api', () => ({
  updateAccount: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../redux/slices/profileConfig.slice', () => ({
  fetchProfileConfig: jest.fn((type) => ({ type: 'MOCK_FETCH_CONFIG', payload: type })),
}));

jest.mock('../../../redux/slices/profile.slice', () => ({
  setProfileType: jest.fn((type) => ({ type: 'MOCK_SET_TYPE', payload: type })),
  clearError: jest.fn(() => ({ type: 'MOCK_CLEAR_ERROR' })),
  confirmProfile: jest.fn(() => ({ type: 'MOCK_CONFIRM_PROFILE' })),
  setLoading: jest.fn((status) => ({ type: 'MOCK_SET_LOADING', payload: status })),
}));

// --- TEST SUITE ---

describe('ProfileSelectionModal', () => {
  // Define the unwrap spy
  const mockUnwrap = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();

    // --- CRITICAL DISPATCH SETUP ---
    // We configure mockDispatch to return a "Hybrid Promise".
    // It works for 'await dispatch(action)' AND 'dispatch(action).unwrap()'
    mockDispatch.mockImplementation((action) => {
      const promise = Promise.resolve(action);
      promise.unwrap = mockUnwrap; // Attach unwrap to the promise
      return promise;
    });

    // Default Selector State
    mockSelector.mockImplementation((selector) => {
      // Manually emulate the selector logic if passed a function
      if (typeof selector === 'function') {
        return selector({
          profile: { loading: false, error: null, profileType: null },
        });
      }
      return { loading: false, error: null, profileType: null };
    });

    // Dependency defaults
    updateAccount.mockResolvedValue();
    Haptics.impactAsync.mockResolvedValue();
    Haptics.selectionAsync.mockResolvedValue();
  });

  test('renders title and options when visible', () => {
    const { getByText } = render(
      <ProfileSelectionModal showModalVisible={true} />
    );

    expect(getByText('Welcome To Med Alliance')).toBeTruthy();
    expect(getByText('Student')).toBeTruthy();
  });

  test('confirm button disabled when no profileType selected', () => {
    // Override state for this test
    mockSelector.mockImplementation((selector) => selector({
      profile: { loading: false, error: null, profileType: null },
    }));

    const { getByTestId } = render(
      <ProfileSelectionModal showModalVisible={true} />
    );

    expect(getByTestId('profile-selection-confirm')).toBeDisabled();
  });

  test('confirm button dispatches when profileType selected', async () => {
    const profileType = 'students';
    
    // Override state: Profile Selected
    mockSelector.mockImplementation((selector) => selector({
      profile: { loading: false, error: null, profileType },
    }));

    const { getByTestId } = render(
      <ProfileSelectionModal showModalVisible={true} />
    );

    const confirmButton = getByTestId('profile-selection-confirm');
    expect(confirmButton).not.toBeDisabled();

    // Trigger Interaction
    await act(async () => {
      fireEvent.press(confirmButton);
    });

    // Verify
    await waitFor(() => {
      // 1. External Calls
      expect(updateAccount).toHaveBeenCalledWith(profileType);
      expect(Haptics.impactAsync).toHaveBeenCalled();
      
      // 2. Thunk Unwrap
      expect(mockUnwrap).toHaveBeenCalled();

      // 3. Dispatch Sequence
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(true));
      expect(mockDispatch).toHaveBeenCalledWith(fetchProfileConfig(profileType));
      expect(mockDispatch).toHaveBeenCalledWith(confirmProfile());
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
    });

    expect(mockDispatch).toHaveBeenCalledTimes(4);
  });

  test('cancel button dispatches and clears selection', async () => {
    // Override state: Profile Selected
    mockSelector.mockImplementation((selector) => selector({
      profile: { loading: false, error: null, profileType: 'students' },
    }));

    const { getByTestId } = render(
      <ProfileSelectionModal showModalVisible={true} />
    );

    const cancelButton = getByTestId('profile-selection-cancel');

    await act(async () => {
      fireEvent.press(cancelButton);
    });

    await Haptics.selectionAsync();

    expect(Haptics.selectionAsync).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(setProfileType(null));
    expect(mockDispatch).toHaveBeenCalledWith(clearError());
  });
});