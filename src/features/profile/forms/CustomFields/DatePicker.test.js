import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import DatePicker from './DatePicker';

jest.mock('@react-native-community/datetimepicker', () => {
  return ({ onChange }) => {
    return (
      <mock-date-picker
        testID="mockDatePicker"
        onChange={(event, date) => onChange(event, date)}
      />
    );
  };
});

describe('DatePicker Component', () => {
  const setup = (fieldOverrides = {}, formOverrides = {}) => {
    const field = {
      name: 'dob',
      value: '',
      ...fieldOverrides,
    };

    const form = {
      touched: {},
      errors: {},
      setFieldTouched: jest.fn(),
      setFieldValue: jest.fn(),
      ...formOverrides,
    };

    const utils = render(<DatePicker field={field} form={form} />);
    return { ...utils, field, form };
  };

  it('opens the date picker when pressed', () => {
    const { getByPlaceholderText, getByTestId } = setup();

    const input = getByPlaceholderText('MM/DD/YYYY');

    // Press the field
    fireEvent.press(input);

    // The mocked date picker should appear
    expect(getByTestId('mockDatePicker')).toBeTruthy();
  });

  it('calls form.setFieldValue when a date is selected', () => {
    const { getByPlaceholderText, getByTestId, form } = setup();

    // Open date picker
    fireEvent.press(getByPlaceholderText('MM/DD/YYYY'));

    const picker = getByTestId('mockDatePicker');

    // Fire date selection
    act(() => {
      fireEvent(picker, 'onChange', {}, new Date(2020, 5, 15)); // June 15, 2020
    });

    // Should mark field touched
    expect(form.setFieldTouched).toHaveBeenCalledWith('dob', true, false);

    // Should set formatted date
    expect(form.setFieldValue).toHaveBeenCalledWith('dob', '06/15/2020');
  });

  it('renders error style when field has an error', () => {
    const { getByPlaceholderText } = setup(
      {},
      {
        touched: { dob: true },
        errors: { dob: 'Required' },
      }
    );

    const input = getByPlaceholderText('MM/DD/YYYY');
    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: '#EF4444' }),
      ])
    );
  });
});
