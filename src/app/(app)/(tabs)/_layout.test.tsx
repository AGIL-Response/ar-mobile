import React from 'react';

import { reactNativeRender as render } from '@/lib/test-utils';

import TabLayout from './_layout';

const themeModule = require('@/theme');
const routerModule = require('expo-router');

describe('TabLayout', () => {
  const mockTheme = {
    colors: {
      background: {
        primary: '#ffffff',
      },
      text: {
        primary: '#111827',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(themeModule, 'useTheme').mockReturnValue(mockTheme);
  });

  it('renders TabLayout component', () => {
    render(<TabLayout />);

    expect(routerModule.Tabs).toHaveBeenCalled();
  });

  it('configures tabs with correct screen options', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const screenOptions = props.screenOptions;

    expect(screenOptions.headerShown).toBe(false);
    expect(screenOptions.tabBarStyle.backgroundColor).toBe(
      mockTheme.colors.background.primary
    );
    expect(screenOptions.tabBarStyle.borderTopWidth).toBe(0);
    expect(screenOptions.tabBarStyle.paddingTop).toBe(8);
    expect(screenOptions.tabBarStyle.paddingBottom).toBe(24);
    expect(screenOptions.tabBarStyle.height).toBe(80);
    expect(screenOptions.tabBarActiveTintColor).toBe('#1068eb');
    expect(screenOptions.tabBarInactiveTintColor).toBe(
      mockTheme.colors.text.primary
    );
  });

  it('configures all tab screens with correct titles', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    const tabNames = ['index', 'tasks', 'incidents', 'chat', 'profile'];
    const tabTitles = ['Home', 'Tasks', 'Incidents', 'Chat', 'Profile'];

    expect(children).toHaveLength(5);

    children.forEach((child: React.ReactElement, index: number) => {
      expect(child.props.name).toBe(tabNames[index]);
      expect(child.props.options.title).toBe(tabTitles[index]);
    });
  });

  it('renders TabBarIcon for each tab', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    children.forEach((child: React.ReactElement) => {
      const iconFunction = child.props.options.tabBarIcon;
      expect(typeof iconFunction).toBe('function');

      // Test that icon function returns a component
      const iconResult = iconFunction({ color: '#1068eb', focused: true });
      expect(iconResult).toBeTruthy();
    });
  });

  it('applies theme colors correctly', () => {
    const darkTheme = {
      colors: {
        background: {
          primary: '#000000',
        },
        text: {
          primary: '#ffffff',
        },
      },
    };

    jest.spyOn(themeModule, 'useTheme').mockReturnValue(darkTheme);

    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const screenOptions = props.screenOptions;

    expect(screenOptions.tabBarStyle.backgroundColor).toBe(
      darkTheme.colors.background.primary
    );
    expect(screenOptions.tabBarInactiveTintColor).toBe(
      darkTheme.colors.text.primary
    );
  });

  it('configures tab bar label style correctly', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const screenOptions = props.screenOptions;

    expect(screenOptions.tabBarLabelStyle.fontSize).toBe(12);
    expect(screenOptions.tabBarLabelStyle.fontFamily).toBe('Manrope-Medium');
    expect(screenOptions.tabBarLabelStyle.fontWeight).toBe('500');
    expect(screenOptions.tabBarLabelStyle.marginTop).toBe(4);
  });
});

describe('TabBarIcon integration', () => {
  const mockTheme = {
    colors: {
      background: {
        primary: '#ffffff',
      },
      text: {
        primary: '#111827',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(themeModule, 'useTheme').mockReturnValue(mockTheme);
  });

  it('renders icon for all configured routes', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    // All tabs should have valid icons (no null returns)
    children.forEach((child: React.ReactElement) => {
      const iconFunction = child.props.options.tabBarIcon;
      const iconResult = iconFunction({ color: '#1068eb', focused: true });
      // Should not be null for configured routes
      expect(iconResult).not.toBeNull();
    });
  });

  it('passes correct props to TabBarIcon', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const indexTab = tabsCall[0].children[0];
    const iconFunction = indexTab.props.options.tabBarIcon;

    const iconResult = iconFunction({ color: '#1068eb', focused: true });
    expect(iconResult).toBeTruthy();
  });
});

describe('TabBarBadge integration', () => {
  const mockTheme = {
    colors: {
      background: {
        primary: '#ffffff',
      },
      text: {
        primary: '#111827',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(themeModule, 'useTheme').mockReturnValue(mockTheme);
  });

  it('renders tabs with View wrapper for tasks and chat (badge support)', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    // Tasks tab (index 1) should have View wrapper
    const tasksTab = children[1];
    const tasksIconFunction = tasksTab.props.options.tabBarIcon;
    const tasksIconResult = tasksIconFunction({
      color: '#1068eb',
      focused: true,
    });
    expect(tasksIconResult.type.displayName || tasksIconResult.type.name).toBe(
      'View'
    );

    // Chat tab (index 3) should have View wrapper
    const chatTab = children[3];
    const chatIconFunction = chatTab.props.options.tabBarIcon;
    const chatIconResult = chatIconFunction({
      color: '#1068eb',
      focused: true,
    });
    expect(chatIconResult.type.displayName || chatIconResult.type.name).toBe(
      'View'
    );
  });

  it('renders tabs without View wrapper for index, incidents, and profile', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    // Index, incidents, and profile tabs don't have View wrappers
    const indexTab = children[0];
    const indexIconFunction = indexTab.props.options.tabBarIcon;
    const indexIconResult = indexIconFunction({
      color: '#1068eb',
      focused: true,
    });
    expect(
      indexIconResult.type.displayName || indexIconResult.type.name
    ).not.toBe('View');
  });
});
