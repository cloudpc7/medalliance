import React from 'react';
import { render } from '@testing-library/react-native';
import NavBar from './NavBar';
import { useNavController } from './useNavController';

jest.mock('./useNavController', () => ({
  useNavController: jest.fn(),
}));

describe('NavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders wrapper and inner layout with navIcons', () => {
    const mockIcons = [
      <MockIcon key="one" testID="mock-icon-1" />,
      <MockIcon key="two" testID="mock-icon-2" />,
    ];

    useNavController.mockReturnValue({ navIcons: mockIcons });

    const { getByTestId } = render(<NavBar />);

    // blur container is wrapped by the shadowBox, but we only have styles in source,
    // so we just assert icons show up:
    expect(getByTestId('mock-icon-1')).toBeTruthy();
    expect(getByTestId('mock-icon-2')).toBeTruthy();
  });
});

// simple inline mock component for navIcons
const MockIcon = (props) => {
  const React = require('react');
  const { View } = require('react-native');
  return <View {...props} />;
};
