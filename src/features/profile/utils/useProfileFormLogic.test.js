import React from 'react';
import { Alert } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

import { useProfileFormLogic } from './useProfileFormLogic';
import { useDispatch, useSelector } from 'react-redux';
import { callUpdateAccountField } from '../../../utils/apiUtilities/api';
import { updateProfileField } from '../../../redux/slices/profile.slice';
import { updateCurrentUserProfileField } from '../../../redux/slices/profiles.slice';

// --- Mock yup.reach so we fully control validation behavior ---
import { reach } from 'yup';

jest.mock('yup', () => ({
  reach: jest.fn(),
}));

// --- Mock ValidationSchema module (we don't need real schema here) ---
jest.mock('../forms/schema/ProfileValidation', () => ({
  ValidationSchema: {},
}));

// --- Mock API helper ---
jest.mock('../../../utils/apiUtilities/api', () => ({
  callUpdateAccountField: jest.fn(),
}));

// --- Mock slices: action creators return plain action objects ---
jest.mock('../../../redux/slices/profile.slice', () => ({
  updateProfileField: jest.fn((payload) => ({
    type: 'profile/updateField',
    payload,
  })),
}));

jest.mock('../../../redux/slices/profiles.slice', () => ({
  updateCurrentUserProfileField: jest.fn((payload) => ({
    type: 'profiles/updateCurrentUserProfileField',
    payload,
  })),
}));

const mockDispatch = jest.fn();

// Test harness to use the hook
const HookTestComponent = ({ onRender, scrollRef }) => {
  const hookValue = useProfileFormLogic(scrollRef);
  onRender(hookValue);
  return null;
};

beforeEach(() => {
  jest.clearAllMocks();

  // global.mocks already makes these jest.fn, we just set return values here
  useDispatch.mockReturnValue(mockDispatch);
  useSelector.mockImplementation((selectorFn) =>
    selectorFn({
      auth: { user: { uid: 'user-123' } },
      profile: { data: { name: 'Old Name', currYear: 1 } },
    })
  );

  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useProfileFormLogic', () => {
  it('saves field successfully on blur and updates backend + Redux', async () => {
    const scrollViewRef = {
      current: { scrollToEnd: jest.fn() },
    };

    // ✅ Validation should pass
    reach.mockReturnValue({
      validate: jest.fn(() => Promise.resolve()),
    });

    // ✅ Backend update succeeds
    callUpdateAccountField.mockResolvedValueOnce({ success: true });

    let latest;
    const onRender = (value) => {
      latest = value;
    };

    render(
      <HookTestComponent onRender={onRender} scrollRef={scrollViewRef} />
    );

    const setErrors = jest.fn();
    const values = { name: 'New Name' };

    await waitFor(() => {
      expect(latest).toBeDefined();
    });

    // Enter edit mode for "name"
    await act(async () => {
      await latest.handleFieldPress('name', values, setErrors);
    });

    // Give React a moment to re-render
    await waitFor(() => {
      expect(latest.activeFieldKey).toBe('name');
    });

    // Blur the field => should trigger commitSave
    await act(async () => {
      await latest.handleFieldBlur(values, setErrors);
    });

    // Backend called with field & value
    await waitFor(() => {
      expect(callUpdateAccountField).toHaveBeenCalledTimes(1);
      expect(callUpdateAccountField).toHaveBeenCalledWith('name', 'New Name');
    });

    // Local profile slice updated
    expect(updateProfileField).toHaveBeenCalledWith({
      key: 'name',
      value: 'New Name',
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      updateProfileField({
        key: 'name',
        value: 'New Name',
      })
    );

    // Profiles feed updated for current user
    expect(updateCurrentUserProfileField).toHaveBeenCalledWith({
      uid: 'user-123',
      key: 'name',
      value: 'New Name',
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      updateCurrentUserProfileField({
        uid: 'user-123',
        key: 'name',
        value: 'New Name',
      })
    );

    // Errors should not be set
    expect(setErrors).not.toHaveBeenCalled();
  });

  it('sets validation errors and does not call backend when validation fails', async () => {
    const scrollViewRef = { current: { scrollToEnd: jest.fn() } };

    // ❌ Validation should FAIL with a ValidationError
    reach.mockReturnValue({
      validate: jest.fn(() => {
        const err = new Error('Invalid value');
        err.name = 'ValidationError';
        return Promise.reject(err);
      }),
    });

    let latest;
    const onRender = (value) => {
      latest = value;
    };

    render(
      <HookTestComponent onRender={onRender} scrollRef={scrollViewRef} />
    );

    const setErrors = jest.fn();
    const values = { currYear: 'INVALID' }; // actual value doesn't matter; our mock always rejects

    await waitFor(() => {
      expect(latest).toBeDefined();
    });

    // Enter edit mode
    await act(async () => {
      await latest.handleFieldPress('currYear', values, setErrors);
    });

    await waitFor(() => {
      expect(latest.activeFieldKey).toBe('currYear');
    });

    // Blur => commitSave => validation error
    await act(async () => {
      await latest.handleFieldBlur(values, setErrors);
    });

    // Backend should NOT be called on validation error
    expect(callUpdateAccountField).not.toHaveBeenCalled();

    // Should set form errors for the active field
    expect(setErrors).toHaveBeenCalledWith({
      currYear: 'Invalid value',
    });

    // No Redux dispatch should occur on validation error
    expect(updateProfileField).not.toHaveBeenCalled();
    expect(updateCurrentUserProfileField).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows alert when backend update fails', async () => {
    const scrollViewRef = { current: { scrollToEnd: jest.fn() } };

    // ✅ Validation passes
    reach.mockReturnValue({
      validate: jest.fn(() => Promise.resolve()),
    });

    // ❌ Backend throws
    callUpdateAccountField.mockRejectedValueOnce(
      new Error('Server down')
    );

    let latest;
    const onRender = (value) => {
      latest = value;
    };

    render(
      <HookTestComponent onRender={onRender} scrollRef={scrollViewRef} />
    );

    const setErrors = jest.fn();
    const values = { name: 'New Name' };

    await waitFor(() => {
      expect(latest).toBeDefined();
    });

    await act(async () => {
      await latest.handleFieldPress('name', values, setErrors);
    });

    await waitFor(() => {
      expect(latest.activeFieldKey).toBe('name');
    });

    await act(async () => {
      await latest.handleFieldBlur(values, setErrors);
    });

    // Backend was attempted
    await waitFor(() => {
      expect(callUpdateAccountField).toHaveBeenCalledTimes(1);
    });

    // Alert shown with the error message
    expect(Alert.alert).toHaveBeenCalledWith(
      'Save Failed',
      'Server down'
    );

    // No Redux updates on failure
    expect(updateProfileField).not.toHaveBeenCalled();
    expect(updateCurrentUserProfileField).not.toHaveBeenCalled();
  });
});
