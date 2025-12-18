import React from 'react';
import { Text } from 'react-native';

import {
  fireEvent,
  getStyle,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import {
  EmailInput,
  Input,
  NumberInput,
  PasswordInput,
  PhoneInput,
  SearchInput,
} from './input';

describe('Input component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input with label', () => {
    render(<Input label="Email" testID="input" />);
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByTestId('input')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    render(<Input testID="input" onChangeText={mockOnChangeText} />);
    const input = screen.getByTestId('input');
    fireEvent.changeText(input, 'test@example.com');
    expect(mockOnChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error message when error prop is provided', () => {
    render(<Input error="Invalid email" testID="input" />);
    expect(screen.getByText('Invalid email')).toBeTruthy();
  });

  it('shows helper text when helperText prop is provided', () => {
    render(<Input helperText="Enter your email address" testID="input" />);
    expect(screen.getByText('Enter your email address')).toBeTruthy();
  });

  it('prioritizes error over helper text', () => {
    render(
      <Input error="Error message" helperText="Helper text" testID="input" />
    );
    expect(screen.getByText('Error message')).toBeTruthy();
    expect(screen.queryByText('Helper text')).toBeNull();
  });

  it('applies disabled state', () => {
    render(<Input disabled testID="input" />);
    const input = screen.getByTestId('input');
    expect(input.props.editable).toBe(false);
  });

  it('renders left icon when provided', () => {
    const leftIcon = <Text testID="left-icon">🔍</Text>;
    render(<Input leftIcon={leftIcon} testID="input" />);
    expect(screen.getByTestId('left-icon')).toBeTruthy();
  });

  it('renders right icon when provided', () => {
    const rightIcon = <Text testID="right-icon">✓</Text>;
    render(<Input rightIcon={rightIcon} testID="input" />);
    expect(screen.getByTestId('right-icon')).toBeTruthy();
  });

  it('applies size variants', () => {
    const { rerender } = render(<Input size="small" testID="input" />);
    let style = getStyle('input-wrapper');
    expect(style.height).toBe(32);

    rerender(<Input size="medium" testID="input" />);
    style = getStyle('input-wrapper');
    expect(style.height).toBe(48); // from theme components.input.height

    rerender(<Input size="large" testID="input" />);
    style = getStyle('input-wrapper');
    expect(style.height).toBe(56);
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Input variant="outlined" testID="input" />);
    let style = getStyle('input-wrapper');
    expect(style.backgroundColor).toBe('transparent');

    rerender(<Input variant="filled" testID="input" />);
    style = getStyle('input-wrapper');
    expect(style.borderWidth).toBe(0);
  });

  it('applies error state styles', () => {
    render(<Input error="Error message" testID="input" />);
    const input = screen.getByTestId('input');
    const wrapperStyle = input.parent?.props.style;
    expect(wrapperStyle).toBeTruthy();
  });
});

describe('Input variants', () => {
  it('EmailInput has correct keyboardType and autoComplete', () => {
    render(<EmailInput testID="email-input" />);
    const input = screen.getByTestId('email-input');
    expect(input.props.keyboardType).toBe('email-address');
    expect(input.props.autoComplete).toBe('email');
    expect(input.props.autoCapitalize).toBe('none');
  });

  it('PasswordInput has secureTextEntry enabled', () => {
    render(<PasswordInput testID="password-input" />);
    const input = screen.getByTestId('password-input');
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.autoComplete).toBe('password');
  });

  it('NumberInput has numeric keyboardType', () => {
    render(<NumberInput testID="number-input" />);
    const input = screen.getByTestId('number-input');
    expect(input.props.keyboardType).toBe('numeric');
  });

  it('PhoneInput has phone-pad keyboardType', () => {
    render(<PhoneInput testID="phone-input" />);
    const input = screen.getByTestId('phone-input');
    expect(input.props.keyboardType).toBe('phone-pad');
    expect(input.props.autoComplete).toBe('tel');
  });

  it('SearchInput disables autoCapitalize and autoCorrect', () => {
    render(<SearchInput testID="search-input" />);
    const input = screen.getByTestId('search-input');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.autoCorrect).toBe(false);
  });
});
