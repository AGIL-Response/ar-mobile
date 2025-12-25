import React from 'react';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import type { User } from '@/types/user-management';
import { MemberCard } from './member-card';
import { createRole, createUser } from '@/lib/mock-data-tests';

const baseUser = createUser();

const renderMemberCard = (user: User = baseUser, onLoadRoles = jest.fn()) =>
  render(<MemberCard user={user} onLoadRoles={onLoadRoles} />);

describe('MemberCard', () => {
  test('renders primary user information and status badges', () => {
    renderMemberCard();

    expect(screen.getByText('User Name')).toBeTruthy();
    expect(screen.getByText('@username')).toBeTruthy();
    expect(screen.getByText('user@example.com')).toBeTruthy();
    expect(screen.getByText('Inactive')).toBeTruthy();
    expect(screen.getByText('Unverified')).toBeTruthy();
  });

  test('falls back to username initials when full name missing', () => {
    const user: User = {
      ...baseUser,
      fullName: '',
      username: 'usertest',
    };

    renderMemberCard(user);

    expect(screen.getByText('@usertest')).toBeTruthy();
    expect(screen.getByText('usertest')).toBeTruthy();
  });

  test('invokes onLoadRoles when card is pressed', () => {
    const onLoadRoles = jest.fn();

    renderMemberCard(baseUser, onLoadRoles);

    fireEvent.press(screen.getByText('User Name'));

    expect(onLoadRoles).toHaveBeenCalledTimes(1);
  });

  test('shows role badges with overflow indicator', () => {
    const roles = [
      createRole({ id: 'role-1', name: 'Commander' }),
      createRole({ id: 'role-2', name: 'Analyst' }),
      createRole({ id: 'role-3', name: 'Operator' }),
      createRole({ id: 'role-4', name: 'Supervisor' }),
    ];

    const user: User = {
      ...baseUser,
      roles,
    };

    renderMemberCard(user);

    expect(screen.getByText('Commander')).toBeTruthy();
    expect(screen.getByText('Analyst')).toBeTruthy();
    expect(screen.getByText('Operator')).toBeTruthy();
    expect(screen.getByText('+1 more')).toBeTruthy();
  });
});
