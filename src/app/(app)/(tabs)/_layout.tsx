/**
 * Bottom Tab Navigation Layout
 * Expo Router tabs configuration matching Figma design
 */

import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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
    incidents: iconNames.incident,
    create: iconNames.plus,
    notifications: iconNames.notification_badge,
    chat: iconNames.message_square,
    profile: iconNames.user,
  };

  const iconName = iconMap[name];

  return <Icon name={iconName} size={24} color={color} />;
}

// function TabBarBadge({ count }: { count?: number }) {
//   if (!count) return null;

//   return (
//     <View
//       style={{
//         position: 'absolute',
//         top: -4,
//         right: -4,
//         backgroundColor: '#c92a2a', // Red from Figma
//         borderRadius: 8,
//         minWidth: 16,
//         height: 16,
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1,
//       }}
//     >
//       <Text
//         style={{
//           color: 'white',
//           fontSize: 12,
//           fontWeight: '600',
//           textAlign: 'center',
//         }}
//       >
//         {count}
//       </Text>
//     </View>
//   );
// }

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.tertiary, // Dark background from Figma
          borderTopWidth: 0,
          paddingTop: 20,
          height: 85,
        },
        tabBarActiveTintColor: theme.colors.text.tertiary, // Blue from Figma
        tabBarInactiveTintColor: theme.colors.text.inactive, // White from Figma
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
        name="incidents"
        options={{
          title: 'Incidents',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="incidents" color={color} focused={focused} />
          ),
        }}
      />
      {/* Create Incident */}
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/incidents/create' as any)}
              accessibilityRole="button"
              accessibilityLabel="Create Incident"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.semantic.error,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                name={iconNames.plus}
                size={24}
                color={theme.colors.semantic.white}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <TabBarIcon
                name="notifications"
                color={color}
                focused={focused}
              />
              {/*<TabBarBadge count={3} />*/}
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
