// src/features/profile/forms/ProfileSetupForm.test.js
import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';

import ProfileSetupForm from './ProfileSetupForm';

// ---- MOCKS ----

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock thunks
jest.mock('../../../redux/slices/profile.slice', () => ({
  submitProfileForm: jest.fn(),
}));

jest.mock('../../../redux/slices/profileConfig.slice', () => ({
  fetchProfileConfig: jest.fn(),
}));

// Mock ValidationSchema so validation is simple & predictable
jest.mock('./schema/ValidationSchema', () => ({
  validationSchema: {}, // default: no required fields
}));

// Mock UI pieces
jest.mock('../../../ui/common/LoadingSpinner', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockLoadingSpinner(props) {
    return <View testID="loading-spinner" {...props} />;
  };
});

jest.mock('../../../utils/errors/ErrorBanner', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  return function MockErrorBanner({ message, onDismiss }) {
    return (
      <View testID="error-banner">
        <Text>{message}</Text>
        <Pressable testID="dismiss-error" onPress={onDismiss}>
          <Text>Dismiss</Text>
        </Pressable>
      </View>
    );
  };
});

jest.mock('./CustomFields/CustomFormField', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockCustomField({ question }) {
    return (
      <View testID={`custom-field-${question}`}>
        <Text>{question}</Text>
      </View>
    );
  };
});

// Simplify Formik to avoid full validation / state complexity in tests
jest.mock('formik', () => {
  const React = require('react');

  return {
    Formik: ({ initialValues, onSubmit, children }) => {
      // We pretend the form is valid & dirty by default for most tests
      const propsForChildren = {
        values: initialValues,
        errors: {},
        setErrors: jest.fn(),
        resetForm: jest.fn(),
        handleSubmit: () => onSubmit(initialValues, { setSubmitting: jest.fn() }),
        isSubmitting: false,
        isValid: true,
        dirty: true,
      };

      return children(propsForChildren);
    },
  };
});

