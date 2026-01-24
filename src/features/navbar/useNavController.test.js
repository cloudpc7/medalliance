// src/features/navbar/useNavController.test.js

import React from 'react';
import { render } from '@testing-library/react-native';
import { useNavController } from './useNavController';
import { useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'expo-router';
import { openSearch } from '../../redux/slices/search.slice';
import { setActiveRoute } from '../../redux/slices/navControl.slice';

// ---- Mocks ----

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('../../redux/slices/search.slice', () => ({
  openSearch: jest.fn(() => ({ type: 'search/openSearch' })),
}));

jest.mock('../../redux/slices/navControl.slice', () => ({
  setActiveRoute: jest.fn((route) => ({
    type: 'nav/setActiveRoute',
    payload: route,
  })),
}));

// Mock FontAwesome so NavIcon doesn't pull native stuff
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const IconMock = ({ name }) => <Text>{name}</Text>;
  return { FontAwesome6: IconMock };
});

// Helper component to "run" the hook and expose its result
let hookResult;

const HookProbe = () => {
  hookResult = useNavController();
  return null;
};

describe('useNavController', () => {
  const mockDispatch = jest.fn();
  const mockPush = jest.fn();
  let mockUsePathname;

  beforeEach(() => {
    jest.clearAllMocks();
    hookResult = undefined;

    const expoRouter = require('expo-router');
    const reactRedux = require('react-redux');

    mockUsePathname = expoRouter.usePathname;

    reactRedux.useDispatch.mockReturnValue(mockDispatch);
    expoRouter.useRouter.mockReturnValue({ push: mockPush });
    mockUsePathname.mockReturnValue('/matching'); // default "current route"
  });

  it('returns an array of navIcons', () => {
    render(<HookProbe />);

    expect(hookResult).toBeDefined();
    expect(Array.isArray(hookResult.navIcons)).toBe(true);
    // should match NAV_ITEMS length (5)
    expect(hookResult.navIcons.length).toBe(5);
  });

  it('pushes /search and opens search when tapping search icon from another route', () => {
    render(<HookProbe />);

    const { navIcons } = hookResult;
    // find the search item by route prop
    const searchElement = navIcons.find(
      (el) => el.props.route === '/search'
    );

    expect(searchElement).toBeDefined();

    // simulate pressing search; NavIcon calls onPress(route)
    searchElement.props.onPress('/search');

    expect(mockPush).toHaveBeenCalledWith('/search');
    expect(openSearch).toHaveBeenCalledTimes(1);
    expect(setActiveRoute).toHaveBeenCalledWith('/search');
    // openSearch + setActiveRoute
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('does not push /search again when already on /search, but still opens search', () => {
    const { usePathname } = require('expo-router');
    usePathname.mockReturnValue('/search');

    render(<HookProbe />);

    const { navIcons } = hookResult;
    const searchElement = navIcons.find(
      (el) => el.props.route === '/search'
    );

    expect(searchElement).toBeDefined();

    searchElement.props.onPress('/search');

    expect(mockPush).not.toHaveBeenCalled();
    expect(openSearch).toHaveBeenCalledTimes(1);
    expect(setActiveRoute).toHaveBeenCalledWith('/search');
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('pushes a non-search route when it is not the current route and sets active route', () => {
    render(<HookProbe />);

    const { navIcons } = hookResult;
    const messagesElement = navIcons.find(
      (el) => el.props.route === '/messages'
    );

    expect(messagesElement).toBeDefined();

    messagesElement.props.onPress('/messages');

    expect(mockPush).toHaveBeenCalledWith('/messages');
    expect(setActiveRoute).toHaveBeenCalledWith('/messages');
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('does not push again if already on the same non-search route, only sets active route', () => {
    const { usePathname } = require('expo-router');
    usePathname.mockReturnValue('/messages');

    render(<HookProbe />);

    const { navIcons } = hookResult;
    const messagesElement = navIcons.find(
      (el) => el.props.route === '/messages'
    );

    expect(messagesElement).toBeDefined();

    messagesElement.props.onPress('/messages');

    expect(mockPush).not.toHaveBeenCalled();
    expect(setActiveRoute).toHaveBeenCalledWith('/messages');
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
