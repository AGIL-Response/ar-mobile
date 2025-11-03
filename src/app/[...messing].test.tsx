import React from 'react';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import NotFoundScreen from './[...messing]';

const { __pushMock: pushMock } = require('expo-router');

describe('NotFoundScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the not found message', () => {
    render(<NotFoundScreen />);

    expect(screen.getByText("This screen doesn't exist.")).toBeTruthy();
  });

  it('renders a link to home screen', () => {
    render(<NotFoundScreen />);

    const link = screen.getByTestId('link-/');
    expect(link).toBeTruthy();
  });

  it('navigates to home when link is pressed', () => {
    render(<NotFoundScreen />);

    const link = screen.getByTestId('link-/');
    fireEvent.press(link);

    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('renders "Go to home screen!" text', () => {
    render(<NotFoundScreen />);

    expect(screen.getByText('Go to home screen!')).toBeTruthy();
  });
});
