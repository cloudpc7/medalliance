// screens/FilterModal.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FilterModal from './FilterModal';
import { useFilter } from '../util/useFilter';

jest.mock('../util/useFilter');

// Mock FilterSelectScreen so we can assert it renders and handles props
jest.mock('../ui/FilterSelectScreen', () => ({
  FilterSelectScreen: ({ section, onBack }) => {
    const React = require('react');
    const { Text, Pressable } = require('react-native');

    return (
      <Pressable testID="mock-filter-select" onPress={onBack}>
        <Text>{section}</Text>
      </Pressable>
    );
  },
}));

const baseSummary = {
  accountType: 'Any',
  online: 'Any',
  college: 'Any',
  degree: 'Any',
  department: 'Any',
  format: 'Any',
  majorMinor: 'Any',
  occupation: 'Any',
  goals: 'Any',
  quote: 'Any',
  group: 'Any',
};

describe('FilterModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when isOpen is false', () => {
    useFilter.mockReturnValue({
      isOpen: false,
      activeSection: 'main',
      summary: baseSummary,
      currentSection: null,
      goToSection: jest.fn(),
      goBack: jest.fn(),
      close: jest.fn(),
      clear: jest.fn(),
    });

    const { toJSON } = render(<FilterModal />);
    expect(toJSON()).toBeNull();
  });

  it('renders header and main summary when open on main section', () => {
    useFilter.mockReturnValue({
      isOpen: true,
      activeSection: 'main',
      summary: baseSummary,
      currentSection: null,
      goToSection: jest.fn(),
      goBack: jest.fn(),
      close: jest.fn(),
      clear: jest.fn(),
    });

    const { getByTestId, getByText, getAllByText } = render(<FilterModal />);

    // Header via testIDs
    expect(getByTestId('filter-modal-root')).toBeTruthy();
    expect(getByTestId('filter-modal-header')).toBeTruthy();
    expect(getByText('Filters')).toBeTruthy();
    expect(getByText('Done')).toBeTruthy();

    // Summary card title
    expect(getByText('Current filters')).toBeTruthy();

    // Labels/values can be duplicated; use getAllByText safely
    const accountLabels = getAllByText('Account type');
    expect(accountLabels.length).toBeGreaterThan(0);

    const anyValues = getAllByText('Any');
    expect(anyValues.length).toBeGreaterThan(0);
  });

  it('calls goToSection when a filter row is pressed', () => {
    const goToSection = jest.fn();

    useFilter.mockReturnValue({
      isOpen: true,
      activeSection: 'main',
      summary: baseSummary,
      currentSection: null,
      goToSection,
      goBack: jest.fn(),
      close: jest.fn(),
      clear: jest.fn(),
    });

    const { getByTestId } = render(<FilterModal />);

    // Click the Account type filter row using testID (avoids duplicate text issue)
    fireEvent.press(getByTestId('filter-row-accountType'));

    expect(goToSection).toHaveBeenCalledTimes(1);
    expect(goToSection).toHaveBeenCalledWith('accountType');
  });

  it('calls clear when "Reset all filters" is pressed', () => {
    const clear = jest.fn();

    useFilter.mockReturnValue({
      isOpen: true,
      activeSection: 'main',
      summary: baseSummary,
      currentSection: null,
      goToSection: jest.fn(),
      goBack: jest.fn(),
      close: jest.fn(),
      clear,
    });

    const { getByTestId } = render(<FilterModal />);

    fireEvent.press(getByTestId('filter-modal-reset'));

    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('calls close when Done is pressed', () => {
    const close = jest.fn();

    useFilter.mockReturnValue({
      isOpen: true,
      activeSection: 'main',
      summary: baseSummary,
      currentSection: null,
      goToSection: jest.fn(),
      goBack: jest.fn(),
      close,
      clear: jest.fn(),
    });

    const { getByTestId } = render(<FilterModal />);

    fireEvent.press(getByTestId('filter-modal-done'));

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('renders FilterSelectScreen when activeSection is not main', () => {
    const goBack = jest.fn();

    useFilter.mockReturnValue({
      isOpen: true,
      activeSection: 'accountType',
      summary: baseSummary,
      currentSection: 'accountType',
      goToSection: jest.fn(),
      goBack,
      close: jest.fn(),
      clear: jest.fn(),
    });

    const { getByTestId, getByText } = render(<FilterModal />);

    // Our mocked FilterSelectScreen
    expect(getByTestId('mock-filter-select')).toBeTruthy();
    expect(getByText('accountType')).toBeTruthy();

    // onBack wiring
    fireEvent.press(getByTestId('mock-filter-select'));
    expect(goBack).toHaveBeenCalledTimes(1);
  });
});
