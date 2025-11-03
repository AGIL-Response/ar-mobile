import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { FloatingActionButton } from './floating-action-button';

const { __pushMock: pushMock } = require('expo-router');

describe('FloatingActionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to create incident screen on press', () => {
    render(<FloatingActionButton />);

    fireEvent.press(findPressableParent(screen.getByTestId('mock-icon')));

    expect(pushMock).toHaveBeenCalledWith('/incidents/create');
  });
});
