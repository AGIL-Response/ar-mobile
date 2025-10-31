import React from 'react';
import { Text } from 'react-native';

import { render, screen } from '@/lib/test-utils';

import { Avatar, AvatarGroup } from './avatar';

describe('Avatar', () => {
  it('renders fallback when no source', () => {
    render(<Avatar fallback="AB" />);
    expect(screen.getByText('AB')).toBeTruthy();
  });
  it('renders default fallback for missing all', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeTruthy();
  });
  it('renders badge and online status', () => {
    render(
      <Avatar fallback="A" showStatus isOnline badge={<Text>NEW</Text>} />
    );
    expect(screen.getByText('NEW')).toBeTruthy();
  });
  it('renders image if source is provided', () => {
    render(
      <Avatar source={{ uri: 'https://test/picture.png' }} fallback="C" />
    );
    const img = screen.getByTestId('avatar-image');
    expect(img).toBeTruthy();
  });
  it('applies variant and size', () => {
    render(<Avatar variant="bordered" size="xl" fallback="X" />);
    expect(screen.getByText('X')).toBeTruthy();
  });
});

describe('AvatarGroup', () => {
  const testData = [
    { fallback: 'A' },
    { fallback: 'B' },
    { fallback: 'C' },
    { fallback: 'D' },
    { fallback: 'E' },
  ];
  it('renders up to max avatars', () => {
    render(<AvatarGroup avatars={testData} max={3} />);
    const avatars = screen.getAllByTestId('avatar-image');
    expect(avatars).toHaveLength(3);
    expect(screen.getByText('+2')).toBeTruthy();
  });
});
