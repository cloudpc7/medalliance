// src/features/shop/ui/__tests__/StoreCard.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StoreCard from './StoreCard';

// 1. Mock External Libraries
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ style }) => <placeholder-gradient style={style} />,
}));

// 2. Mock Expo Router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('StoreCard Component', () => {
  const mockStore = {
    id: 'store_123',
    storeName: 'Tech Haven',
    storeImageURL: 'https://example.com/image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TEST 1: HAPPY PATH RENDERING ---
  it('renders correctly with image and text', () => {
    const { getByText, getByTestId } = render(<StoreCard store={mockStore} />);

    // Check main container existence
    expect(getByTestId('store-card-main')).toBeTruthy();
    
    // Check text content
    expect(getByText('Tech Haven')).toBeTruthy();
    expect(getByText('Tap to explore')).toBeTruthy();
  });

  // --- TEST 2: FALLBACK RENDERING ---
  it('renders fallback view when storeImageURL is missing', () => {
    const storeWithoutImage = { ...mockStore, storeImageURL: null };
    
    const { getByText, getByTestId } = render(<StoreCard store={storeWithoutImage} />);

    // Check fallback container
    expect(getByTestId('store-card-fallback')).toBeTruthy();
    expect(getByText('No Image')).toBeTruthy();
    expect(getByText('Tech Haven')).toBeTruthy();
  });

  // --- TEST 3: NAVIGATION INTERACTION ---
  it('navigates to correct route on press (Standalone mode)', () => {
    const { getByTestId } = render(<StoreCard store={mockStore} />);

    const card = getByTestId('store-card-main');
    fireEvent.press(card);

    expect(mockPush).toHaveBeenCalledWith('/shop/store_123');
  });

  // --- TEST 4: EXTERNAL ONPRESS (Link Compatibility) ---
  it('uses provided onPress prop if available (e.g., from Link)', () => {
    const externalPress = jest.fn();
    const { getByTestId } = render(
      <StoreCard store={mockStore} onPress={externalPress} />
    );

    const card = getByTestId('store-card-main');
    fireEvent.press(card);

    // Should call the passed prop, NOT the internal router logic (unless the prop calls it)
    expect(externalPress).toHaveBeenCalled();
    // In our implementation, we prioritize the prop. 
    // Usually, the prop *is* the logic provided by Link.
  });

  // --- TEST 5: ACCESSIBILITY ---
  it('has correct accessibility roles and labels', () => {
    const { getByRole, getByLabelText } = render(<StoreCard store={mockStore} />);

    // 1. Role Check
    const button = getByRole('button');
    expect(button).toBeTruthy();

    // 2. Label Check (Google Play Requirement)
    // We expect the button to label itself with the store name
    expect(getByLabelText('Store, Tech Haven')).toBeTruthy();
  });

  // --- TEST 6: CRASH PREVENTION ---
  it('renders safely without crashing when store prop is undefined', () => {
    // This ensures no "Cannot read property of undefined" errors
    const { getByText } = render(<StoreCard />); 

    // Should hit fallback UI with default text
    expect(getByText('No Image')).toBeTruthy();
    expect(getByText('Store')).toBeTruthy(); // Default name
  });
});