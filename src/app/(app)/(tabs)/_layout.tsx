/**
 * Bottom Tab Navigation Layout
 * Expo Router tabs configuration matching Figma design
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

// Import icons from our design system
import { Home, List, MessageSquare, User } from '@/components/icons';
import { useTheme } from '@/theme';

function TabBarIcon({
  name,
  color,
  focused: _focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  const iconSize = 24;

  switch (name) {
    case 'index':
      return <Home width={iconSize} height={iconSize} color={color} />;
    case 'tasks':
      return <List width={iconSize} height={iconSize} color={color} />;
    case 'chat':
      return <MessageSquare width={iconSize} height={iconSize} color={color} />;
    case 'profile':
      return <User width={iconSize} height={iconSize} color={color} />;
    default:
      return null;
  }
}

function TabBarBadge({ count }: { count?: number }) {
  if (!count) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#c92a2a', // Red from Figma
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 12,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        {count}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary, // Dark background from Figma
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 24, // Extra padding for safe area
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Manrope-Medium',
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#1068eb', // Blue from Figma
        tabBarInactiveTintColor: theme.colors.text.primary, // White from Figma
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="index" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <TabBarIcon name="tasks" color={color} focused={focused} />
              {/*<TabBarBadge count={1} />*/}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <TabBarIcon name="chat" color={color} focused={focused} />
              {/*<TabBarBadge count={1} />*/}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
