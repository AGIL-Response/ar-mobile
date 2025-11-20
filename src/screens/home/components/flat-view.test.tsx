import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import { FlatView } from './flat-view';

const mockMembersSection = jest.fn();
const mockTasksSection = jest.fn();

jest.mock('./members-section', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    __esModule: true,
    MembersSection: (props: unknown) => {
      mockMembersSection(props);
      return <Text>Members Section</Text>;
    },
  };
});

jest.mock('./tasks-section', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    __esModule: true,
    TasksSection: (props: unknown) => {
      mockTasksSection(props);
      return <Text>Tasks Section</Text>;
    },
  };
});

describe('FlatView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the members and tasks sections', () => {
    render(<FlatView />);

    expect(screen.getByText('Members Section')).toBeTruthy();
    expect(screen.getByText('Tasks Section')).toBeTruthy();
    expect(mockMembersSection).toHaveBeenCalled();
    expect(mockTasksSection).toHaveBeenCalled();
  });
});

