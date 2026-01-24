import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DegreeTypeField from './DegreeType';
import { useSelector } from 'react-redux';
import { useField } from 'formik';

// ——— Mock ONLY formik (not redux, not LoadingSpinner, not ErrorText)
jest.mock('formik', () => ({
  useField: jest.fn(),
}));

const mockUseField = (overrides = {}) => {
  const setValue = jest.fn();

  const field = {
    name: 'degreeType',
    value: '',
    ...overrides.field,
  };

  const meta = {
    touched: false,
    error: undefined,
    ...overrides.meta,
  };

  const helpers = {
    setValue,
    ...(overrides.helpers || {}),
  };

  useField.mockReturnValue([field, meta, helpers]);
  return { field, meta, helpers };
};

// Helper to override redux selector inside each test
const mockReduxProfile = (overrides = {}) => {
  const profile = {
    degreeTypes: [
      { id: 1, name: 'Biology' },
      { id: 2, name: 'Chemistry' },
    ],
    isLoading: false,
    error: null,
    ...overrides,
  };

  useSelector.mockImplementation((sel) => sel({ profile }));
  return profile;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DegreeTypeField', () => {
  it('shows loading state', () => {
    mockUseField();
    mockReduxProfile({ isLoading: true });

    const { getByText } = render(
      <DegreeTypeField name="degreeType" label="Major/Minor" />
    );

    expect(getByText('Loading options…')).toBeTruthy();
  });

  it('shows no-options + error state', () => {
    mockUseField();
    mockReduxProfile({ degreeTypes: [], error: 'Failed to load' });

    const { getByText } = render(
      <DegreeTypeField name="degreeType" label="Major/Minor" />
    );

    expect(getByText('No options available')).toBeTruthy();
    expect(getByText('Failed to load')).toBeTruthy();
  });

  it('opens modal and selects a value', () => {
    const { helpers } = mockUseField();
    mockReduxProfile();

    const { getByText } = render(<DegreeTypeField name="degreeType" />);

    fireEvent.press(getByText('Select Major/Minor'));

    fireEvent.press(getByText('Biology'));

    expect(helpers.setValue).toHaveBeenCalledWith('Biology');
  });

  it('shows existing value instead of placeholder', () => {
    mockUseField({ field: { value: 'Chemistry' } });
    mockReduxProfile();

    const { getByText } = render(<DegreeTypeField name="degreeType" />);

    expect(getByText('Chemistry')).toBeTruthy();
  });

  it('shows validation error when touched + error', () => {
    mockUseField({
      meta: { touched: true, error: 'Required' }
    });
    mockReduxProfile();

    const { getByText } = render(<DegreeTypeField name="degreeType" />);

    expect(getByText('Required')).toBeTruthy();
  });
});
