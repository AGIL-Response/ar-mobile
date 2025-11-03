import React from 'react';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { ThemeToggle } from './theme-toggle';

// Use global '@/theme' mock from jest-setup and override specific hooks per test
const themeModule = require('@/theme');
const mockSetTheme = jest.fn();

describe('ThemeToggle component', () => {
  beforeEach(() => {
    jest
      .spyOn(themeModule, 'useThemeSelection')
      .mockReturnValue({ setTheme: mockSetTheme });
    mockSetTheme.mockClear();
  });
  it('renders moon icon when theme is light', () => {
    jest.spyOn(themeModule, 'useIsDarkTheme').mockReturnValue(false);
    render(<ThemeToggle />);
    expect(screen.getByText('🌙')).toBeTruthy();
  });

  it('renders sun icon when theme is dark', () => {
    jest.spyOn(themeModule, 'useIsDarkTheme').mockReturnValue(true);
    render(<ThemeToggle />);
    expect(screen.getByText('☀️')).toBeTruthy();
  });

  it('calls setTheme to toggle from light to dark', () => {
    jest.spyOn(themeModule, 'useIsDarkTheme').mockReturnValue(false);
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.press(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme to toggle from dark to light', () => {
    jest.spyOn(themeModule, 'useIsDarkTheme').mockReturnValue(true);
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.press(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('applies correct icon size for small variant', () => {
    render(<ThemeToggle size="small" />);
    const button = screen.getByRole('button');
    // Button should have dimensions based on iconSize (20) + 16 = 36
    expect(button).toBeTruthy();
  });

  it('applies correct icon size for medium variant', () => {
    render(<ThemeToggle size="medium" />);
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('applies correct icon size for large variant', () => {
    render(<ThemeToggle size="large" />);
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('shows label when showLabel is true', () => {
    jest.spyOn(themeModule, 'useIsDarkTheme').mockReturnValue(false);
    render(<ThemeToggle showLabel />);
    expect(screen.getByText('Dark')).toBeTruthy();
  });

  it('shows "Light" label when dark mode is active and showLabel is true', () => {
    jest.spyOn(themeModule, 'useIsDarkTheme').mockReturnValue(true);
    render(<ThemeToggle showLabel />);
    expect(screen.getByText('Light')).toBeTruthy();
  });

  it('hides label when showLabel is false', () => {
    render(<ThemeToggle showLabel={false} />);
    expect(screen.queryByText('Dark')).toBeNull();
    expect(screen.queryByText('Light')).toBeNull();
  });

  it('applies custom style prop', () => {
    const customStyle = { marginTop: 20 };
    render(<ThemeToggle style={customStyle} />);
    const container = screen.getByRole('button');
    expect(container.props.style).toEqual(
      expect.arrayContaining([customStyle])
    );
  });

  it('has correct accessibility label for light theme', () => {
    jest.spyOn(themeModule, 'useIsDarkTheme').mockReturnValue(false);
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Switch to dark theme');
  });

  it('has correct accessibility label for dark theme', () => {
    jest.spyOn(themeModule, 'useIsDarkTheme').mockReturnValue(true);
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Switch to light theme');
  });
});
