import React from 'react';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { MemberHeader } from './member-header';

describe('MemberHeader', () => {
  test('renders title and description text', () => {
    render(<MemberHeader searchQuery="" onSearchChange={jest.fn()} />);

    expect(screen.getByText('Members')).toBeTruthy();
    expect(
      screen.getByText('View and manage all system users and their permissions')
    ).toBeTruthy();
  });

  test('passes search value and change handler to SearchInput', () => {
    const handleChange = jest.fn();

    render(<MemberHeader searchQuery="alice" onSearchChange={handleChange} />);

    const searchInput = screen.getByPlaceholderText(
      'Search by name, email, or username...'
    );
    expect(searchInput.props.value).toBe('alice');

    fireEvent.changeText(searchInput, 'bob');

    expect(handleChange).toHaveBeenCalledWith('bob');
  });
});
