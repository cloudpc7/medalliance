// src/features/shop/screens/ShopScreen.test.js

import React from 'react';
import { render } from '@testing-library/react-native';
import { useSelector } from 'react-redux';
import ShopScreen from './ShopScreen';

// Grab the helpers from the expo-router global mock
import { __mockRouter } from 'expo-router';

// Mock child components that aren’t the focus of these tests
jest.mock('../ui/ShopCard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return ({ itemDetails }) => (
    <View testID="shop-card">
      <Text>{itemDetails?.name}</Text>
    </View>
  );
});

jest.mock('../../navbar/NavBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="nav-bar" />;
});

jest.mock('../../../utils/errors/ErrorBanner', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return ({ message }) => (
    <View testID="error-banner">
      <Text>{message}</Text>
    </View>
  );
});

describe('ShopScreen', () => {
  // Properly mock useSelector
  const mockUseSelector = jest.mocked(useSelector);

  beforeEach(() => {
    jest.clearAllMocks();

    // Default state: no stores, not loading, no error
    mockUseSelector.mockImplementation((selectorFn) =>
      selectorFn({
        shop: {
          data: [],
          loading: false,
          error: null,
        },
      })
    );

    // Default: no route params
    __mockRouter.mockUseLocalSearchParams.mockReturnValue({});
  });

  it('shows LoadingSpinner when loading is true', () => {
    mockUseSelector.mockImplementation((selectorFn) =>
      selectorFn({
        shop: {
          data: [],
          loading: true,
          error: null,
        },
      })
    );

    const { getByTestId } = render(<ShopScreen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('shows ErrorBanner when there is an error', () => {
    mockUseSelector.mockImplementation((selectorFn) =>
      selectorFn({
        shop: {
          data: [],
          loading: false,
          error: 'Failed to load shops',
        },
      })
    );

    const { getByTestId, getByText } = render(<ShopScreen />);

    const banner = getByTestId('error-banner');
    expect(banner).toBeTruthy();
    expect(getByText('Failed to load shops')).toBeTruthy();
  });

  it('shows "Store not found" when no matching store exists', () => {
    __mockRouter.mockUseLocalSearchParams.mockReturnValue({ id: 'store-1' });

    mockUseSelector.mockImplementation((selectorFn) =>
      selectorFn({
        shop: {
          data: [], // no stores
          loading: false,
          error: null,
        },
      })
    );

    const { getByText } = render(<ShopScreen />);
    expect(getByText('Store not found')).toBeTruthy();
  });

  it('shows "No items yet" when store exists but has no items', () => {
    __mockRouter.mockUseLocalSearchParams.mockReturnValue({ id: 'store-1' });

    mockUseSelector.mockImplementation((selectorFn) =>
      selectorFn({
        shop: {
          data: [
            {
              id: 'store-1',
              storeName: 'MedJourney Store',
              items: [],
            },
          ],
          loading: false,
          error: null,
        },
      })
    );

    const { getByText, queryAllByTestId } = render(<ShopScreen />);

    expect(getByText('Med Alliance Store')).toBeTruthy();
    expect(getByText('No items yet')).toBeTruthy();
    expect(queryAllByTestId('shop-card')).toHaveLength(0);
  });

  it('renders ShopCard for each item when store has items', () => {
    __mockRouter.mockUseLocalSearchParams.mockReturnValue({ id: 'store-1' });

    mockUseSelector.mockImplementation((selectorFn) =>
      selectorFn({
        shop: {
          data: [
            {
              id: 'store-1',
              storeName: 'MedJourney Store',
              items: [
                { id: 'item-1', name: 'Stethoscope' },
                { id: 'item-2', name: 'Scrubs' },
              ],
            },
          ],
          loading: false,
          error: null,
        },
      })
    );

    const { getByText, getAllByTestId, getByTestId } = render(<ShopScreen />);

    expect(getByText('MedJourney Store')).toBeTruthy();

    const cards = getAllByTestId('shop-card');
    expect(cards).toHaveLength(2);

    expect(getByText('Stethoscope')).toBeTruthy();
    expect(getByText('Scrubs')).toBeTruthy();

    expect(getByTestId('nav-bar')).toBeTruthy();
  });
});