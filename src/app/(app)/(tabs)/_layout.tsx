/**
 * Bottom Tab Navigation Layout
 * Expo Router tabs configuration matching Figma design
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

// Import the new Icon component and constants
import { Icon, type IconName, iconNames } from '@/components';
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
  // Map route names to icon names using constants
  const iconMap: Record<string, IconName> = {
    index: iconNames.home,
    tasks: iconNames.list,
    chat: iconNames.message_square,
    profile: iconNames.user,
  };
  
  const iconName = iconMap[name];
  
  if (!iconName) return null;
  
  return <Icon name={iconName} size={24} color={color} />;
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
