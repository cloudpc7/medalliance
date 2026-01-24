jest.unmock('./ErrorBoundary');

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary (real implementation)', () => {
  beforeAll(() => {
    global.__DEV__ = true;
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children normally', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Hello</Text>
      </ErrorBoundary>
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('catches errors and shows fallback', () => {
    const Bomb = () => {
      throw new Error('Boom');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(getByText('APP CRASHED')).toBeTruthy();
    expect(getByText('Developer Details:')).toBeTruthy();
  });

  it('shows reload button in dev mode', () => {
    const Bomb = () => {
      throw new Error('Test crash');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    const reloadBtn = getByText('Attempt App Reload');
    fireEvent.press(reloadBtn);
  });
});