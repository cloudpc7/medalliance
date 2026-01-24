import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';

import PickerModal from './PickerModal';

// --- Mock redux slice actions ---------------------------------------------
jest.mock('../../../../redux/slices/school.slice', () => ({
  fetchColleges: jest.fn(() => ({ type: 'FETCH_COLLEGES' })),
  fetchMedicalPrograms: jest.fn(() => ({ type: 'FETCH_PROGRAMS' })),
  fetchDegrees: jest.fn(() => ({ type: 'FETCH_DEGREES' })),
  fetchOccupations: jest.fn(() => ({ type: 'FETCH_OCCUPATIONS' })),
  fetchSpecialties: jest.fn(() => ({ type: 'FETCH_SPECIALTIES' })),
  fetchMentoringTypes: jest.fn(() => ({ type: 'FETCH_MENTORING_TYPES' })),
  fetchFormats: jest.fn(() => ({ type: 'FETCH_FORMATS' })),
  clearSchoolError: jest.fn(() => ({ type: 'CLEAR_SCHOOL_ERROR' })),
}));

import {
  fetchColleges,
  fetchMedicalPrograms,
  fetchDegrees,
  fetchOccupations,
  fetchSpecialties,
  fetchMentoringTypes,
  fetchFormats,
  clearSchoolError,
} from '../../../../redux/slices/school.slice';

// --- Mock ErrorText and LocationPrompt ------------------------------------
jest.mock('../../../../utils/errors/ErrorText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockErrorText({ message, style }) {
    return (
      <Text testID="error-text" style={style}>
        {message}
      </Text>
    );
  };
});

jest.mock('../../utils/LocationPermissions', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockLocationPrompt() {
    return <Text testID="location-prompt">LocationPrompt</Text>;
  };
});

// --- Helpers ----------------------------------------------------------------

const mockSchoolState = (override = {}) => {
  const defaultState = {
    colleges: ['Harvard University', 'Stanford University'],
    programs: [],
    degrees: [],
    occupations: [],
    specialties: [],
    mentoringTypes: [],
    formats: [],
    userState: 'CA',
    loadingColleges: false,
    loadingPrograms: false,
    loadingDegrees: false,
    loadingOccupations: false,
    loadingSpecialties: false,
    loadingMentoringTypes: false,
    loadingFormats: false,
    error: null,
  };

  useSelector.mockImplementation((selector) =>
    selector({
      school: {
        ...defaultState,
        ...override,
      },
    }),
  );
};

describe('PickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // restore selector impl per test
    useSelector.mockReset();

    // IMPORTANT: make sure useDispatch returns a function again
    useDispatch.mockReturnValue(jest.fn());
  });

  it('returns null when not visible', () => {
    mockSchoolState();
    const { queryByText } = render(
      <PickerModal visible={false} onClose={jest.fn()} onSelect={jest.fn()} title="Select" />
    );

    expect(queryByText('Close')).toBeNull();
  });

  it('dispatches clearSchoolError and fetchColleges when opened for colleges', () => {
    mockSchoolState({ userState: 'NY' });

    render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select college"
        type="college"
      />
    );

    expect(clearSchoolError).toHaveBeenCalledTimes(1);
    expect(fetchColleges).toHaveBeenCalledTimes(1);
    expect(fetchColleges).toHaveBeenCalledWith({ state: 'NY' });
  });

  it('dispatches fetchMedicalPrograms when type="program" and programs are empty', () => {
    mockSchoolState({ programs: [] });

    render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select program"
        type="program"
      />
    );

    expect(fetchMedicalPrograms).toHaveBeenCalledTimes(1);
  });

  it('does NOT dispatch fetchMedicalPrograms when programs already loaded', () => {
    mockSchoolState({ programs: ['MD Program'] });

    render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select program"
        type="program"
      />
    );

    expect(fetchMedicalPrograms).not.toHaveBeenCalled();
  });

  it('shows loading state for colleges', () => {
    mockSchoolState({ loadingColleges: true });

    const { getByText } = render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select college"
        type="college"
      />
    );

    expect(getByText('Loading colleges…')).toBeTruthy();
  });

  it('shows generic loading state for non-college type', () => {
    mockSchoolState({ loadingPrograms: true });

    const { getByText } = render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select program"
        type="program"
      />
    );

    expect(getByText('Loading options…')).toBeTruthy();
  });

  it('shows error message via ErrorText when error exists', () => {
    mockSchoolState({ error: 'Something went wrong' });

    const { getByTestId } = render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select college"
        type="college"
      />
    );

    expect(getByTestId('error-text').props.children).toBe('Something went wrong');
  });

  it('shows "No items found" when there is no data and no error', () => {
    mockSchoolState({
      colleges: [],
      programs: [],
      degrees: [],
      occupations: [],
      specialties: [],
      mentoringTypes: [],
      formats: [],
      error: null,
    });

    const { getByText } = render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select college"
        type="college"
      />
    );

    expect(getByText('No items found')).toBeTruthy();
  });

  it('renders list items and calls onSelect + onClose when an item is pressed (degree type)', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    mockSchoolState({ degrees: ['MD', 'DO'] });

    const { getByText } = render(
      <PickerModal
        visible={true}
        onClose={onClose}
        onSelect={onSelect}
        title="Select degree"
        type="degree"
      />
    );

    const mdItem = getByText('MD');
    fireEvent.press(mdItem);

    expect(onSelect).toHaveBeenCalledWith('MD');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows search input and filters colleges by query', async () => {
    mockSchoolState({
      colleges: ['Harvard University', 'Stanford University'],
      loadingColleges: false,
    });

    const { getByPlaceholderText, getByText, queryByText } = render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select college"
        type="college"
      />
    );

    const searchInput = getByPlaceholderText('Search colleges...');
    expect(searchInput).toBeTruthy();

    fireEvent.changeText(searchInput, 'Harv');

    await waitFor(() => {
      expect(getByText('Harvard University')).toBeTruthy();
      expect(queryByText('Stanford University')).toBeNull();
    });
  });

  it('renders LocationPrompt by default for college type', () => {
    mockSchoolState();

    const { getByTestId } = render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select college"
        type="college"
      />
    );

    expect(getByTestId('location-prompt')).toBeTruthy();
  });

  it('does NOT render LocationPrompt when showLocationPrompt is false', () => {
    mockSchoolState();

    const { queryByTestId } = render(
      <PickerModal
        visible={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        title="Select college"
        type="college"
        showLocationPrompt={false}
      />
    );

    expect(queryByTestId('location-prompt')).toBeNull();
  });

  it('closes when "Close" is pressed (header back button)', () => {
    mockSchoolState();

    const onClose = jest.fn();

    const { getByText } = render(
      <PickerModal
        visible={true}
        onClose={onClose}
        onSelect={jest.fn()}
        title="Select college"
        type="college"
      />
    );

    fireEvent.press(getByText('Close'));

    expect(onClose).toHaveBeenCalled();
  });
});
