// src/ui/common/SettingsSwitch.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsSwitch from './SettingsSwitch';

describe('SettingsSwitch', () => {
  it('renders label and uses `value` when provided', () => {
    const { getByText, getByA11yRole } = render(
      <SettingsSwitch
        label="Dark Mode"
        value={true}
        initialValue={false}
        onValueChange={jest.fn()}
      />
    );

    // Label is shown
    expect(getByText('Dark Mode')).toBeTruthy();

    // Switch should be on because `value` takes precedence over `initialValue`
    const sw = getByA11yRole('switch');
    expect(sw.props.value).toBe(true);
    // Thumb color when on
    expect(sw.props.thumbColor).toBe('#126DA6');
  });

  it('falls back to `initialValue` when `value` is undefined', () => {
    const { getByA11yRole } = render(
      <SettingsSwitch
        label="Notifications"
        // value is intentionally omitted so it is `undefined`
        initialValue={true}
        onValueChange={jest.fn()}
      />
    );

    const sw = getByA11yRole('switch');
    // Uses initialValue since value is undefined
    expect(sw.props.value).toBe(true);
  });

  it('calls onValueChange when toggled', () => {
    const onValueChange = jest.fn();

    const { getByA11yRole } = render(
      <SettingsSwitch
        label="Online Status"
        value={false}
        onValueChange={onValueChange}
      />
    );

    const sw = getByA11yRole('switch');

    // Simulate the user toggling the switch to true
    fireEvent(sw, 'valueChange', true);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('is accessible as a switch with a visible text label', () => {
    const { getByText, getByA11yRole } = render(
      <SettingsSwitch
        label="Profile Visibility"
        value={true}
        onValueChange={jest.fn()}
      />
    );

    // Label text is visible for screen readers and users
    const label = getByText('Profile Visibility');
    expect(label).toBeTruthy();

    // There is a switch control
    const sw = getByA11yRole('switch');
    expect(sw).toBeTruthy();
  });
});
