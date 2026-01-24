// src/features/profile/forms/CustomFields/CounterField.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CounterField from './CounterField';

describe('CounterField', () => {
  let field;
  let form;

  beforeEach(() => {
    field = { name: 'count', value: '2' };

    form = {
      touched: {},
      errors: {},
      setFieldValue: jest.fn(),
      setFieldTouched: jest.fn(),
    };
  });

  const setup = (overrideField = {}, overrideForm = {}) => {
    const finalField = { ...field, ...overrideField };
    const finalForm = { ...form, ...overrideForm };

    return render(<CounterField field={finalField} form={finalForm} />);
  };

  it('renders the current value', () => {
    const { getByText } = setup();
    expect(getByText('2')).toBeTruthy();
  });

  it('decrements when minus is pressed', () => {
    const { getByLabelText } = setup();
    const minusButton = getByLabelText('− (current: 2)');

    fireEvent.press(minusButton);

    expect(form.setFieldValue).toHaveBeenCalledWith('count', '1');
    expect(form.setFieldTouched).toHaveBeenCalledWith('count', true, false);
  });

  it('increments when plus is pressed', () => {
    const { getByLabelText } = setup();
    const plusButton = getByLabelText('+ (current: 2)');

    fireEvent.press(plusButton);

    expect(form.setFieldValue).toHaveBeenCalledWith('count', '3');
  });

  it('does not go below min when value is at 0', () => {
    const { getByLabelText } = setup({ value: '0' });

    const minusButton = getByLabelText('− (current: 0)');
    fireEvent.press(minusButton);

    // No change should be dispatched when already at min
    expect(form.setFieldValue).not.toHaveBeenCalled();
    expect(form.setFieldTouched).not.toHaveBeenCalled();
  });

  it('does not exceed max when value is at 6', () => {
    const { getByLabelText } = setup({ value: '6' });

    const plusButton = getByLabelText('+ (current: 6)');
    fireEvent.press(plusButton);

    // No change should be dispatched when already at max
    expect(form.setFieldValue).not.toHaveBeenCalled();
    expect(form.setFieldTouched).not.toHaveBeenCalled();
  });

  it('shows an error message if touched + error exist', () => {
    const { getByText } = setup(
      {},
      { touched: { count: true }, errors: { count: 'Too high' } },
    );

    expect(getByText('Too high')).toBeTruthy();
  });

  it('applies accessibility labels properly', () => {
    const { getByLabelText } = setup();

    expect(getByLabelText('− (current: 2)')).toBeTruthy();
    expect(getByLabelText('+ (current: 2)')).toBeTruthy();
  });
});
