import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ExtendedProfile from './ExtendedProfileCard';
import { useDispatch, useSelector } from 'react-redux';
import { closeProfile } from '../../../redux/slices/profiles.slice';

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock profile slice action
jest.mock('../../../redux/slices/profiles.slice', () => ({
  closeProfile: jest.fn(() => ({ type: 'profiles/closeProfile' })),
}));

// Mock vector icons so component doesn't crash
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const IconMock = (props) => <Text {...props}>{props.name}</Text>;
  return {
    FontAwesome6: IconMock,
  };
});

describe('ExtendedProfile', () => {
  const mockDispatch = jest.fn();
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockClear();

    // Default Redux state
    mockState = {
      profiles: {
        extendProfile: true,
        selectedProfile: {
          name: 'Dr. Jane Doe',
          accountType: 'professor',
          College: 'MedUniversity',
          profession: 'Cardiologist',
          quote: 'Do no harm.',
          online: true,
        },
      },
    };

    useSelector.mockImplementation((selector) => selector(mockState));
    useDispatch.mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    useSelector.mockReset();
    useDispatch.mockReset();
  });

  it('renders nothing when not extended', () => {
    mockState.profiles.extendProfile = false;
    mockState.profiles.selectedProfile = null;

    const { queryByTestId } = render(<ExtendedProfile />);
    expect(queryByTestId('extended-profile-overlay')).toBeNull();
  });

  it('renders professor profile', () => {
    const { getByTestId, getByText } = render(<ExtendedProfile />);

    expect(getByTestId('extended-profile-overlay')).toBeTruthy();

    expect(getByTestId('extended-profile-name').props.children).toBe(
      'Dr. Jane Doe'
    );

    expect(getByTestId('extended-profile-college').props.children).toBe(
      'MedUniversity'
    );

    expect(getByTestId('extended-profile-subtitle').props.children).toBe(
      'Cardiologist'
    );

    // Match quote text without needing nested quotes
    expect(getByText(/Do no harm/)).toBeTruthy();
  });

  it('renders student profile', () => {
    mockState.profiles = {
      extendProfile: true,
      selectedProfile: {
        name: 'Alex Student',
        accountType: 'student',
        College: 'Med School',
        degree: 'MS3',
        major_minor: 'Surgery',
        online: false,
      },
    };

    const { getByTestId, getByText } = render(<ExtendedProfile />);

    expect(getByTestId('extended-profile-name').props.children).toBe(
      'Alex Student'
    );

    expect(getByTestId('extended-profile-subtitle').props.children).toBe(
      'MS3 • Surgery'
    );

    expect(getByText('Offline')).toBeTruthy();
  });

  it('closes when X button pressed', () => {
    const { getByTestId } = render(<ExtendedProfile />);

    fireEvent.press(getByTestId('extended-profile-close'));

    expect(closeProfile).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility labels', () => {
    const { getByTestId } = render(<ExtendedProfile />);

    const overlay = getByTestId('extended-profile-overlay');
    const label = overlay.props.accessibilityLabel;

    expect(label).toContain('Dr. Jane Doe');
    expect(label).toContain('professor');
    expect(label).toContain('MedUniversity');

    const closeButton = getByTestId('extended-profile-close');
    expect(closeButton.props.accessibilityLabel).toBe('Close profile');
  });
});
