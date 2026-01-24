// src/features/matching/ui/TopBar.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TopBar from './TopBar';

// ---- Mocks ----

// We only override expo-router here
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Avatar so we can simulate the tap
jest.mock('../../profile/ui/Avatar', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAvatar({ onPress }) {
    return (
      <Pressable testID="topbar-avatar" onPress={onPress}>
        <Text>Avatar</Text>
      </Pressable>
    );
  };
});

// Mock Filter just so it renders cleanly
jest.mock('../../filter/ui/Filter', () => {
  const React = require('react');
  const { View } = require('react-native');

  return function MockFilter() {
    return <View testID="topbar-filter" />;
  };
});

describe('TopBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Avatar and Filter', () => {
    const { getByTestId } = render(<TopBar />);

    expect(getByTestId('topbar-avatar')).toBeTruthy();
    expect(getByTestId('topbar-filter')).toBeTruthy();
    // We rely on the global mock for useSafeAreaInsets,
    // so no need to assert call counts here.
  });

  it('navigates to /profile-upload when avatar is pressed', () => {
    const { getByTestId } = render(<TopBar />);

    fireEvent.press(getByTestId('topbar-avatar'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/profile-upload');
  });
});
