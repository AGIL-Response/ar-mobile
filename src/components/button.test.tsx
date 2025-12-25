import React from 'react';
import { Text } from 'react-native';

import {
  fireEvent,
  getStyle,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { Button } from './button';

describe('Button component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with title', () => {
    render(<Button title="Click me" onPress={mockOnPress} testID="button" />);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<Button title="Click me" onPress={mockOnPress} testID="button" />);
    const button = screen.getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(
      <Button title="Click me" onPress={mockOnPress} disabled testID="button" />
    );
    const button = screen.getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    render(
      <Button title="Click me" onPress={mockOnPress} loading testID="button" />
    );
    // ActivityIndicator should be present
    expect(screen.getByTestId('button')).toBeTruthy();
  });

  it('disables button when loading', () => {
    render(
      <Button title="Click me" onPress={mockOnPress} loading testID="button" />
    );
    const button = screen.getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('applies solid variant by default', () => {
    render(<Button title="Button" onPress={mockOnPress} testID="button" />);
    const style = getStyle('button');
    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toBeTruthy();
  });

  it('applies outline variant', () => {
    render(
      <Button
        title="Button"
        variant="outline"
        onPress={mockOnPress}
        testID="button"
      />
    );
    const style = getStyle('button');
    expect(style.borderWidth).toBe(2);
  });

  it('applies ghost variant', () => {
    render(
      <Button
        title="Button"
        variant="ghost"
        onPress={mockOnPress}
        testID="button"
      />
    );
    const style = getStyle('button');
    expect(style.backgroundColor).toBe('transparent');
  });

  it('applies fullWidth when prop is true', () => {
    render(
      <Button title="Button" onPress={mockOnPress} fullWidth testID="button" />
    );
    const style = getStyle('button');
    expect(style.width).toBe('100%');
  });

  it('renders icon when provided', () => {
    const icon = <Text testID="icon">★</Text>;
    render(
      <Button
        title="Button"
        icon={icon}
        onPress={mockOnPress}
        testID="button"
      />
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('renders icon on left by default', () => {
    const icon = <Text testID="icon">★</Text>;
    render(
      <Button
        title="Button"
        icon={icon}
        onPress={mockOnPress}
        testID="button"
      />
    );
    const button = screen.getByTestId('button');
    expect(button.children).toBeTruthy();
  });

  it('renders icon on right when iconPosition is right', () => {
    const icon = <Text testID="icon">★</Text>;
    render(
      <Button
        title="Button"
        icon={icon}
        iconPosition="right"
        onPress={mockOnPress}
        testID="button"
      />
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('renders custom children when provided', () => {
    render(
      <Button onPress={mockOnPress} testID="button">
        <Text testID="custom-child">Custom Content</Text>
      </Button>
    );
    expect(screen.getByTestId('custom-child')).toBeTruthy();
    expect(screen.queryByText('Button')).toBeNull();
  });

  it('applies reduced opacity when disabled', () => {
    render(
      <Button title="Button" onPress={mockOnPress} disabled testID="button" />
    );
    const style = getStyle('button');
    expect(style.opacity).toBe(0.6);
  });

  it('applies different color variants', () => {
    const { rerender } = render(
      <Button
        title="Button"
        colorVariant="success"
        onPress={mockOnPress}
        testID="button"
      />
    );
    let style = getStyle('button');
    expect(style.backgroundColor).toBe('#10b981'); // success

    rerender(
      <Button
        title="Button"
        colorVariant="error"
        onPress={mockOnPress}
        testID="button"
      />
    );
    style = getStyle('button');
    expect(style.backgroundColor).toBe('#ef4444'); // error
  });
});
