import React from 'react';
import { Text } from 'react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import ChatScreen from './index';

const mockChatHeader = jest.fn();

jest.mock('./components/chat-header', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    ChatHeader: (props: unknown) => {
      mockChatHeader(props);
      return <Text>Mock Chat Header</Text>;
    },
  };
});

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat placeholder content', () => {
    render(<ChatScreen />);

    expect(screen.getByText('Chat')).toBeTruthy();
    expect(
      screen.getByText('Chat and messaging features will be added here')
    ).toBeTruthy();
    expect(screen.getByText('1 new message')).toBeTruthy();
  });

  it('renders the chat header component', () => {
    render(<ChatScreen />);

    expect(screen.getByText('Mock Chat Header')).toBeTruthy();
    expect(mockChatHeader).toHaveBeenCalled();
  });
});

