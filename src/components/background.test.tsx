import React from 'react';
import { Text } from 'react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import { Background } from './background';

const mockUseIsDarkTheme = require('@/theme');

describe('Background', () => {
  it('renders children with white background when theme is light', () => {
    render(
      <Background>
        <Text>Light Content</Text>
      </Background>
    );

    expect(screen.getByText('Light Content')).toBeTruthy();
    expect(screen.getByTestId('background-view')).toBeTruthy();
    expect(screen.queryByTestId('background-image')).toBeNull();
  });

  it('uses image background when theme is dark', () => {
    mockUseIsDarkTheme.useIsDarkTheme.mockReturnValue(true);

    render(
      <Background>
        <Text>Dark Content</Text>
      </Background>
    );

    expect(screen.getByText('Dark Content')).toBeTruthy();
    expect(screen.getByTestId('background-image')).toBeTruthy();
    expect(screen.queryByTestId('background-view')).toBeNull();
  });
});
