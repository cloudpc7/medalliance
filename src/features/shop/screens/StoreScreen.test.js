import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import StoreScreen from './StoreScreen';

jest.mock('../../../../assets/splashscreen2.png', () => ({ uri: 'mock-splash-image' }));

jest.mock('../ui/StoreCard', () => {
  const { View, Text } = require('react-native');
  return ({ store }) => (
    <View testID="mock-store-card">
      <Text>{store.storeName}</Text>
    </View>
  );
});

jest.mock('../../navbar/NavBar', () => {
  const { View } = require('react-native');
  return () => <View testID="mock-navbar" />;
});

jest.mock('../../../ui/common/LoadingSpinner', () => {
  const { View } = require('react-native');
  return () => <View testID="loading-spinner" />;
});

// 3. Mock Redux Actions
jest.mock('../../../redux/slices/shop.slice', () => ({
  fetchStores: jest.fn(() => ({ type: 'shop/fetchStores' })),
}));

// 4. Use Dispatch Mock
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

describe('StoreScreen Component', () => {
  const mockUseSelector = jest.mocked(useSelector);
  const { fetchStores } = require('../../../redux/slices/shop.slice');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TEST CASE 1: LOADING STATE ---
  it('renders loading state correctly with accessible labels', () => {
    mockUseSelector.mockImplementation((selector) =>
      selector({
        shop: { data: [], loading: true, error: null },
      })
    );

    const { getByText, getByTestId, getByLabelText } = render(<StoreScreen />);

    // UI Check
    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();

    // Accessibility Check (Google Play Requirement)
    // We added accessibilityLabel="Loading background" in Step 1
    expect(getByLabelText('Loading background')).toBeTruthy();
  });

  // --- TEST CASE 2: API CALL ON MOUNT ---
  it('dispatches fetchStores when data is empty and not loading', () => {
    mockUseSelector.mockImplementation((selector) =>
      selector({
        shop: { data: [], loading: false, error: null },
      })
    );

    render(<StoreScreen />);
    
    // Ensure the API action was triggered
    expect(mockDispatch).toHaveBeenCalled();
    expect(fetchStores).toHaveBeenCalled();
  });

  // --- TEST CASE 3: EMPTY STATE ---
  it('renders empty state message when no stores exist', () => {
    mockUseSelector.mockImplementation((selector) =>
      selector({
        shop: { data: [], loading: false, error: null },
      })
    );

    const { getByText, getByRole } = render(<StoreScreen />);

    expect(getByText('The shop is empty right now.')).toBeTruthy();
    
    // Accessibility: Check that the title is treated as a header
    expect(getByRole('header', { name: 'The shop is empty right now.' })).toBeTruthy();
  });

  // --- TEST CASE 4: ERROR STATE ---
  it('renders error banner when there is an API error', () => {
    const errorMessage = 'Failed to connect to server';
    
    mockUseSelector.mockImplementation((selector) =>
      selector({
        shop: { data: [], loading: false, error: errorMessage },
      })
    );

    const { getByText } = render(<StoreScreen />);
    
    // Check if error text is present (ErrorBanner implementation dependent)
    // Assuming ErrorBanner renders the text passed to it
    expect(getByText(errorMessage)).toBeTruthy();
  });

  // --- TEST CASE 5: SUCCESS STATE (DATA DISPLAY) ---
  it('renders list of stores with correct navigation links', () => {
    const mockStores = [
      { id: '1', storeName: 'Medical Supplies' },
      { id: '2', storeName: 'Textbooks' },
    ];

    mockUseSelector.mockImplementation((selector) =>
      selector({
        shop: { data: mockStores, loading: false, error: null },
      })
    );

    const { getByText, getAllByTestId, getByRole } = render(<StoreScreen />);

    // 1. Header Check
    expect(getByRole('header', { name: 'Student Shop' })).toBeTruthy();

    // 2. Data Rendering Check
    expect(getByText('Medical Supplies')).toBeTruthy();
    expect(getByText('Textbooks')).toBeTruthy();
    
    // 3. Component Structure Check
    expect(getAllByTestId('mock-store-card')).toHaveLength(2);
    expect(getAllByTestId('mock-navbar')).toBeTruthy();
  });

  // --- TEST CASE 6: LINK INTEGRATION ---
  it('wraps store cards in Links with correct href', () => {
    const mockStores = [{ id: '99', storeName: 'Test Store' }];
    
    mockUseSelector.mockImplementation((selector) =>
      selector({ shop: { data: mockStores, loading: false, error: null } })
    );

    const { toJSON } = render(<StoreScreen />);
    const json = toJSON();
    const jsonString = JSON.stringify(json);
    expect(jsonString).toContain('/shop/99');
  });
});