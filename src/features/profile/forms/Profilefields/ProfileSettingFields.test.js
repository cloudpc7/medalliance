// src/features/profile/forms/Profilefields/ProfileSettingFields.test.js
import React, { createRef } from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileField from './ProfileSettingFields'; // adjust path if needed

describe('ProfileField', () => {
  const createFormikMocks = (overrides) => {
    const form = {
      setFieldValue: jest.fn(),
      setFieldTouched: jest.fn(),
      touched: {},
      errors: {},
      ...overrides,
    };

    const field = {
      name: 'testField',
      value: '',
      ...(overrides && overrides.field),
    };

    return { field, form };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with Formik field/form props', () => {
    const { field, form } = createFormikMocks({
      touched: { testField: false },
      errors: {},
    });

    const { getByTestId } = render(
      <ProfileField field={field} form={form} testID="profile-input" />
    );

    const input = getByTestId('profile-input');
    expect(input).toBeTruthy();
  });

  it('shows error text when error prop is provided directly', () => {
    const { getByText } = render(
      <ProfileField value="" error="Direct error" testID="profile-input" />
    );

    expect(getByText('Direct error')).toBeTruthy();
  });

  it('applies focused style when isFocused is true', () => {
    const { getByTestId } = render(
      <ProfileField
        value=""
        isFocused
        testID="profile-input"
      />
    );

    // Container has combined styles: inputContainer + focused
    const container = getByTestId('profile-field-container');
    const flattened = StyleSheet.flatten(container.props.style);

    expect(flattened.borderColor).toBe('#126DA6');
  });

  it('applies errorContainer style when error exists (Formik)', () => {
    const { field, form } = createFormikMocks({
      field: { name: 'email', value: 'x' },
      touched: { email: true },
      errors: { email: 'Error here' },
    });

    const { getByTestId, getByText } = render(
      <ProfileField
        field={field}
        form={form}
        testID="profile-input"
      />
    );

    // Error text should render
    expect(getByText('Error here')).toBeTruthy();

    // Container should have error border color
    const container = getByTestId('profile-field-container');
    const flattened = StyleSheet.flatten(container.props.style);

    expect(flattened.borderColor).toBe('#D32F2F');
  });

  it('applies multiline style and textAlignVertical="top" when multiline is true', () => {
    const { getByTestId } = render(
      <ProfileField
        value="hello"
        multiline
        testID="profile-input"
      />
    );

    const input = getByTestId('profile-input');
    const flattenedInputStyle = StyleSheet.flatten(input.props.style);

    expect(flattenedInputStyle.minHeight).toBe(96);
    expect(input.props.textAlignVertical).toBe('top');
  });

  it('calls form.setFieldValue and onChangeText when used with Formik', () => {
    const { field, form } = createFormikMocks({
      field: { name: 'bio', value: '' },
    });

    const onChangeText = jest.fn();

    const { getByTestId } = render(
      <ProfileField
        field={field}
        form={form}
        onChangeText={onChangeText}
        testID="profile-input"
      />
    );

    const input = getByTestId('profile-input');
    fireEvent.changeText(input, 'Hello world');

    expect(form.setFieldValue).toHaveBeenCalledWith('bio', 'Hello world');
    expect(onChangeText).toHaveBeenCalledWith('Hello world');
  });

  it('calls form.setFieldTouched and onBlur when blurred', () => {
    const { field, form } = createFormikMocks({
      field: { name: 'bio', value: '' },
    });

    const onBlur = jest.fn();

    const { getByTestId } = render(
      <ProfileField
        field={field}
        form={form}
        onBlur={onBlur}
        testID="profile-input"
      />
    );

    const input = getByTestId('profile-input');
    fireEvent(input, 'blur');

    expect(form.setFieldTouched).toHaveBeenCalledWith('bio', true);
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders without crashing when isFocused is true', () => {
    const { getByTestId } = render(
      <ProfileField
        value=""
        isFocused
        testID="profile-input"
      />
    );

    // Basic sanity: input is rendered
    expect(getByTestId('profile-input')).toBeTruthy();
  });

  it('converts non-string values to string for TextInput value', () => {
    const { getByTestId } = render(
      <ProfileField
        value={123}
        testID="profile-input"
      />
    );

    const input = getByTestId('profile-input');
    expect(input.props.value).toBe('123');
  });
});
