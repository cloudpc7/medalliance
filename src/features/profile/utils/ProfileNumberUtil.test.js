import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import useNumberPicker from './ProfileNumberUtils';

describe('useNumberPicker', () => {
  const mockSetFieldValue = jest.fn();
  const mockSetFieldTouched = jest.fn();

  const TestComponent = ({ initialValue = 1, maxValue = 15 }) => {
    const field = { name: 'count', value: initialValue };
    const form = {
      setFieldValue: mockSetFieldValue,
      setFieldTouched: mockSetFieldTouched,
    };

    const { value, increment, decrement } = useNumberPicker(field, form, maxValue);

    return (
      <>
        <Text testID="value">{value}</Text>
        <Pressable testID="inc" onPress={increment}>
          <Text>+</Text>
        </Pressable>
        <Pressable testID="dec" onPress={decrement}>
          <Text>-</Text>
        </Pressable>
      </>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes value from field.value (defaulting to 1) and syncs to form', () => {
    render(<TestComponent initialValue={3} />);

    expect(mockSetFieldValue).toHaveBeenCalledWith('count', 3);
  });

  it('increments value up to maxValue and marks field as touched', () => {
    const { getByTestId } = render(<TestComponent initialValue={1} maxValue={3} />);

    const valueNode = getByTestId('value');
    const incButton = getByTestId('inc');

    expect(valueNode.props.children).toBe(1);

    fireEvent.press(incButton);
    expect(valueNode.props.children).toBe(2);
    expect(mockSetFieldTouched).toHaveBeenCalledWith('count', true);

    fireEvent.press(incButton);
    expect(valueNode.props.children).toBe(3);

    // Try to go beyond max
    fireEvent.press(incButton);
    expect(valueNode.props.children).toBe(3);
  });

  it('decrements value down to 1 and marks field as touched', () => {
    const { getByTestId } = render(<TestComponent initialValue={3} />);

    const valueNode = getByTestId('value');
    const decButton = getByTestId('dec');

    expect(valueNode.props.children).toBe(3);

    fireEvent.press(decButton);
    expect(valueNode.props.children).toBe(2);
    expect(mockSetFieldTouched).toHaveBeenCalledWith('count', true);

    fireEvent.press(decButton);
    expect(valueNode.props.children).toBe(1);

    // Try to go below 1
    fireEvent.press(decButton);
    expect(valueNode.props.children).toBe(1);
  });

  it('defaults to 1 when field.value is falsy or not a number', () => {
    render(<TestComponent initialValue={undefined} />);

    expect(mockSetFieldValue).toHaveBeenCalledWith('count', 1);
  });
});
