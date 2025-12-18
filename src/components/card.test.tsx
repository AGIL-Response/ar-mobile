import React from 'react';
import { Text } from 'react-native';

import {
  getStyle,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { Card } from './card';

describe('Card component', () => {
  it('renders children', () => {
    render(
      <Card testID="card">
        <Text>Card content</Text>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('applies default variant', () => {
    render(<Card testID="card">Content</Card>);
    const style = getStyle('card');
    expect(style.borderWidth).toBe(2);
    expect(style.backgroundColor).toBeTruthy();
  });

  it('applies elevated variant', () => {
    render(
      <Card variant="elevated" testID="card">
        Content
      </Card>
    );
    const style = getStyle('card');
    expect(style.elevation).toBe(3);
    expect(style.shadowRadius).toBe(4);
  });

  it('applies outlined variant', () => {
    render(
      <Card variant="outlined" testID="card">
        Content
      </Card>
    );
    const style = getStyle('card');
    expect(style.backgroundColor).toBe('transparent');
    expect(style.borderWidth).toBe(2);
  });

  it('applies filled variant', () => {
    render(
      <Card variant="filled" testID="card">
        Content
      </Card>
    );
    const style = getStyle('card');
    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toBeTruthy();
  });

  it('applies medium padding by default', () => {
    render(<Card testID="card">Content</Card>);
    const style = getStyle('card');
    expect(style.paddingHorizontal).toBe(6); // md from theme
    expect(style.paddingVertical).toBe(4); // sm from theme
  });

  it('applies padding variants', () => {
    const { rerender } = render(
      <Card padding="none" testID="card">
        Content
      </Card>
    );
    let style = getStyle('card');
    expect(style.paddingIdeHorizontal).toBeUndefined();

    rerender(
      <Card padding="small" testID="card">
        Content
      </Card>
    );
    style = getStyle('card');
    expect(style.paddingHorizontal).toBe(4); // sm

    rerender(
      <Card padding="large" testID="card">
        Content
      </Card>
    );
    style = getStyle('card');
    expect(style.paddingHorizontal).toBe(8); // lg
  });

  it('applies fullWidth by default', () => {
    render(<Card testID="card">Content</Card>);
    const style = getStyle('card');
    expect(style.width).toBe('100%');
  });

  it('allows disabling fullWidth', () => {
    render(
      <Card fullWidth={false} testID="card">
        Content
      </Card>
    );
    const style = getStyle('card');
    expect(style.width).toBeUndefined();
  });
});
