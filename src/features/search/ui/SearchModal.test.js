import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';

import SearchModal from './SearchModal';

import {
  closeSearch,
  setQuery,
  clearSearch,
  selectSearchOpen,
  selectSearchQuery,
  selectFilteredSearchResults,
} from '../../../redux/slices/search.slice';
import { openProfile } from '../../../redux/slices/profiles.slice';

// --- LOCAL expo-router MOCK (overrides global one for this file) ---
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}));

// --- Mock search slice action creators / selectors ---
jest.mock('../../../redux/slices/search.slice', () => ({
  closeSearch: jest.fn(() => ({ type: 'search/close' })),
  setQuery: jest.fn((q) => ({ type: 'search/setQuery', payload: q })),
  clearSearch: jest.fn(() => ({ type: 'search/clear' })),
  selectSearchOpen: jest.fn(),
  selectSearchQuery: jest.fn(),
  selectFilteredSearchResults: jest.fn(),
}));

// --- Mock profiles slice (openProfile) ---
jest.mock('../../../redux/slices/profiles.slice', () => ({
  openProfile: jest.fn((profile) => ({
    type: 'profiles/openProfile',
    payload: profile,
  })),
}));

const mockDispatch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // react-redux hooks are globally mocked; we control them here
  useDispatch.mockReturnValue(mockDispatch);

  // Default useSelector implementation calls the selector with an empty state object
  useSelector.mockImplementation((selectorFn) => selectorFn({}));

  // Default selector values
  selectSearchOpen.mockReturnValue(true);
  selectSearchQuery.mockReturnValue('');
  selectFilteredSearchResults.mockReturnValue([]);

  // Reset router mocks
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe('SearchModal', () => {
  it('renders effectively "closed" when search modal is not open', () => {
    // Make modal closed
    selectSearchOpen.mockReturnValue(false);

    const { queryByTestId } = render(<SearchModal />);

    // When closed, search content should not be present
    expect(queryByTestId('search-input')).toBeNull();
  });

  it('shows initial empty-search state when query is empty', () => {
    selectSearchOpen.mockReturnValue(true);
    selectSearchQuery.mockReturnValue('');
    selectFilteredSearchResults.mockReturnValue([]);

    const { getByText } = render(<SearchModal />);

    expect(getByText('Search profiles')).toBeTruthy();
    expect(
      getByText('Type a name to quickly jump to a mentor or student.')
    ).toBeTruthy();
  });

  it('shows "No matches found" when query has text but results are empty', () => {
    selectSearchOpen.mockReturnValue(true);
    selectSearchQuery.mockReturnValue('John');
    selectFilteredSearchResults.mockReturnValue([]);

    const { getByText } = render(<SearchModal />);

    expect(getByText('No matches found')).toBeTruthy();
    expect(
      getByText('Try a different spelling or search by full name.')
    ).toBeTruthy();
  });

  it('renders results and handles selecting a profile', () => {
    const results = [
      {
        id: '1',
        name: 'John Doe',
        accountType: 'Student',
        profession: 'Medical Student',
        department: 'Cardiology',
      },
    ];

    selectSearchOpen.mockReturnValue(true);
    selectSearchQuery.mockReturnValue('John');
    selectFilteredSearchResults.mockReturnValue(results);

    const { getByTestId } = render(<SearchModal />);

    const row = getByTestId('search-result-1');
    fireEvent.press(row);

    const profile = results[0];

    // Ensure action creators called with correct payload
    expect(openProfile).toHaveBeenCalledWith(profile);
    expect(closeSearch).toHaveBeenCalled();
    expect(clearSearch).toHaveBeenCalled();

    // Ensure dispatch got the produced actions
    expect(mockDispatch).toHaveBeenCalledWith(openProfile(profile));
    expect(mockDispatch).toHaveBeenCalledWith(closeSearch());
    expect(mockDispatch).toHaveBeenCalledWith(clearSearch());

    // Ensure navigation back to '/'
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('closes modal and clears search when close button pressed', () => {
    selectSearchOpen.mockReturnValue(true);
    selectSearchQuery.mockReturnValue('');
    selectFilteredSearchResults.mockReturnValue([]);

    const { getByTestId } = render(<SearchModal />);

    const closeButton = getByTestId('search-close-button');
    fireEvent.press(closeButton);

    expect(closeSearch).toHaveBeenCalledTimes(1);
    expect(clearSearch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(closeSearch());
    expect(mockDispatch).toHaveBeenCalledWith(clearSearch());
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('dispatches setQuery when typing in the search input', () => {
    selectSearchOpen.mockReturnValue(true);
    selectSearchQuery.mockReturnValue('');
    selectFilteredSearchResults.mockReturnValue([]);

    const { getByTestId } = render(<SearchModal />);
    const input = getByTestId('search-input');

    fireEvent.changeText(input, 'Anna');

    expect(setQuery).toHaveBeenCalledWith('Anna');
    expect(mockDispatch).toHaveBeenCalledWith(setQuery('Anna'));
  });

  it('shows clear button when query has text and clears on press', () => {
    selectSearchOpen.mockReturnValue(true);
    selectSearchQuery.mockReturnValue('A');
    selectFilteredSearchResults.mockReturnValue([]);

    const { getByTestId } = render(<SearchModal />);

    const clearButton = getByTestId('search-clear-button');
    fireEvent.press(clearButton);

    expect(clearSearch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(clearSearch());
  });

  it('has basic accessibility props on close button and search input', () => {
    selectSearchOpen.mockReturnValue(true);
    selectSearchQuery.mockReturnValue('');
    selectFilteredSearchResults.mockReturnValue([]);

    const { getByTestId } = render(<SearchModal />);

    const closeButton = getByTestId('search-close-button');
    const input = getByTestId('search-input');

    expect(closeButton.props.accessibilityRole).toBe('button');
    expect(closeButton.props.accessibilityLabel).toContain('Close search');

    expect(input.props.accessibilityRole).toBe('search');
    expect(input.props.accessibilityLabel).toContain(
      'Search profiles by name'
    );
  });
});
