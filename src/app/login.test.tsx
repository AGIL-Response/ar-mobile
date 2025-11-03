import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import LoginRoute from './login';

describe('login route', () => {
  it('exports LoginScreen as default', () => {
    render(<LoginRoute />);

    expect(screen.getByText('AGIL Response')).toBeTruthy();
  });
});
