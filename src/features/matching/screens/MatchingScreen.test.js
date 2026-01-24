import React from 'react';
import { render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';

import MatchingScreen from './MatchingScreen';

import { fetchProfilesAndPrecache } from '../../../redux/slices/profiles.slice';
import { useFilter } from '../../filter/util/useFilter';
import { useFilterProfileLogic } from '../../filter/util/filterProfileLogic';

jest.mock('../ui/ProfileSwipe', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockProfileSwipe() {
    return <View testID="profile-swipe" />;
  };
});

jest.mock('../ui/TopBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockTopBar() {
    return <View testID="top-bar" />;
  };
});

jest.mock('../../navbar/NavBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockNavBar() {
    return <View testID="nav-bar" />;
  };
});

jest.mock('../../filter/screens/FilterModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockFilterModal() {
    return <View testID="filter-modal" />;
  };
});

jest.mock('../../search/ui/SearchModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockSearchModal() {
    return <View testID="search-modal" />;
  };
});

jest.mock('../ui/ExtendedProfileCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockExtendedProfile() {
    return <View testID="extended-profile" />;
  };
});

jest.mock('../../../utils/errors/ErrorBanner', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockErrorBanner({ message }) {
    return (
      <View testID="error-banner">
        <Text>{message}</Text>
      </View>
    );
  };
});

// --- Logic & thunk mocks ---

jest.mock('../../../redux/slices/profiles.slice', () => ({
  fetchProfilesAndPrecache: jest.fn(() => ({
    type: 'profiles/fetchProfilesAndPrecache',
  })),
}));

jest.mock('../../filter/util/useFilter', () => ({
  useFilter: jest.fn(),
}));

jest.mock('../../filter/util/filterProfileLogic', () => ({
  useFilterProfileLogic: jest.fn(),
}));

describe('MatchingScreen', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  it('dispatches fetchProfilesAndPrecache on mount', () => {
    // state shape for useSelector
    useSelector.mockImplementation((selector) =>
      selector({
        profiles: {
          extendProfile: false,
          loading: false,
          error: null,
          profiles: [],
        },
      })
    );

    // hooks we don't care about here
    useFilter.mockReturnValue(undefined);
    useFilterProfileLogic.mockReturnValue({
      profilesToShow: [],
      showNoMatchesMessage: false,
    });

    render(<MatchingScreen />);

    // The thunk creator should be called
    expect(fetchProfilesAndPrecache).toHaveBeenCalledTimes(1);

    // And dispatch should receive the action it returned
    expect(mockDispatch).toHaveBeenCalledWith(fetchProfilesAndPrecache());
  });

  it('shows loading spinner when loading is true', () => {
    useSelector.mockImplementation((selector) =>
      selector({
        profiles: {
          extendProfile: false,
          loading: true,
          error: null,
          profiles: [],
        },
      })
    );

    useFilter.mockReturnValue(undefined);
    useFilterProfileLogic.mockReturnValue({
      profilesToShow: [],
      showNoMatchesMessage: false,
    });

    const { getByTestId, getByText, queryByTestId } = render(
      <MatchingScreen />
    );

    // We don't have a matching-loading testID; we just check spinner + text
    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();

    // The main screen (SafeAreaView matching-screen) is not rendered in this branch
    expect(queryByTestId('matching-screen')).toBeNull();
  });

  it('renders ProfileSwipe when there are profiles and extendProfile is false', () => {
    useSelector.mockImplementation((selector) =>
      selector({
        profiles: {
          extendProfile: false,
          loading: false,
          error: null,
          profiles: [{ id: '1' }],
        },
      })
    );

    useFilter.mockReturnValue(undefined);
    useFilterProfileLogic.mockReturnValue({
      profilesToShow: [{ id: '1' }],
      showNoMatchesMessage: false,
    });

    const { getByTestId, queryByTestId } = render(<MatchingScreen />);

    expect(getByTestId('matching-screen')).toBeTruthy();
    expect(getByTestId('profile-swipe')).toBeTruthy();
    expect(queryByTestId('extended-profile')).toBeNull();
    expect(getByTestId('nav-bar')).toBeTruthy();
  });

  it('shows no matches message and hides NavBar when no profiles and showNoMatchesMessage is true', () => {
    // IMPORTANT:
    // profiles.length > 0 but profilesToShow.length === 0
    // → "No matches for these filters" branch
    useSelector.mockImplementation((selector) =>
      selector({
        profiles: {
          extendProfile: false,
          loading: false,
          error: null,
          profiles: [{ id: '1' }],
        },
      })
    );

    useFilter.mockReturnValue(undefined);
    useFilterProfileLogic.mockReturnValue({
      profilesToShow: [],
      showNoMatchesMessage: true,
    });

    const { getByTestId, getByText, queryByTestId } = render(
      <MatchingScreen />
    );

    expect(getByTestId('matching-screen')).toBeTruthy();
    expect(getByTestId('matching-no-results')).toBeTruthy();
    expect(getByText('No matches for these filters')).toBeTruthy();

    expect(queryByTestId('profile-swipe')).toBeNull();
    expect(queryByTestId('extended-profile')).toBeNull();

    // NavBar should be hidden when showNoMatchesMessage is true
    expect(queryByTestId('nav-bar')).toBeNull();
  });
});
