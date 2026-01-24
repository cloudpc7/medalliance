import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Formik } from 'formik';
import { useSelector } from 'react-redux';
import CustomFormField from './CustomFormField';

let mockPickerModal;
jest.mock('./PickerModal', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  mockPickerModal = jest.fn(
    ({ visible, title, type, showLocationPrompt, onSelect, onClose }) => {
      if (!visible) return null;
      return (
        <View testID="picker-modal">
          <Text>{title}</Text>
          <Text>{type}</Text>
          <Text>{showLocationPrompt ? 'show-location' : 'no-location'}</Text>
        </View>
      );
    }
  );
  return {
    __esModule: true,
    default: mockPickerModal,
  };
});

let mockDatePicker;
jest.mock('./DatePicker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  mockDatePicker = jest.fn((props) => (
    <View testID="date-picker">
      <Text>DatePicker</Text>
    </View>
  ));
  return {
    __esModule: true,
    default: mockDatePicker,
  };
});

let mockCounterField;
jest.mock('./CounterField', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  mockCounterField = jest.fn(({ min, max }) => (
    <View testID="counter-field">
      <Text>{`Counter min:${min} max:${max}`}</Text>
    </View>
  ));
  return {
    __esModule: true,
    default: mockCounterField,
  };
});

// ---- Helper to render with Formik ----
function renderWithFormik(question, { initialValue = '' } = {}) {
  return render(
    <Formik initialValues={{ [question]: initialValue }} onSubmit={jest.fn()}>
      {() => <CustomFormField question={question} />}
    </Formik>
  );
}

describe('CustomFormField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default Redux selector value
    useSelector.mockReturnValue({
      colleges: ['Test College'],
      loading: false,
    });
  });

  it('renders a college picker and calls PickerModal with correct props when not loading', () => {
    const question = 'Which college do you attend?';

    const { getByText } = renderWithFormik(question);

    // Label shown
    expect(getByText(question)).toBeTruthy();

    // Placeholder text
    expect(
      getByText(`Select ${question}`)
    ).toBeTruthy();

    // PickerModal called once
    expect(mockPickerModal).toHaveBeenCalledTimes(1);
    const pickerProps = mockPickerModal.mock.calls[0][0];

    expect(pickerProps.type).toBe('college');
    expect(pickerProps.title).toBe(`Select ${question}`);
    expect(pickerProps.showLocationPrompt).toBe(true);
  });

  it('disables college picker press and shows loading state when colleges are loading', () => {
  useSelector.mockReturnValue({
    colleges: [],
    loading: true,
  });

  const question = 'Which college do you attend?';
  const { getByText } = renderWithFormik(question);

  expect(getByText('Loading colleges…')).toBeTruthy();
  expect(mockPickerModal).toHaveBeenCalledTimes(1);
  const modalProps = mockPickerModal.mock.calls[0][0];
  expect(modalProps.visible).toBe(false);
});


  it('updates displayed value when PickerModal onSelect is used', async () => {
    const question = 'What is your medical degree program?';

    const { getByText } = renderWithFormik(question);
    expect(mockPickerModal).toHaveBeenCalledTimes(1);
    const modalProps = mockPickerModal.mock.calls[0][0];
    await act(async () => {
      modalProps.onSelect('MD Program');
    });

    expect(getByText('MD Program')).toBeTruthy();
  });

  it('renders DatePicker for graduation-related question', () => {
    const question = 'What is your expected graduation date?';

    renderWithFormik(question);

    expect(mockDatePicker).toHaveBeenCalledTimes(1);
    const dateProps = mockDatePicker.mock.calls[0][0];
    expect(dateProps.field).toBeDefined();
    expect(dateProps.form).toBeDefined();
  });

  it('renders CounterField with proper min/max for current year questions', () => {
    const question = 'What is your current year of study?';

    renderWithFormik(question);

    expect(mockCounterField).toHaveBeenCalledTimes(1);
    const counterProps = mockCounterField.mock.calls[0][0];

    expect(counterProps.min).toBe(1);
    expect(counterProps.max).toBe(7);
  });

  it('renders CounterField with proper min/max for years of experience questions', () => {
    const question = 'How many years of experience do you have?';

    renderWithFormik(question);

    expect(mockCounterField).toHaveBeenCalledTimes(1);
    const counterProps = mockCounterField.mock.calls[0][0];

    expect(counterProps.min).toBe(0);
    expect(counterProps.max).toBe(60);
  });

  it('falls back to TextInput when question does not match any special handling', () => {
    const question = 'Tell us about yourself';

    const { getByPlaceholderText } = renderWithFormik(question);

    expect(getByPlaceholderText(`Enter ${question}`)).toBeTruthy();
  });

  it('shows validation error when present', () => {
    const question = 'Tell us about yourself';

    const { getByText } = render(
      <Formik
        initialValues={{ [question]: '' }}
        initialErrors={{ [question]: 'Required' }}
        initialTouched={{ [question]: true }}
        onSubmit={jest.fn()}
      >
        {() => <CustomFormField question={question} />}
      </Formik>
    );

    expect(getByText('Required')).toBeTruthy();
  });
});
