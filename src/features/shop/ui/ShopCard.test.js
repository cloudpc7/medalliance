// src/features/shop/ui/__tests__/ShopCard.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ShopCard from './ShopCard';

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    FontAwesome6: ({ name }) => <Text testID={`icon-${name}`}>{name}</Text>,
  };
});

describe('ShopCard Component', () => {
  const mockItem = {
    id: '123',
    name: 'Anatomy Textbook',
    details: 'Dr. Gray',
    ISBN: '978-3-16-148410-0',
    price: 49.99,
    rating: 4.8,
    imageURL: 'http://example.com/book.jpg',
  };

  const mockCallbacks = {
    onBuy: jest.fn(),
    onToggleFavorite: jest.fn(),
    onIncreaseQty: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TEST 1: ROBUST RENDERING ---
  it('renders correctly with full data', () => {
    const { getByText, getByLabelText } = render(
      <ShopCard itemDetails={mockItem} />
    );

    // Check Text Content
    expect(getByText('Anatomy Textbook')).toBeTruthy();
    expect(getByText('Author: Dr. Gray')).toBeTruthy(); 
    expect(getByText('$49.99')).toBeTruthy();
    expect(getByText('4.8')).toBeTruthy();

    // Check Image Accessibility
    // This relies on accessible={true} and accessibilityLabel prop on the Image
    const image = getByLabelText('Anatomy Textbook product image');
    expect(image).toBeTruthy();
  });

  // --- TEST 2: CRASH PREVENTION (SECURITY) ---
  it('renders safely when itemDetails is undefined or empty', () => {
    const { getByText } = render(<ShopCard />); // No props passed

    expect(getByText('Unknown Item')).toBeTruthy();
    expect(getByText('$0.00')).toBeTruthy();
    expect(getByText('Details: No description available')).toBeTruthy();
  });

  // --- TEST 3: INTERACTION HANDLERS ---
  it('calls onBuy when "Buy Now" is pressed', () => {
    const { getByRole } = render(
      <ShopCard itemDetails={mockItem} onBuy={mockCallbacks.onBuy} />
    );

    const buyButton = getByRole('button', { name: /Buy Anatomy Textbook now/i });
    fireEvent.press(buyButton);

    expect(mockCallbacks.onBuy).toHaveBeenCalledWith('123');
  });

  it('calls onToggleFavorite when heart icon is pressed', () => {
    const { getByLabelText } = render(
      <ShopCard 
        itemDetails={mockItem} 
        onToggleFavorite={mockCallbacks.onToggleFavorite} 
      />
    );

    const heartBtn = getByLabelText('Add Anatomy Textbook to favorites');
    fireEvent.press(heartBtn);

    expect(mockCallbacks.onToggleFavorite).toHaveBeenCalledWith('123');
  });

  it('calls onIncreaseQty when plus button is pressed', () => {
     const { getByLabelText } = render(
      <ShopCard 
        itemDetails={mockItem} 
        onIncreaseQty={mockCallbacks.onIncreaseQty} 
      />
    );

    const plusBtn = getByLabelText('Increase quantity');
    fireEvent.press(plusBtn);

    expect(mockCallbacks.onIncreaseQty).toHaveBeenCalledWith('123');
  });

  // --- TEST 4: ACCESSIBILITY COMPLIANCE ---
  it('meets accessibility requirements (Roles and Labels)', () => {
    const { getByRole, getAllByRole, getByLabelText } = render(<ShopCard itemDetails={mockItem} />);

    // 1. Check Buttons count (Bookmark, Heart, Minus, Plus, Buy Now)
    const buttons = getAllByRole('button');
    expect(buttons.length).toBe(5);

    // 2. Check specific accessible labels exist
    expect(getByRole('button', { name: 'Decrease quantity' })).toBeTruthy();
    expect(getByRole('button', { name: 'Increase quantity' })).toBeTruthy();
    
    // 3. Check Image via Label (Google Play Content Description requirement)
    expect(getByLabelText('Anatomy Textbook product image')).toBeTruthy();
  });
});