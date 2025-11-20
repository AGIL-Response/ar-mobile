import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import type { User } from '@/types/user-management';
import { MemberStats } from './member-stats';
import { createUser } from '@/lib/mock-data-tests';

describe('MemberStats', () => {
  test('renders total, verified, and enabled counts', () => {
    const users: User[] = [
      createUser({ emailVerified: true, enabled: true }),
      createUser({ emailVerified: true, enabled: false }),
      createUser({ emailVerified: false, enabled: true }),
    ];

    render(<MemberStats users={users} />);

    expect(screen.getByText('Total Users')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('Verified')).toBeTruthy();
    expect(screen.getByText('Enabled')).toBeTruthy();
    expect(screen.getAllByText('2')).toHaveLength(2);
  });
});
