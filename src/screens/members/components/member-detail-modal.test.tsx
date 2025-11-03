import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import type { User } from '@/types/user-management';
import { MemberDetailModal } from './member-detail-modal';
import { createUser } from '@/lib/mock-data-tests';

const baseUser = createUser();

describe('MemberDetailModal', () => {
  test('renders empty state when user is null', () => {
    const ref = React.createRef();

    render(<MemberDetailModal ref={ref} user={null} />);

    expect(screen.getByText('No member selected')).toBeTruthy();
  });

  test('displays user details and roles', () => {
    const ref = React.createRef();

    render(<MemberDetailModal ref={ref} user={baseUser} />);

    expect(screen.getByText('Basic Info')).toBeTruthy();
    expect(screen.getByText('Full Name:')).toBeTruthy();
    expect(screen.getByText('User Name')).toBeTruthy();
  });

  test('shows fallback role message when none assigned', () => {
    const ref = React.createRef();
    const user: User = { ...baseUser, roles: [] };

    render(<MemberDetailModal ref={ref} user={user} />);

    expect(screen.getByText('No roles assigned')).toBeTruthy();
  });
});
