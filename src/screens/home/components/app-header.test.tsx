import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import { AppHeader } from './app-header';

describe('AppHeader', () => {
  it('renders the provided title', () => {
    render(<AppHeader title="Downtown HQ" />);

    expect(screen.getByText('Downtown HQ')).toBeTruthy();
  });

  it('shows search and notification icons', () => {
    render(<AppHeader title="Tenant" />);

    expect(screen.getAllByTestId('mock-icon')).toHaveLength(2);
  });
});

