// src/features/matching/ui/ProfileSwipe.test.js

import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileSwipe from './ProfileSwipe';
import { useDispatch, useSelector } from 'react-redux';
import Swiper from 'react-native-deck-swiper';
import ProfileCard from './ProfileCard';
import {
  openProfile,
  setProfileIndex,
  swipeProfile,
  resetIndex,
} from '../../../redux/slices/profiles.slice';

// ---- Mocks ----

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock redux slice action creators
jest.mock('../../../redux/slices/profiles.slice', () => ({
  openProfile: jest.fn((profile) => ({
    type: 'profiles/openProfile',
    payload: profile,
  })),
  setProfileIndex: jest.fn((idx) => ({
    type: 'profiles/setProfileIndex',
    payload: idx,
  })),
  swipeProfile: jest.fn(() => ({
    type: 'profiles/swipeProfile',
  })),
  resetIndex: jest.fn(() => ({
    type: 'profiles/resetIndex',
  })),
}));

// Mock ProfileCard so we don't pull in its whole tree
jest.mock('./ProfileCard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MockProfileCard = (props) => (
    <View testID="mock-profile-card">
      <Text>{props.profile?.name}</Text>
      {props.imageUri ? <Text>{props.imageUri}</Text> : null}
    </View>
  );

  return {
    __esModule: true,
    default: MockProfileCard,
  };
});

// Mock Swiper so we can inspect props
jest.mock('react-native-deck-swiper', () => {
  const mockSwiper = jest.fn((props) => {
    // We don’t *have* to render anything here for most tests, since
    // we can poke at props directly via Swiper.mock.calls
    return null;
  });

  return {
    __esModule: true,
    default: mockSwiper,
  };
});

describe('ProfileSwipe', () => {
  const mockDispatch = jest.fn();
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockClear();

    mockState = {
      images: {
        cachedUris: {},
      },
      profiles: {
        currentIndex: 0,
      },
    };

    useSelector.mockImplementation((selector) => selector(mockState));
    useDispatch.mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    useSelector.mockReset();
    useDispatch.mockReset();
  });

  it('returns null when profiles prop is empty or missing', () => {
    // No profiles
    const { toJSON: noProfilesJson } = render(
      <ProfileSwipe profiles={null} />,
    );
    expect(noProfilesJson()).toBeNull();
    expect(Swiper).not.toHaveBeenCalled();

    // Empty array
    const { toJSON: emptyProfilesJson } = render(
      <ProfileSwipe profiles={[]} />,
    );
    expect(emptyProfilesJson()).toBeNull();
    expect(Swiper).not.toHaveBeenCalled();
  });

  it('passes profiles and currentIndex into Swiper', () => {
    mockState.profiles.currentIndex = 2;

    const profiles = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ];

    render(<ProfileSwipe profiles={profiles} />);

    expect(Swiper).toHaveBeenCalledTimes(1);
    const swiperProps = Swiper.mock.calls[0][0];

    expect(swiperProps.cards).toBe(profiles);
    expect(swiperProps.cardIndex).toBe(2);
    expect(swiperProps.verticalSwipe).toBe(false);
    expect(swiperProps.infinite).toBe(true);
  });

  it('uses cachedUris when available to compute imageUri', () => {
    const uri = 'https://example.com/avatar.jpg';
    const cached = 'cached://avatar';

    mockState.images.cachedUris = {
      [uri]: cached,
    };

    const profiles = [
      { id: 1, name: 'Cached User', avatarUrl: uri },
    ];

    render(<ProfileSwipe profiles={profiles} />);

    expect(Swiper).toHaveBeenCalledTimes(1);
    const swiperProps = Swiper.mock.calls[0][0];

    // Call renderCard manually with the first profile
    const element = swiperProps.renderCard(profiles[0]);

    // element is <ProfileCard profile={...} imageUri={...} />
    expect(element.props.profile).toEqual(profiles[0]);
    expect(element.props.imageUri).toBe(cached);
  });

  it('dispatches swipeProfile when onSwiped is called', () => {
    const profiles = [{ id: 1 }, { id: 2 }];

    render(<ProfileSwipe profiles={profiles} />);

    const swiperProps = Swiper.mock.calls[0][0];

    // Simulate a card swipe
    swiperProps.onSwiped && swiperProps.onSwiped(0);

    expect(swipeProfile).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('dispatches resetIndex when onSwipedAll is called', () => {
    const profiles = [{ id: 1 }];

    render(<ProfileSwipe profiles={profiles} />);

    const swiperProps = Swiper.mock.calls[0][0];

    swiperProps.onSwipedAll && swiperProps.onSwipedAll();

    expect(resetIndex).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('dispatches setProfileIndex and openProfile when onTapCard is called', () => {
    const profiles = [
      { id: 1, name: 'First' },
      { id: 2, name: 'Second' },
    ];

    render(<ProfileSwipe profiles={profiles} />);

    const swiperProps = Swiper.mock.calls[0][0];

    // Tap the second card (index 1)
    swiperProps.onTapCard && swiperProps.onTapCard(1);

    expect(setProfileIndex).toHaveBeenCalledTimes(1);
    expect(setProfileIndex).toHaveBeenCalledWith(1);

    expect(openProfile).toHaveBeenCalledTimes(1);
    expect(openProfile).toHaveBeenCalledWith(profiles[1]);

    // Dispatch should be called twice (setProfileIndex + openProfile)
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('does nothing when onTapCard index is out of range', () => {
    const profiles = [{ id: 1, name: 'Only' }];

    render(<ProfileSwipe profiles={profiles} />);

    const swiperProps = Swiper.mock.calls[0][0];

    swiperProps.onTapCard && swiperProps.onTapCard(99);

    expect(setProfileIndex).not.toHaveBeenCalled();
    expect(openProfile).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
