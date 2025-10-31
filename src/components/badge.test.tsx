import React from 'react';
import { Text } from 'react-native';

import { getStyle, render, screen } from '@/lib/test-utils';

import { Badge } from './badge';

describe('Badge component', () => {
  it('renders label text', () => {
    render(<Badge label="New" testID="badge" />);
    expect(screen.getByText('New')).toBeTruthy();
  });

  it('renders children when no label provided', () => {
    render(
      <Badge testID="badge">
        <Text>Custom content</Text>
      </Badge>
    );
    expect(screen.getByText('Custom content')).toBeTruthy();
  });

  it('applies solid variant by default', () => {
    render(<Badge label="Badge" testID="badge" />);
    const style = getStyle('badge');
    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toBeTruthy();
  });

  it('applies outline variant', () => {
    render(<Badge label="Badge" variant="outline" testID="badge" />);
    const style = getStyle('badge');
    expect(style.borderWidth).toBe(1);
    expect(style.backgroundColor).toBe('transparent');
  });

  it('applies soft variant', () => {
    render(<Badge label="Badge" variant="soft" testID="badge" />);
    const style = getStyle('badge');
    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toContain('20'); // 20% opacity
  });

  it('applies primary color variant by default', () => {
    render(<Badge label="Badge" testID="badge" />);
    const style = getStyle('badge');
    expect(style.backgroundColor).toBe('#1068eb'); // primary color
  });

  it('applies different color variants', () => {
    const { rerender } = render(
      <Badge label="Badge" colorVariant="success" testID="badge" />
    );
    let style = getStyle('badge');
    expect(style.backgroundColor).toBe('#10b981'); // success color

    rerender(<Badge label="Badge" colorVariant="error" testID="badge" />);
    style = getStyle('badge');
    expect(style.backgroundColor).toBe('#ef4444'); // error color
  });

  it('applies neutral color variant', () => {
    render(<Badge label="Badge" colorVariant="neutral" testID="badge" />);
    const style = getStyle('badge');
    expect(style.backgroundColor).toBe('#9ca3af'); // muted color
  });

  it('applies size variants', () => {
    const { rerender } = render(
      <Badge label="Badge" size="small" testID="badge" />
    );
    let style = getStyle('badge');
    expect(style.paddingHorizontal).toBe(1); // xs from theme

    rerender(<Badge label="Badge" size="medium" testID="badge" />);
    style = getStyle('badge');
    expect(style.paddingHorizontal).toBe(4); // sm from theme

    rerender(<Badge label="Badge" size="large" testID="badge" />);
    style = getStyle('badge');
    expect(style.paddingHorizontal).toBe(6); // md from theme
  });

  it('renders icon when provided', () => {
    const icon = <Text testID="icon">★</Text>;
    render(<Badge label="Badge" icon={icon} testID="badge" />);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });
});
