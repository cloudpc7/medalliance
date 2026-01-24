// src/features/profile/forms/CustomFields/OccupationPicker.test.js
import React from 'react';
import { View, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useSelector } from 'react-redux';

import OccupationPicker from './OccupationPicker';

// --- Mock @react-native-picker/picker so we can "select" items easily ---
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MockPicker = ({ children, selectedValue, onValueChange, ...rest }) => (
    <View testID="mock-picker" {...rest}>
      <Text>Selected: {selectedValue || ''}</Text>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const { label, value } = child.props;
        return (
          <Text
            onPress={() => onValueChange && onValueChange(value)}
            accessibilityRole="button"
          >
            {label}
          </Text>
        );
      })}
    </View>
  );

  const MockPickerItem = ({ label }) => <Text>{label}</Text>;

  // Support `import { Picker } from '@react-native-picker/picker'` and `<Picker.Item />`
  MockPicker.Item = MockPickerItem;

  return {
    __esModule: true,
    Picker: MockPicker,
    default: MockPicker,
  };
});

// Mock LoadingSpinner & ErrorText – you already have global mocks, but this is safe & local.
jest.mock('../../../../ui/common/LoadingSpinner', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockLoadingSpinner(props) {
    return <View testID="loading-spinner" {...props} />;
  };
});

jest.mock('../../../../utils/errors/ErrorText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockErrorText({ message }) {
    return <Text testID="error-text">{message}</Text>;
  };
});

// --- Helpers -------------------------------------------------------------

const baseField = {
  name: 'occupation',
  value: '',
};

const createForm = (overrides = {}) => ({
  touched: {},
  errors: {},
  setFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  ...overrides,
});

const mockProfileState = (overrides = {}) => {
  const defaultProfile = {
    occupations: ['Doctor', 'Engineer'],
    isLoading: false,
    error: null,
  };

  useSelector.mockImplementation((selector) =>
    selector({
      profile: {
        ...defaultProfile,
        ...overrides,
      },
    }),
  );
};

// --- Tests ---------------------------------------------------------------

describe('OccupationPicker', () => {
  beforeEach(() => {
    useSelector.mockReset();
  });

  it('shows loading state with spinner and text when isLoading is true', () => {
    mockProfileState({ isLoading: true });

    const form = createForm();
    const { getByTestId, getByText, queryByTestId } = render(
      <OccupationPicker form={form} field={baseField} />,
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByText('Loading occupations…')).toBeTruthy();
    expect(queryByTestId('mock-picker')).toBeNull();
  });

  it('shows "No options available" and ErrorText when there is an error', () => {
    mockProfileState({ occupations: [], error: 'Something went wrong' });

    const form = createForm();
    const { getByText, getByTestId } = render(
      <OccupationPicker form={form} field={baseField} />,
    );

    expect(getByText('No options available')).toBeTruthy();
    expect(getByTestId('error-text').props.children).toBe('Something went wrong');
  });

  it('shows placeholder when no value is selected', () => {
    mockProfileState();

    const form = createForm();
    const { getByText } = render(
      <OccupationPicker form={form} field={baseField} />,
    );

    expect(getByText('Select your occupation')).toBeTruthy();
  });

  it('renders occupation options from Redux state', () => {
    mockProfileState({ occupations: ['Doctor', 'Engineer', 'Nurse'] });

    const form = createForm();
    const { getByText } = render(
      <OccupationPicker form={form} field={baseField} />,
    );

    expect(getByText('Doctor')).toBeTruthy();
    expect(getByText('Engineer')).toBeTruthy();
    expect(getByText('Nurse')).toBeTruthy();
  });

  it('calls form.setFieldValue when an occupation is selected', () => {
    mockProfileState({ occupations: ['Doctor', 'Engineer'] });

    const form = createForm();
    const { getByText } = render(
      <OccupationPicker form={form} field={baseField} />,
    );

    const doctorOption = getByText('Doctor');
    fireEvent.press(doctorOption);

    expect(form.setFieldValue).toHaveBeenCalledWith('occupation', 'Doctor');
  });

  it('shows validation error text when present', () => {
    mockProfileState();

    const form = createForm({
      touched: { occupation: true },
      errors: { occupation: 'Required' },
    });

    const { getByText } = render(
      <OccupationPicker form={form} field={baseField} />,
    );

    expect(getByText('Required')).toBeTruthy();
  });

  it('applies errorBorder style when there is a validation error', () => {
    mockProfileState();

    const form = createForm({
      touched: { occupation: true },
      errors: { occupation: 'Required' },
    });

    const { UNSAFE_getAllByType } = render(
      <OccupationPicker form={form} field={baseField} />,
    );

    const views = UNSAFE_getAllByType(View);

    const errorContainer = views.find((node) => {
      const style = node.props.style;
      if (!Array.isArray(style)) return false;
      return style.some(
        (part) => part && part.borderColor === '#EF4444',
      );
    });

    expect(errorContainer).toBeTruthy();
  });
});
