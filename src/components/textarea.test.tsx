import React from 'react';

import { fireEvent, render, screen } from '@/lib/test-utils';

import { TextArea } from './textarea';

describe('TextArea component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea with label', () => {
    render(<TextArea label="Description" testID="textarea" />);
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByTestId('textarea')).toBeTruthy();
  });

  it('has multiline enabled', () => {
    render(<TextArea testID="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea.props.multiline).toBe(true);
  });

  it('calls onChangeText when text changes', () => {
    render(<TextArea testID="textarea" onChangeText={mockOnChangeText} />);
    const textarea = screen.getByTestId('textarea');
    fireEvent.changeText(textarea, 'Test content');
    expect(mockOnChangeText).toHaveBeenCalledWith('Test content');
  });

  it('shows error message when error prop is provided', () => {
    render(<TextArea error="Invalid input" testID="textarea" />);
    expect(screen.getByText('Invalid input')).toBeTruthy();
  });

  it('shows helper text when helperText prop is provided', () => {
    render(<TextArea helperText="Enter a description" testID="textarea" />);
    expect(screen.getByText('Enter a description')).toBeTruthy();
  });

  it('prioritizes error over helper text', () => {
    render(
      <TextArea
        error="Error message"
        helperText="Helper text"
        testID="textarea"
      />
    );
    expect(screen.getByText('Error message')).toBeTruthy();
    expect(screen.queryByText('Helper text')).toBeNull();
  });

  it('shows character count when showCharacterCount is true', () => {
    render(<TextArea value="Hello" showCharacterCount testID="textarea" />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('shows character count with maxLength', () => {
    render(
      <TextArea
        value="Hello"
        showCharacterCount
        maxLength={100}
        testID="textarea"
      />
    );
    expect(screen.getByText('5/100')).toBeTruthy();
  });

  it('applies disabled state', () => {
    render(<TextArea disabled testID="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea.props.editable).toBe(false);
  });

  it('applies size variants', () => {
    const { rerender } = render(
      <TextArea size="small" rows={4} testID="textarea" />
    );
    let textarea = screen.getByTestId('textarea');
    expect(textarea).toBeTruthy();

    rerender(<TextArea size="medium" rows={4} testID="textarea" />);
    textarea = screen.getByTestId('textarea');
    expect(textarea).toBeTruthy();

    rerender(<TextArea size="large" rows={4} testID="textarea" />);
    textarea = screen.getByTestId('textarea');
    expect(textarea).toBeTruthy();
  });

  it('applies variant styles', () => {
    const { rerender } = render(
      <TextArea variant="outlined" testID="textarea" />
    );
    let textarea = screen.getByTestId('textarea');
    expect(textarea).toBeTruthy();

    rerender(<TextArea variant="filled" testID="textarea" />);
    textarea = screen.getByTestId('textarea');
    expect(textarea).toBeTruthy();
  });

  it('applies error state when error prop is provided', () => {
    render(<TextArea error="Error" testID="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeTruthy();
  });
});