describe('ProfileSetupForm', () => {
  const mockUseDispatch = require('react-redux').useDispatch;
  const mockUseSelector = require('react-redux').useSelector;
  const mockUseRouter = require('expo-router').useRouter;
  const { submitProfileForm } = require('../../../redux/slices/profile.slice');
  const { fetchProfileConfig } = require('../../../redux/slices/profileConfig.slice');

  const createState = (overrides = {}) => ({
    profile: {
      profileType: 'doctor',
      ...overrides.profile,
    },
    profileConfig: {
      questions: [],
      loading: false,
      error: null,
      ...overrides.profileConfig,
    },
  });

  let dispatchMock;
  let routerMock;

  beforeEach(() => {
    jest.clearAllMocks();

    dispatchMock = jest.fn();
    routerMock = { replace: jest.fn() };

    mockUseDispatch.mockReturnValue(dispatchMock);
    mockUseRouter.mockReturnValue(routerMock);

    // default submitProfileForm mock
    submitProfileForm.mockImplementation((payload) => ({
      type: 'submitProfileForm',
      payload,
    }));

    // default fetchProfileConfig mock
    fetchProfileConfig.mockImplementation((profileType) => ({
      type: 'fetchProfileConfig',
      meta: { profileType },
    }));
  });

  // Helper: set useSelector implementation per test
  const mockState = (stateOverrides = {}) => {
    const state = createState(stateOverrides);
    mockUseSelector.mockImplementation((selectorFn) => selectorFn(state));
    return state;
  };

  it('shows loading state with spinner and text when loading is true', () => {
    mockState({
      profileConfig: { loading: true, questions: [], error: null },
    });

    const { getByTestId, getByText } = render(<ProfileSetupForm />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('dispatches fetchProfileConfig on mount when profileType is present and questions are empty', () => {
    const state = mockState({
      profile: { profileType: 'nurse' },
      profileConfig: { questions: [], loading: false, error: null },
    });

    render(<ProfileSetupForm />);

    expect(fetchProfileConfig).toHaveBeenCalledTimes(1);
    expect(fetchProfileConfig).toHaveBeenCalledWith('nurse');

    // dispatched with the thunk returned from fetchProfileConfig
    const thunk = fetchProfileConfig.mock.results[0].value;
    expect(dispatchMock).toHaveBeenCalledWith(thunk);
  });

  it('renders empty state when there are no questions and not loading', () => {
    mockState({
      profileConfig: { questions: [], loading: false, error: null },
    });

    const { getByText } = render(<ProfileSetupForm />);

    expect(
      getByText('No questions found for this profile type.')
    ).toBeTruthy();
  });

  it('renders form with CustomField components when questions are present', () => {
    mockState({
      profileConfig: {
        loading: false,
        error: null,
        questions: [
          { specialty: { label: 'Specialty' } },
          { experience: { label: 'Years of experience' } },
        ],
      },
    });

    const { getByTestId } = render(<ProfileSetupForm />);

    expect(getByTestId('custom-field-specialty')).toBeTruthy();
    expect(getByTestId('custom-field-experience')).toBeTruthy();
  });

  it('submit button has proper accessibility props (button role & label)', () => {
    mockState({
      profileConfig: {
        loading: false,
        error: null,
        questions: [{ specialty: {} }],
      },
    });

    const { getByTestId } = render(<ProfileSetupForm />);

    const button = getByTestId('complete-profile-button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Complete profile');
  });

  it('submits successfully: dispatches submitProfileForm and navigates to /(app)', async () => {
    mockState({
      profile: { profileType: 'doctor' },
      profileConfig: {
        loading: false,
        error: null,
        questions: [{ specialty: {} }],
      },
    });

    // dispatch should return an object with unwrap() that resolves
    const unwrapMock = jest.fn().mockResolvedValueOnce({});
    dispatchMock.mockReturnValue({ unwrap: unwrapMock });

    const { getByTestId } = render(<ProfileSetupForm />);

    const button = getByTestId('complete-profile-button');
    fireEvent.press(button);

    await waitFor(() => {
      // initialValues built from questions -> { specialty: '' }
      expect(submitProfileForm).toHaveBeenCalledTimes(1);
      expect(submitProfileForm).toHaveBeenCalledWith({
        specialty: '',
        profileType: 'doctor',
      });

      expect(unwrapMock).toHaveBeenCalledTimes(1);
      expect(routerMock.replace).toHaveBeenCalledWith('/(app)');
    });
  });

  it('shows error banner when submitProfileForm unwrap rejects', async () => {
    mockState({
      profile: { profileType: 'doctor' },
      profileConfig: {
        loading: false,
        error: null,
        questions: [{ specialty: {} }],
      },
    });

    const error = new Error('Submission failed!');
    const unwrapMock = jest.fn().mockRejectedValueOnce(error);
    dispatchMock.mockReturnValue({ unwrap: unwrapMock });

    const { getByTestId, getByText } = render(<ProfileSetupForm />);

    const button = getByTestId('complete-profile-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByTestId('error-banner')).toBeTruthy();
      expect(getByText('Submission failed!')).toBeTruthy();
    });
  });

  it('surfaces backend error payload string if present', async () => {
    mockState({
      profile: { profileType: 'doctor' },
      profileConfig: {
        loading: false,
        error: null,
        questions: [{ specialty: {} }],
      },
    });

    const backendError = { payload: 'Server said no.' };
    const unwrapMock = jest
      .fn()
      .mockRejectedValueOnce(backendError);
    dispatchMock.mockReturnValue({ unwrap: unwrapMock });

    const { getByTestId, getByText } = render(<ProfileSetupForm />);

    const button = getByTestId('complete-profile-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByTestId('error-banner')).toBeTruthy();
      expect(getByText('Server said no.')).toBeTruthy();
    });
  });

  it('shows visibleError from profileConfig.error via ErrorBanner', () => {
    mockState({
      profileConfig: {
        loading: false,
        questions: [],
        error: 'Config failed to load',
      },
    });

    const { getByTestId, getByText } = render(<ProfileSetupForm />);

    expect(getByTestId('error-banner')).toBeTruthy();
    expect(getByText('Config failed to load')).toBeTruthy();
  });
});
