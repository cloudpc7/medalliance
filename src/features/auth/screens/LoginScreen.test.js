import React from 'react';
import { render } from '@testing-library/react-native';

import LoginScreen from './LoginScreen'; 

const mockGoogleSignIn = 'mock-google-sign-in-button';
const mockLinkingComponent = 'mock-linking-component';
const mockSafeAreaView = 'SafeAreaView';
const mockImageBackground = 'ImageBackground'; 

// --- Tests ---

describe('LoginScreen', () => {
  test('renders without crashing and displays the main title', () => {
    // Act
    const { getByText, getByTestId, toJSON } = render(<LoginScreen />);

    // Assert 1: Renders without errors
    expect(toJSON()).toBeTruthy();
    
    // Assert 2: Displays the main title text
    expect(getByText('Med Alliance')).toBeTruthy();

    // Assert 3: Renders the SafeAreaView container with correct testID
    expect(getByTestId('login-screen')).toBeTruthy();
  });
  
  test('renders all custom components and uses the correct testIDs', () => {
    // Act
    const { getByTestId } = render(<LoginScreen />);

    // Assert 1: The background component is present
    expect(getByTestId('login-background')).toBeTruthy();

    // Assert 2: The Google Sign-In button component is mocked and present
    // Uses the testID defined in the mock above.
    expect(getByTestId(mockGoogleSignIn)).toBeTruthy(); 

    // Assert 3: The LinkComponent is mocked and present
    expect(getByTestId(mockLinkingComponent)).toBeTruthy();
  });

  test('ImageBackground receives the mock URI source correctly', () => {
    // We assume the global mock for LoginBackground_URL is 'mock-login-background-uri.jpg'
    const mockUri = 'mock-login-background-uri.jpg';

    // Act
    const { getByTestId } = render(<LoginScreen />);
    const imageBackground = getByTestId('login-background');
    expect(imageBackground.props.source).toEqual({ uri: mockUri });
  });

  test('Footer Link Component is rendered', () => {
  const { getByTestId } = render(<LoginScreen />);
  const linkComponent = getByTestId(mockLinkingComponent);
  expect(linkComponent).toBeTruthy();
});
});