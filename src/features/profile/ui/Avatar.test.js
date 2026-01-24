// src/features/profile/ui/Avatar.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import Avatar from './Avatar';
import { useSelector } from 'react-redux';
import { selectCurrentUserProfile } from '../../../redux/slices/profiles.slice';

// react-redux is globally mocked; this gives us that jest.fn
const mockUseSelector = useSelector;

// mock the selector so we control its return value
jest.mock('../../../redux/slices/profiles.slice', () => ({
  selectCurrentUserProfile: jest.fn(),
}));

const mockSelectCurrentUserProfile = selectCurrentUserProfile;

describe('Avatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // useSelector calls the selector function; selector returns our mocked value
    mockUseSelector.mockImplementation((selectorFn) => selectorFn());
  });

  it('renders fallback when no avatarImage and no store avatarUrl', () => {
    mockSelectCurrentUserProfile.mockReturnValue({ avatarUrl: null });

    const { getByTestId, queryByTestId } = render(<Avatar />);

    const wrapper = getByTestId('avatar-wrapper');
    const fallback = getByTestId('avatar-fallback');
    const image = queryByTestId('avatar-image');

    expect(wrapper).toBeTruthy();
    expect(fallback).toBeTruthy();
    expect(image).toBeNull();

    // Accessibility
    expect(wrapper.props.accessible).toBe(true);
    expect(wrapper.props.accessibilityRole).toBe('image');
    expect(wrapper.props.accessibilityLabel).toBe('Add avatar');
    expect(wrapper.props.accessibilityHint).toBeUndefined();
  });

  it('uses store avatarUrl when available', () => {
    mockSelectCurrentUserProfile.mockReturnValue({
      avatarUrl: 'https://example.com/store-avatar.jpg',
    });

    const { getByTestId } = render(<Avatar />);

    const wrapper = getByTestId('avatar-wrapper');
    const image = getByTestId('avatar-image');

    expect(image).toBeTruthy();
    expect(image.props.source).toEqual({
      uri: 'https://example.com/store-avatar.jpg',
    });

    expect(wrapper.props.accessibilityRole).toBe('image');
    expect(wrapper.props.accessibilityLabel).toBe('User avatar');
  });

  it('prefers avatarImage prop over store avatarUrl', () => {
    mockSelectCurrentUserProfile.mockReturnValue({
      avatarUrl: 'https://example.com/store-avatar.jpg',
    });

    const { getByTestId } = render(
      <Avatar avatarImage="https://example.com/prop-avatar.png" />
    );

    const image = getByTestId('avatar-image');
    expect(image.props.source).toEqual({
      uri: 'https://example.com/prop-avatar.png',
    });
  });

  it('renders as pressable when onPress is provided and is clickable', () => {
    mockSelectCurrentUserProfile.mockReturnValue({
      avatarUrl: 'https://example.com/avatar.jpg',
    });

    const handlePress = jest.fn();

    const { getByTestId } = render(<Avatar onPress={handlePress} />);

    const wrapper = getByTestId('avatar-wrapper');
    expect(wrapper).toBeTruthy();

    // Accessibility: behaves like a button
    expect(wrapper.props.accessibilityRole).toBe('button');
    expect(wrapper.props.accessibilityLabel).toBe('User avatar');
    expect(typeof wrapper.props.accessibilityHint).toBe('string');

    // Behavior: pressing triggers the callback
    fireEvent.press(wrapper);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('applies dynamic size and borderRadius correctly when not pressable', () => {
    mockSelectCurrentUserProfile.mockReturnValue({ avatarUrl: null });

    const size = 80;
    const { getByTestId } = render(<Avatar size={size} />);

    const wrapper = getByTestId('avatar-wrapper');
    const flattened = StyleSheet.flatten(wrapper.props.style);

    expect(flattened.width).toBe(size);
    expect(flattened.height).toBe(size);
    expect(flattened.borderRadius).toBe(size / 2);
  });

  it('shows "Add avatar" label even when pressable but no image', () => {
    mockSelectCurrentUserProfile.mockReturnValue({ avatarUrl: null });

    const onPress = jest.fn();
    const { getByTestId } = render(<Avatar onPress={onPress} />);

    const wrapper = getByTestId('avatar-wrapper');

    expect(wrapper.props.accessibilityRole).toBe('button');
    expect(wrapper.props.accessibilityLabel).toBe('Add avatar');
    expect(typeof wrapper.props.accessibilityHint).toBe('string');

    fireEvent.press(wrapper);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
