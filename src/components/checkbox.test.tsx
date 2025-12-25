import React from 'react';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { Checkbox, CheckboxGroup } from './checkbox';
describe('Checkbox', () => {
  it('renders label, description, unchecked by default', () => {
    render(<Checkbox label="A" description="desc" />);
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('desc')).toBeTruthy();
  });
  it('renders checked state', () => {
    render(<Checkbox label="Checked" checked />);
    expect(screen.getByText('Checked')).toBeTruthy();
  });
  it('toggles on press', () => {
    const onCheckedChange = jest.fn();
    render(<Checkbox label="P" onCheckedChange={onCheckedChange} />);
    fireEvent.press(screen.getByText('P'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('supports left label', () => {
    render(<Checkbox label="L" labelPosition="left" />);
    expect(screen.getByText('L')).toBeTruthy();
  });
  it('renders indeterminate state', () => {
    render(<Checkbox label="I" indeterminate />);
    expect(screen.getByText('I')).toBeTruthy();
  });
  it('applies size and variant props', () => {
    render(<Checkbox label="V" size="small" variant="outlined" />);
    expect(screen.getByText('V')).toBeTruthy();
  });
});
describe('CheckboxGroup', () => {
  const options = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
  ];
  it('renders group label and options', () => {
    render(<CheckboxGroup label="G" options={options} />);
    expect(screen.getByText('G')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
  });
  it('handles value changes', () => {
    const onValueChange = jest.fn();
    render(
      <CheckboxGroup
        label="GG"
        options={options}
        value={['a']}
        onValueChange={onValueChange}
      />
    );
    fireEvent.press(screen.getByText('B'));
    expect(onValueChange).toHaveBeenCalledWith(['a', 'b']);
  });
});
