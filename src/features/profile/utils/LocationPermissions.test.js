// src/features/profile/utils/LocationPermissions.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import LocationPrompt from './LocationPermissions';
import { useDispatch, useSelector } from 'react-redux';
import {
  requestAndSetLocation,
  clearSchoolError,
} from '../../../redux/slices/school.slice';

// Use the globally mocked react-redux in global.mocks.js
// We just configure it here, not re-mock it.

jest.mock('../../../redux/slices/school.slice', () => ({
  requestAndSetLocation: jest.fn(() => ({ type: 'REQUEST_AND_SET_LOCATION' })),
  clearSchoolError: jest.fn(() => ({ type: 'CLEAR_SCHOOL_ERROR' })),
}));

const mockDispatch = jest.fn();

// Helper to control what useSelector returns
const mockSelectorState = (schoolState) => {
  useSelector.mockImplementation((selectorFn) =>
    selectorFn({ school: schoolState })
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  // global.mocks.js defines useDispatch as a jest.fn, so we can override return value
  useDispatch.mockReturnValue(mockDispatch);
});

describe('LocationPrompt', () => {
  it('shows loading message when permission is Allow, loading is true, and userState is not set', () => {
    mockSelectorState({
      permission: 'Allow',
      loading: true,
      error: null,
      userState: null,
    });

    const { getByText } = render(<LocationPrompt />);

    expect(
      getByText('Determining your state to show local schools…')
    ).toBeTruthy();
  });

  it('returns null (renders nothing) when userState is set and permission is Allow', () => {
    mockSelectorState({
      permission: 'Allow',
      loading: false,
      error: null,
      userState: 'CA',
    });

    const { toJSON } = render(<LocationPrompt />);
    // The component returns null => tree should be null
    expect(toJSON()).toBeNull();
  });

  it('shows deny message and dispatches clearSchoolError + requestAndSetLocation when pressed', () => {
    mockSelectorState({
      permission: 'Deny',
      loading: false,
      error: null,
      userState: null,
    });

    const { getByText } = render(<LocationPrompt />);

    // Title text for denied permission
    expect(
      getByText('Location access is required to filter local schools.')
    ).toBeTruthy();

    const buttonLabel = 'Retry Location';
    const buttonTextNode = getByText(buttonLabel);

    // The Pressable is the parent of the Text
    const pressable = buttonTextNode.parent;

    // Sanity check: parent exists
    expect(pressable).toBeTruthy();

    fireEvent.press(pressable);

    // Behavior: it should clear errors and request location
    expect(clearSchoolError).toHaveBeenCalledTimes(1);
    expect(requestAndSetLocation).toHaveBeenCalledTimes(1);

    expect(mockDispatch).toHaveBeenCalledWith(clearSchoolError());
    expect(mockDispatch).toHaveBeenCalledWith(requestAndSetLocation());
  });

  it('shows allow message when permission is not Deny and userState is not set', () => {
    mockSelectorState({
      permission: 'Ask', // or anything other than 'Deny'
      loading: false,
      error: null,
      userState: null,
    });

    const { getByText } = render(<LocationPrompt />);

    // Title for the normal "allow location" state
    expect(
      getByText('Allow location to show local medical schools.')
    ).toBeTruthy();

    const buttonLabel = 'Allow Location for Local Schools';
    expect(getByText(buttonLabel)).toBeTruthy();

    // Subtext for nationwide fallback
    expect(
      getByText('(Showing all schools nationwide)')
    ).toBeTruthy();
  });

  it('displays ErrorText message when error exists', () => {
    const errorMessage = 'Something went wrong';

    mockSelectorState({
      permission: 'Deny',
      loading: false,
      error: errorMessage,
      userState: null,
    });

    const { getByText } = render(<LocationPrompt />);

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('does not dispatch actions when loading is true (button is effectively disabled)', () => {
    mockSelectorState({
      permission: 'Deny',
      loading: true,
      error: null,
      userState: null,
    });

    const { getByText } = render(<LocationPrompt />);

    const buttonLabel = 'Retry Location';
    const buttonTextNode = getByText(buttonLabel);
    const pressable = buttonTextNode.parent;
    fireEvent.press(pressable);

    expect(clearSchoolError).not.toHaveBeenCalled();
    expect(requestAndSetLocation).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
