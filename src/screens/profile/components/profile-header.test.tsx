import React from 'react';

import {
  flattenStyle,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { ProfileHeader } from './profile-header';

describe('ProfileHeader', () => {
  test('renders the profile heading', () => {
    render(<ProfileHeader />);

    expect(screen.getByText('Profile')).toBeTruthy();
  });

  test('applies header layout styles', () => {
    render(<ProfileHeader />);

    const title = screen.getByText('Profile');
    const container = screen.getByTestId('profile-header-container');

    const containerStyle = flattenStyle(container.props.style);
    const textStyle = flattenStyle(title.props.style);

    expect(containerStyle.height).toBe(56);
    expect(containerStyle.flexDirection).toBe('row');
    expect(containerStyle.alignItems).toBe('center');
    expect(textStyle.fontSize).toBe(20);
    expect(textStyle.fontWeight).toBe('600');
  });
});
