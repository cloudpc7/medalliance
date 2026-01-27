import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsLink from './SettingsLink';

describe('SettingsLink', () => {
  it('renders label and icon when provided', () => {
    const { getByText, getByTestId } = render(
      <SettingsLink label="Notifications" icon="bell" onPress={jest.fn()} />
    );

    // Label
    expect(getByText('Notifications')).toBeTruthy();

    // Icon is mocked as <Text>{name}</Text>, with color on props.color
    const icon = getByTestId('icon-bell');
    expect(icon).toBeTruthy();
    expect(icon.props.children).toBe('bell');
    expect(icon.props.color).toBe('#126DA6'); // non-danger color
  });

  it('applies danger styles when danger=true', () => {
    const { getByText, getByTestId } = render(
      <SettingsLink
        label="Delete Account"
        icon="trash-can"
        danger
        onPress={jest.fn()}
      />
    );

    // Icon color should be danger red
    const icon = getByTestId('icon-trash-can');
    expect(icon.props.color).toBe('#EF4444');

    // Label should also be red (comes from styles.dangerText)
    const label = getByText('Delete Account');
    const labelStyleArray = Array.isArray(label.props.style)
      ? label.props.style
      : [label.props.style];

    expect(labelStyleArray).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#EF4444' }),
      ])
    );
  });

  it('shows right chevron arrow always', () => {
    const { getByTestId } = render(
      <SettingsLink label="Notifications" icon="bell" onPress={jest.fn()} />
    );

    const chevron = getByTestId('icon-chevron-right');
    expect(chevron).toBeTruthy();
    expect(chevron.props.children).toBe('chevron-right'); // from IconMock
    expect(chevron.props.color).toBe('#126DA6');
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();

    const { getByTestId } = render(
      <SettingsLink label="Profile" icon="user-pen" onPress={onPress} />
    );

    const row = getByTestId('settings-link');
    fireEvent.press(row);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies correct layout and styles to row', () => {
    const { getByTestId } = render(
      <SettingsLink label="Notifications" icon="bell" onPress={jest.fn()} />
    );

    const row = getByTestId('settings-link');

    expect(row.props.style).toMatchObject({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    });
  });

  it('is accessible as a button with label', () => {
    const { getByTestId } = render(
      <SettingsLink label="Edit Profile" icon="user-pen" onPress={jest.fn()} />
    );

    const row = getByTestId('settings-link');
    expect(row.props.accessibilityRole).toBe('button');
    expect(row.props.accessibilityLabel).toBe('Edit Profile');
  });
});
