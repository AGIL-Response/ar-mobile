import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { TaskTabSelector } from './task-tab-selector';

describe('TaskTabSelector', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders tab labels with counts for pending and completed tasks', () => {
    render(
      <TaskTabSelector
        activeTab="all"
        onTabChange={jest.fn()}
        pendingCount={2}
        completedCount={1}
      />
    );

    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('(2)')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('(1)')).toBeTruthy();
    expect(screen.queryByText('(3)')).toBeNull();
  });

  test('invokes onTabChange when a tab is pressed', () => {
    const handleTabChange = jest.fn();

    render(
      <TaskTabSelector
        activeTab="all"
        onTabChange={handleTabChange}
        pendingCount={1}
        completedCount={0}
      />
    );

    const pendingLabel = screen.getByText('Pending');
    const pendingPressable = findPressableParent(pendingLabel);

    fireEvent.press(pendingPressable);

    expect(handleTabChange).toHaveBeenCalledWith('pending');
  });

  test('does not render counts when values are zero', () => {
    render(
      <TaskTabSelector
        activeTab="completed"
        onTabChange={jest.fn()}
        pendingCount={0}
        completedCount={0}
      />
    );

    expect(screen.queryByText('(0)')).toBeNull();
  });
});
