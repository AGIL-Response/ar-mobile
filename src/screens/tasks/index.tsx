/**
 * Tasks Screen
 * Task management and list view
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Center, Screen, Text, View } from '@/components';
import { useTheme } from '@/theme';

import { TasksHeader } from './components/tasks-header';

export default function TasksScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <Screen>
        {/* Header */}
        <TasksHeader />

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Center style={{ flex: 1 }}>
            <Text
              variant="h1"
              style={{
                color: theme.colors.text.primary,
                textAlign: 'center',
                marginBottom: theme.spacing.gap.md,
              }}
            >
              Tasks
            </Text>
            <Text
              variant="body"
              style={{
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}
            >
              Task management interface will be added here
            </Text>

            {/* Badge indicator */}
            <View
              style={{
                marginTop: 20,
                backgroundColor: '#c92a2a',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                1 pending task
              </Text>
            </View>
          </Center>
        </View>
      </Screen>
    </SafeAreaView>
  );
}
