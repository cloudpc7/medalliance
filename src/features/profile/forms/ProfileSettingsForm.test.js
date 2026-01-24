import React from 'react';
import { render } from '@testing-library/react-native';

const mockUseProfileData = jest.fn();
const mockUseProfileFormLogic = jest.fn();

// 1. Mock useProfileData
jest.mock('../utils/useProfileFormData', () => ({
  useProfileData: () => mockUseProfileData(),
}));

// 2. Mock useProfileFormLogic
jest.mock('../utils/useProfileFormLogic', () => ({
  useProfileFormLogic: (scrollViewRef) => mockUseProfileFormLogic(scrollViewRef),
}));

// 3. Mock PROFILE_SETTINGS_FIELD_CONFIG
jest.mock('../utils/profileFieldConfig', () => ({
  PROFILE_SETTINGS_FIELD_CONFIG: {
    firstName: { label: 'First name', multiline: false, keyboardType: 'default' },
    lastName: { label: 'Last name', multiline: false, keyboardType: 'default' },
    bio: { label: 'Bio', multiline: true, keyboardType: 'default' },
  },
}));

// 4. Mock ProfileSettingsFormView so we can inspect props
jest.mock('./ProfileSettingsFormView', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockProfileSettingsFormView = jest.fn((props) => (
    <View testID="mock-profile-settings-view" {...props} />
  ));

  return {
    __esModule: true,
    default: MockProfileSettingsFormView,
  };
});

import ProfileSettingsForm from './ProfileSettingsForm';
import { PROFILE_SETTINGS_FIELD_CONFIG } from '../utils/profileFieldConfig';
import MockProfileSettingsFormView from './ProfileSettingsFormView';

describe('ProfileSettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds initialValues from PROFILE_SETTINGS_FIELD_CONFIG and hook initialValues', () => {
    mockUseProfileData.mockReturnValue({
      initialValues: {
        firstName: 'John',
        bio: 'Hello there',
      },
      loading: false,
      error: null,
    });

    mockUseProfileFormLogic.mockReturnValue({
      activeFieldKey: null,
      successMessage: '',
      handleFieldPress: jest.fn(),
      handleFieldBlur: jest.fn(),
      handleSubmit: jest.fn(),
      handleCancel: jest.fn(),
      isEditMode: false,
    });

    render(<ProfileSettingsForm />);

    // ✅ Ensure the mocked view was actually called
    expect(MockProfileSettingsFormView).toHaveBeenCalled();

    const lastCall = MockProfileSettingsFormView.mock.calls[MockProfileSettingsFormView.mock.calls.length - 1];
    const props = lastCall[0];

    const expectedInitialValues = {
      firstName: 'John',
      lastName: '',
      bio: 'Hello there',
    };

    expect(props.initialValues).toEqual(expectedInitialValues);
  });

  it('creates fields array from PROFILE_SETTINGS_FIELD_CONFIG entries', () => {
    mockUseProfileData.mockReturnValue({
      initialValues: {},
      loading: false,
      error: null,
    });

    mockUseProfileFormLogic.mockReturnValue({
      activeFieldKey: null,
      successMessage: '',
      handleFieldPress: jest.fn(),
      handleFieldBlur: jest.fn(),
      handleSubmit: jest.fn(),
      handleCancel: jest.fn(),
      isEditMode: false,
    });

    render(<ProfileSettingsForm />);

    expect(MockProfileSettingsFormView).toHaveBeenCalled();
    const lastCall = MockProfileSettingsFormView.mock.calls[MockProfileSettingsFormView.mock.calls.length - 1];
    const props = lastCall[0];

    expect(Array.isArray(props.fields)).toBe(true);
    expect(props.fields.length).toBe(Object.keys(PROFILE_SETTINGS_FIELD_CONFIG).length);

    const firstField = props.fields[0];
    expect(firstField).toHaveProperty('key');
    expect(firstField).toHaveProperty('label');
  });

  it('passes loading and error from useProfileData through to the view', () => {
    mockUseProfileData.mockReturnValue({
      initialValues: {},
      loading: true,
      error: 'Something failed',
    });

    mockUseProfileFormLogic.mockReturnValue({
      activeFieldKey: null,
      successMessage: '',
      handleFieldPress: jest.fn(),
      handleFieldBlur: jest.fn(),
      handleSubmit: jest.fn(),
      handleCancel: jest.fn(),
      isEditMode: false,
    });

    render(<ProfileSettingsForm />);

    expect(MockProfileSettingsFormView).toHaveBeenCalled();
    const lastCall = MockProfileSettingsFormView.mock.calls[MockProfileSettingsFormView.mock.calls.length - 1];
    const props = lastCall[0];

    expect(props.loading).toBe(true);
    expect(props.error).toBe('Something failed');
  });

  it('passes form logic handlers and state to the view', () => {
    const logic = {
      activeFieldKey: 'firstName',
      successMessage: 'Saved successfully',
      handleFieldPress: jest.fn(),
      handleFieldBlur: jest.fn(),
      handleSubmit: jest.fn(),
      handleCancel: jest.fn(),
      isEditMode: true,
    };

    mockUseProfileData.mockReturnValue({
      initialValues: {},
      loading: false,
      error: null,
    });

    mockUseProfileFormLogic.mockReturnValue(logic);

    render(<ProfileSettingsForm />);

    expect(MockProfileSettingsFormView).toHaveBeenCalled();
    const lastCall = MockProfileSettingsFormView.mock.calls[MockProfileSettingsFormView.mock.calls.length - 1];
    const props = lastCall[0];

    expect(props.activeFieldKey).toBe('firstName');
    expect(props.successMessage).toBe('Saved successfully');
    expect(props.isEditMode).toBe(true);

    expect(props.onFieldPress).toBe(logic.handleFieldPress);
    expect(props.onFieldBlur).toBe(logic.handleFieldBlur);
    expect(props.onSubmit).toBe(logic.handleSubmit);
    expect(props.onCancel).toBe(logic.handleCancel);
  });
});
