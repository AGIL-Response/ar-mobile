import React from 'react';

import {
  flattenStyle,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { TasksHeader } from './tasks-header';

describe('TasksHeader', () => {
  test('renders the tasks heading', () => {
    render(<TasksHeader />);

    expect(screen.getByText('Tasks')).toBeTruthy();
  });

  test('applies header container and text styles', () => {
    render(<TasksHeader />);

    const title = screen.getByText('Tasks');
    const container = screen.getByTestId('tasks-header-container');

    const containerStyle = flattenStyle(container.props.style);
    const textStyle = flattenStyle(title.props.style);

    expect(containerStyle.height).toBe(56);
    expect(containerStyle.flexDirection).toBe('row');
    expect(containerStyle.alignItems).toBe('center');
    expect(textStyle.fontSize).toBe(20);
    expect(textStyle.fontWeight).toBe('600');
  });
});
