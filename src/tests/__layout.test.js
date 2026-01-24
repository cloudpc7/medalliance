import React from 'react';
import { render } from '@testing-library/react-native';

// --- Component ---
import RootLayout from '../app/_layout';

// --- Redux Mocks ---
import { useDispatch, useSelector } from 'react-redux';

// --- Custom Hook Mocks ---
// We mock these to prevent the actual logic (which contains listeners) from running
jest.mock('../utils/fontsandicons/Fonts', () => ({
  useAppFonts: jest.fn(),
}));

jest.mock('../features/auth/utils/authorizationChange', () => ({
  useAuthorizationSubscriber: jest.fn(),
}));

jest.mock('../features/auth/utils/router', () => ({
  useAuthRouter: jest.fn(),
}));

// Import the mocked hooks so we can control their return values
import { useAppFonts } from '../utils/fontsandicons/Fonts';
import { useAuthorizationSubscriber } from '../features/auth/utils/authorizationChange';
import { useAuthRouter } from '../features/auth/utils/router';

describe('RootLayout', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // 1. Redux Setup
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { 
          user: { uid: 'test-user-123' } 
        }
      })
    );

    // 2. Hook Implementation
    // We return undefined because these are void hooks, preventing 'unsubscribe' errors
    useAuthorizationSubscriber.mockImplementation(() => {});
    useAuthRouter.mockImplementation(() => {});
    useAppFonts.mockReturnValue(true);
  });

  /**
   * Test: Basic Rendering
   */
  test('renders application stack without throwing', () => {
    expect(() => render(<RootLayout />)).not.toThrow();
  });

  /**
   * Test: Hook Initialization
   */
  test('initializes required auth hooks on mount', () => {
    render(<RootLayout />);
    expect(useAuthorizationSubscriber).toHaveBeenCalledTimes(1);
    expect(useAuthRouter).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Loading State
   */
  test('renders UI structure even while fonts are loading', () => {
    useAppFonts.mockReturnValue(false);
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).not.toBeNull();
  });

  /**
   * Test: Provider Integration
   */
  test('renders global provider wrappers', () => {
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId('mock-safe-area-provider')).toBeTruthy();
    expect(getByTestId('mock-error-boundary')).toBeTruthy();
    expect(getByTestId('mock-toast-message')).toBeTruthy();
  });
});