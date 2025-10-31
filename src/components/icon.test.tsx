import React from 'react';

import { render, screen } from '@/lib/test-utils';

import { Icon } from './icon';

// Mock the icons registry to simple RN components so we can use the real Icon implementation
jest.mock('@assets/icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockSvg = ({ testID = 'mock-svg', ...props }: any) =>
    React.createElement(Text, { testID, ...props }, 'svg');
  return {
    __esModule: true,
    default: {
      home: MockSvg,
      settings: MockSvg,
    },
    iconNames: { home: 'home', settings: 'settings' },
  };
});
jest.mock('@/components/icon', () => jest.requireActual('./icon'));

const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Icon component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleWarnSpy.mockClear();
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  it('renders tokens icon when name is valid', () => {
    render(<Icon name="home" testID="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toBeTruthy();
  });

  it('applies default size of 24', () => {
    render(<Icon name="home" testID="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon.props.width).toBe(24);
    expect(icon.props.height).toBe(24);
  });

  it('applies custom size prop', () => {
    render(<Icon name="home" size={32} testID="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon.props.width).toBe(32);
    expect(icon.props.height).toBe(32);
  });

  it('prioritizes width and height props over size', () => {
    render(<Icon name="home" size={24} width={40} height={40} testID="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon.props.width).toBe(40);
    expect(icon.props.height).toBe(40);
  });

  it('passes through additional props to icon component', () => {
    render(<Icon name="home" testID="icon" fill="#ff0000" />);
    const icon = screen.getByTestId('icon');
    expect(icon.props.fill).toBe('#ff0000');
  });

  it('renders different icons based on name prop', () => {
    render(<Icon name="home" testID="icon-home" />);
    expect(screen.getByTestId('icon-home')).toBeTruthy();

    render(<Icon name="settings" testID="icon-settings" />);
    expect(screen.getByTestId('icon-settings')).toBeTruthy();
  });
});
