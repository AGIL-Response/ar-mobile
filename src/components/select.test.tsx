import React from 'react';

import { fireEvent, render, screen, waitFor } from '@/lib/test-utils';

import { Select } from './select';
import { Text } from './text';

const OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange', disabled: true },
];

describe('Select component', () => {
  it('renders label and placeholder', () => {
    render(<Select label="Fruit" options={OPTIONS} testID="picker" />);
    expect(screen.getByText('Fruit')).toBeTruthy();
    expect(screen.getByText('Select an option')).toBeTruthy();
  });

  it('shows required indicator if required', () => {
    render(<Select label="Fruit" required options={OPTIONS} />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders with a pre-selected value', () => {
    render(<Select label="Fruit" options={OPTIONS} value="banana" />);
    expect(screen.getByText('Banana')).toBeTruthy();
  });

  it('calls onValueChange when option selected', async () => {
    const onValueChange = jest.fn();
    render(
      <Select label="Fruit" options={OPTIONS} onValueChange={onValueChange} />
    );
    fireEvent.press(screen.getByRole('button'));
    const apple = await screen.findByText('Apple');
    fireEvent.press(apple);
    expect(onValueChange).toHaveBeenCalledWith('apple');
  });

  it('shows custom placeholder', () => {
    render(<Select options={OPTIONS} placeholder="Pick one..." />);
    expect(screen.getByText('Pick one...')).toBeTruthy();
  });

  it('disables interaction when disabled', () => {
    const onValueChange = jest.fn();
    render(
      <Select
        label="Fruit"
        options={OPTIONS}
        disabled
        onValueChange={onValueChange}
      />
    );
    fireEvent.press(screen.getByRole('button'));
    // Modal should not appear
    expect(screen.queryByText('Apple')).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('shows error and helper text', () => {
    render(
      <Select
        options={OPTIONS}
        error="Select a fruit!"
        helperText="Fruit is required"
      />
    );
    expect(screen.getByText('Select a fruit!')).toBeTruthy();
    expect(screen.queryByText('Fruit is required')).toBeNull();
  });

  it('shows only helper text if no error', () => {
    render(<Select options={OPTIONS} helperText="Fruit is optional" />);
    expect(screen.getByText('Fruit is optional')).toBeTruthy();
  });

  it('shows a left icon if provided', () => {
    render(<Select options={OPTIONS} leftIcon={<Text>ICON</Text>} />);
    expect(screen.getByText('ICON')).toBeTruthy();
  });

  it('does not call onValueChange for disabled Option', async () => {
    const onValueChange = jest.fn();
    render(
      <Select label="Fruit" options={OPTIONS} onValueChange={onValueChange} />
    );
    fireEvent.press(screen.getByRole('button'));
    const orange = await screen.findByText('Orange');
    fireEvent.press(orange, { stopPropagation: () => {} }); // Provide event with stopPropagation
    expect(onValueChange).not.toHaveBeenCalledWith('orange');
  });

  it('applies size and variant props', () => {
    render(
      <Select options={OPTIONS} size="small" variant="outlined" value="apple" />
    );
    expect(screen.getByText('Apple')).toBeTruthy();
  });
});
