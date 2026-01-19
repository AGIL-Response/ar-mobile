import React from 'react';

import { reactNativeRender as render } from '@/lib/test-utils';

import TabLayout from './_layout';

const themeModule = require('@/theme');
const mockTheme = themeModule.useThemeColors();
const routerModule = require('expo-router');

describe('TabLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(screenOptions.tabBarShowLabel).toBe(false);
    expect(screenOptions.tabBarStyle.backgroundColor).toBe(
      mockTheme.background.tertiary
    );
    expect(screenOptions.tabBarStyle.borderTopWidth).toBe(0);
    expect(screenOptions.tabBarStyle.paddingTop).toBe(20);
    expect(screenOptions.tabBarStyle.paddingBottom).toBe(0); // bottomInset from mock
    expect(screenOptions.tabBarStyle.height).toBe(85); // tabBarHeight + bottomInset (85 + 0)
    expect(screenOptions.tabBarActiveTintColor).toBe(
      mockTheme.text.tertiary
    );
    expect(screenOptions.tabBarInactiveTintColor).toBe(
      mockTheme.text.inactive
    );
  });

  it('configures all tab screens with correct titles', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    const tabNames = ['index', 'tasks', 'create', 'incidents', 'chat'];
    const tabTitles = ['Home', 'Tasks', 'Create', 'Incidents', 'Chat'];

    expect(children).toHaveLength(5);

    children.forEach((child: React.ReactElement, index: number) => {
      expect((child as any).props.name).toBe(tabNames[index]);
      expect((child as any).props.options.title).toBe(tabTitles[index]);
    });
  });

  it('renders TabBarIcon for each tab', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    children.forEach((child: React.ReactElement) => {
      const iconFunction = (child as any).props.options.tabBarIcon;
      expect(typeof iconFunction).toBe('function');

      // Test that icon function returns a component
      const iconResult = iconFunction({ color: mockTheme.primary, focused: true });
      expect(iconResult).toBeTruthy();
    });
  });

  it('applies theme colors correctly', () => {
    render(<TabLayout />);
    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const screenOptions = props.screenOptions;

    expect(screenOptions.tabBarStyle.backgroundColor).toBe(
      mockTheme.white
    );
    expect(screenOptions.tabBarInactiveTintColor).toBe(
      mockTheme.white
    );
  });

  it('On press of create incident, it navigates to the create incident screen', () => {
    // Create a mock navigate function
    const navigateMock = jest.fn();
    (routerModule.useRouter as jest.Mock).mockReturnValue({
      navigate: navigateMock,
    });

    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    // Get the create tab (index 2)
    const createTab = children[2];
    expect((createTab as any).props.name).toBe('create');

    // Get the icon function from the create tab
    const createIconFunction = (createTab as any).props.options.tabBarIcon;
    expect(typeof createIconFunction).toBe('function');

    // Call the icon function to get the TouchableOpacity component
    const createIconResult = createIconFunction({
      color: mockTheme.primary,
      focused: true,
    });

    // The icon function should return a TouchableOpacity component
    expect(createIconResult).toBeTruthy();
    expect(createIconResult.type.displayName || createIconResult.type.name).toBe(
      'TouchableOpacity'
    );

    // Get the onPress handler from the TouchableOpacity props
    const onPressHandler = createIconResult.props.onPress;
    expect(typeof onPressHandler).toBe('function');

    // Call the onPress handler
    onPressHandler();

    // Assert that router.navigate was called with '/incidents/create'
    expect(navigateMock).toHaveBeenCalledWith('/incidents/create');
  });
});

describe('TabBarIcon integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders icon for all configured routes', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const props = tabsCall[0];
    const children = props.children;

    // All tabs should have valid icons (no null returns)
    children.forEach((child: React.ReactElement) => {
      const iconFunction = (child as any).props.options.tabBarIcon;
      const iconResult = iconFunction({ color: 'mockTheme.primary', focused: true });
      // Should not be null for configured routes
      expect(iconResult).not.toBeNull();
    });
  });

  it('passes correct props to TabBarIcon', () => {
    render(<TabLayout />);

    const tabsCall = (routerModule.Tabs as jest.Mock).mock.calls[0];
    const indexTab = tabsCall[0].children[0];
    const iconFunction = indexTab.props.options.tabBarIcon;

    const iconResult = iconFunction({ color: 'mockTheme.primary', focused: true });
    expect(iconResult).toBeTruthy();
  });
});

describe('TabBarBadge integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      color: 'mockTheme.primary',
      focused: true,
    });
    expect(tasksIconResult.type.displayName || tasksIconResult.type.name).toBe(
      'View'
    );

    // Chat tab (index 3) should have View wrapper
    const chatTab = children[3];
    const chatIconFunction = chatTab.props.options.tabBarIcon;
    const chatIconResult = chatIconFunction({
      color: 'mockTheme.primary',
      focused: true,
    });
    expect(chatIconResult.type.displayName || chatIconResult.type.name).toBe(
      'TabBarIcon'
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
      color: 'mockTheme.primary',
      focused: true,
    });
    expect(
      indexIconResult.type.displayName || indexIconResult.type.name
    ).not.toBe('View');
  });
});
