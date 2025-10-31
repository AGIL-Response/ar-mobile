import React from 'react';
import { Text } from 'react-native';

import { fireEvent, render, screen } from '@/lib/test-utils';

import { TabBar } from './tab-bar';

const mockItems = [
  { label: 'Tab 1', value: 'tab1' },
  { label: 'Tab 2', value: 'tab2' },
  { label: 'Tab 3', value: 'tab3', disabled: true },
];

describe('TabBar component', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tab items', () => {
    render(<TabBar items={mockItems} testID="tabbar" />);
    expect(screen.getByText('Tab 1')).toBeTruthy();
    expect(screen.getByText('Tab 2')).toBeTruthy();
    expect(screen.getByText('Tab 3')).toBeTruthy();
  });

  it('calls onTabChange when tab is pressed', () => {
    render(
      <TabBar items={mockItems} onTabChange={mockOnTabChange} testID="tabbar" />
    );
    const tab1 = screen.getByText('Tab 1');
    fireEvent.press(tab1);
    expect(mockOnTabChange).toHaveBeenCalledWith('tab1');
  });

  it('does not call onTabChange for disabled tabs', () => {
    render(
      <TabBar items={mockItems} onTabChange={mockOnTabChange} testID="tabbar" />
    );
    const tab3 = screen.getByText('Tab 3');
    fireEvent.press(tab3);
    expect(mockOnTabChange).not.toHaveBeenCalled();
  });

  it('highlights active tab', () => {
    render(<TabBar items={mockItems} activeTab="tab2" testID="tabbar" />);
    const tab2 = screen.getByText('Tab 2');
    expect(tab2).toBeTruthy();
  });

  it('renders tabs with icons', () => {
    const itemsWithIcons = [
      {
        label: 'Home',
        value: 'home',
        icon: <Text testID="home-icon">🏠</Text>,
      },
      {
        label: 'Settings',
        value: 'settings',
        icon: <Text testID="settings-icon">⚙️</Text>,
      },
    ];
    render(<TabBar items={itemsWithIcons} testID="tabbar" />);
    expect(screen.getByTestId('home-icon')).toBeTruthy();
    expect(screen.getByTestId('settings-icon')).toBeTruthy();
  });

  it('renders tabs with badges', () => {
    const itemsWithBadges = [
      { label: 'Inbox', value: 'inbox', badge: '5' },
      { label: 'Messages', value: 'messages', badge: 10 },
    ];
    render(<TabBar items={itemsWithBadges} testID="tabbar" />);
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
  });
});
