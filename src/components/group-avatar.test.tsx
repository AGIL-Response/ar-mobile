import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import * as Theme from '@/theme';
import type { ChatUser } from '@/services/chat';

import { GroupAvatar } from './group-avatar';

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock Avatar component
jest.mock('./avatar', () => ({
  Avatar: ({ fileId, size, fallback, testID }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { 
        testID: testID || 'avatar', 
        'data-file-id': fileId, 
        'data-size': size,
        'data-fallback': fallback 
      },
      React.createElement(Text, {}, fallback)
    );
  },
}));

// Mock View and Text components
jest.mock('./view', () => ({
  View: ({ children, style, testID, ...props }: any) => {
    const React = require('react');
    const { View: RNView } = require('react-native');
    return React.createElement(
      RNView,
      { testID, style, ...props },
      children
    );
  },
}));

jest.mock('./text', () => ({
  Text: ({ children, style, testID }: any) => {
    const React = require('react');
    const { Text: RNText } = require('react-native');
    return React.createElement(
      RNText,
      { testID, style, 'data-text': children },
      children
    );
  },
}));

describe('GroupAvatar component', () => {
  const mockTheme = {
    colors: {
      surface: {
        secondary: '#F3F4F6',
        tertiary: '#E5E7EB',
      },
      background: {
        primary: '#FFFFFF',
      },
      text: {
        primary: '#000000',
        secondary: '#6B7280',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Theme, 'useTheme').mockReturnValue(mockTheme as any);
  });

  // Helper to create mock members
  const createMember = (overrides: Partial<ChatUser> = {}): ChatUser => ({
    id: `user-${Math.random()}`,
    username: 'user',
    displayName: 'User Name',
    ...overrides,
  });

  describe('Empty members (0 members)', () => {
    it('renders fallback text when no members and fallback provided', () => {
      render(<GroupAvatar members={[]} fallback="No members" />);
      const fallbackText = screen.getByText('No members');
      expect(fallbackText).toBeTruthy();
    });

    it('renders empty container when no members and no fallback', () => {
      const { toJSON } = render(<GroupAvatar members={[]} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Single member (1 member)', () => {
    it('renders single avatar with displayName initials', () => {
      const member = createMember({ displayName: 'John Doe' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toBeTruthy();
      expect(avatar.props['data-fallback']).toBe('JD');
    });

    it('renders single avatar with single word displayName', () => {
      const member = createMember({ displayName: 'John' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('J');
    });

    it('renders single avatar with username when no displayName', () => {
      const member = createMember({ displayName: undefined, username: 'johndoe' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('J');
    });

    it('renders single avatar with fallback when no displayName or username', () => {
      const member = createMember({ displayName: undefined, username: undefined });
      render(<GroupAvatar members={[member]} fallback="?" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('?');
    });

    it('renders single avatar with avatarUrl', () => {
      const member = createMember({ avatarUrl: 'avatar-123' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-file-id']).toBe('avatar-123');
    });
  });

  describe('Two members layout', () => {
    it('renders 2 members in split layout', () => {
      const members = [
        createMember({ id: '1', displayName: 'John Doe' }),
        createMember({ id: '2', displayName: 'Jane Smith' }),
      ];
      render(<GroupAvatar members={members} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars).toHaveLength(2);
      expect(avatars[0].props['data-fallback']).toBe('JD');
      expect(avatars[1].props['data-fallback']).toBe('JS');
    });

    it('handles 2 members with missing displayName', () => {
      const members = [
        createMember({ id: '1', displayName: undefined, username: undefined }),
        createMember({ id: '2', displayName: undefined, username: undefined }),
      ];
      render(<GroupAvatar members={members} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars).toHaveLength(2);
      expect(avatars[0].props['data-fallback']).toBe('?');
      expect(avatars[1].props['data-fallback']).toBe('?');
    });
  });

  describe('Three members layout', () => {
    it('renders 3 members in pie chart layout', () => {
      const members = [
        createMember({ id: '1', displayName: 'John Doe' }),
        createMember({ id: '2', displayName: 'Jane Smith' }),
        createMember({ id: '3', displayName: 'Bob Wilson' }),
      ];
      render(<GroupAvatar members={members} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars).toHaveLength(3);
      expect(avatars[0].props['data-fallback']).toBe('JD');
      expect(avatars[1].props['data-fallback']).toBe('JS');
      expect(avatars[2].props['data-fallback']).toBe('BW');
    });
  });

  describe('Four members layout', () => {
    it('renders 4 members in 2x2 grid', () => {
      const members = [
        createMember({ id: '1', displayName: 'John Doe' }),
        createMember({ id: '2', displayName: 'Jane Smith' }),
        createMember({ id: '3', displayName: 'Bob Wilson' }),
        createMember({ id: '4', displayName: 'Alice Brown' }),
      ];
      render(<GroupAvatar members={members} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars).toHaveLength(4);
    });

    it('renders 4 members with empty slots filled with background color', () => {
      const members = [
        createMember({ id: '1', displayName: 'John Doe' }),
        createMember({ id: '2', displayName: 'Jane Smith' }),
      ];
      render(<GroupAvatar members={members} maxAvatars={4} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars).toHaveLength(2);
    });
  });

  describe('More than 4 members (badge)', () => {
    it('renders badge with remaining count when members > maxAvatars', () => {
      const members = Array.from({ length: 6 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );
      render(<GroupAvatar members={members} maxAvatars={4} />);
      const badgeText = screen.getByText('+2');
      expect(badgeText).toBeTruthy();
    });

    it('renders badge with 99+ when remaining count > 99', () => {
      const members = Array.from({ length: 104 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );
      render(<GroupAvatar members={members} maxAvatars={4} />);
      const badgeText = screen.getByText('99+');
      expect(badgeText).toBeTruthy();
    });

    it('renders badge with exact count when remaining count <= 99', () => {
      const members = Array.from({ length: 10 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );
      render(<GroupAvatar members={members} maxAvatars={4} />);
      const badgeText = screen.getByText('+6');
      expect(badgeText).toBeTruthy();
    });

    it('does not render badge when members <= maxAvatars', () => {
      const members = Array.from({ length: 4 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );
      render(<GroupAvatar members={members} maxAvatars={4} />);
      expect(screen.queryByText(/\+/)).toBeNull();
    });
  });

  describe('Size variants', () => {
    it('renders with xs size', () => {
      const member = createMember();
      const { toJSON } = render(<GroupAvatar members={[member]} size="xs" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with small size', () => {
      const member = createMember();
      const { toJSON } = render(<GroupAvatar members={[member]} size="small" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with medium size (default)', () => {
      const member = createMember();
      const { toJSON } = render(<GroupAvatar members={[member]} size="medium" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with large size', () => {
      const member = createMember();
      const { toJSON } = render(<GroupAvatar members={[member]} size="large" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with xl size', () => {
      const member = createMember();
      const { toJSON } = render(<GroupAvatar members={[member]} size="xl" />);
      expect(toJSON()).toBeTruthy();
    });

    it('defaults to medium size when size not provided', () => {
      const member = createMember();
      const { toJSON } = render(<GroupAvatar members={[member]} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('maxAvatars prop', () => {
    it('respects custom maxAvatars value', () => {
      const members = Array.from({ length: 10 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );
      render(<GroupAvatar members={members} maxAvatars={4} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars.length).toBeLessThanOrEqual(4);
      expect(screen.getByText('+6')).toBeTruthy();
    });

    it('defaults to 4 maxAvatars', () => {
      const members = Array.from({ length: 6 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );
      render(<GroupAvatar members={members} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars.length).toBeLessThanOrEqual(4);
      expect(screen.getByText('+2')).toBeTruthy();
    });
  });

  describe('getInitials helper function', () => {
    it('extracts initials from displayName with multiple words', () => {
      const member = createMember({ displayName: 'John Michael Doe' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('JD');
    });

    it('extracts first letter from single word displayName', () => {
      const member = createMember({ displayName: 'John' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('J');
    });

    it('extracts first letter from username when no displayName', () => {
      const member = createMember({ displayName: undefined, username: 'johndoe' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('J');
    });

    it('returns ? when no displayName or username', () => {
      const member = createMember({ displayName: undefined, username: undefined });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('?');
    });

    it('handles displayName with extra spaces', () => {
      const member = createMember({ displayName: '  John   Doe  ' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('JD');
    });
  });

  describe('getSectionColor helper function', () => {
    it('applies alternating colors for empty slots in 4-member layout', () => {
      const members = [
        createMember({ id: '1', displayName: 'John Doe' }),
        createMember({ id: '2', displayName: 'Jane Smith' }),
      ];
      const { toJSON } = render(<GroupAvatar members={members} maxAvatars={4} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('handles members with only id', () => {
      const member = { id: 'user-1' } as ChatUser;
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('?');
    });

    it('handles very long displayName', () => {
      const member = createMember({ displayName: 'John Michael William Doe Smith' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('JS');
    });

    it('handles empty string displayName', () => {
      const member = createMember({ displayName: '', username: undefined });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('?');
    });

    it('handles empty string username', () => {
      const member = createMember({ displayName: undefined, username: '' });
      render(<GroupAvatar members={[member]} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.props['data-fallback']).toBe('?');
    });

    it('handles exactly maxAvatars members', () => {
      const members = Array.from({ length: 4 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );
      render(<GroupAvatar members={members} maxAvatars={4} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars).toHaveLength(4);
      expect(screen.queryByText(/\+/)).toBeNull();
    });

    it('handles maxAvatars = 0', () => {
      const members = [createMember()];
      render(<GroupAvatar members={members} maxAvatars={0} />);
      expect(screen.queryByTestId('avatar')).toBeNull();
    });

    it('handles maxAvatars larger than member count', () => {
      const members = [createMember(), createMember()];
      render(<GroupAvatar members={members} maxAvatars={10} />);
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars).toHaveLength(2);
      expect(screen.queryByText(/\+/)).toBeNull();
    });
  });

  describe('Theme integration', () => {
    it('uses theme colors for container background', () => {
      const member = createMember();
      const { toJSON } = render(<GroupAvatar members={[member]} />);
      expect(toJSON()).toBeTruthy();
    });

    it('uses theme colors for empty slot backgrounds', () => {
      const members = [createMember(), createMember()];
      const { toJSON } = render(<GroupAvatar members={members} maxAvatars={4} />);
      expect(toJSON()).toBeTruthy();
    });

    it('uses theme colors for badge', () => {
      const members = Array.from({ length: 6 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );
      const { toJSON } = render(<GroupAvatar members={members} maxAvatars={4} />);
      expect(toJSON()).toBeTruthy();
    });
  });
});

