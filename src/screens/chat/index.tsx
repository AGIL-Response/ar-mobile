/**
 * Chat Screen
 * Chat and messaging interface
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Center, Screen, Text, View } from '@/components';
import { useTheme } from '@/theme';

import { ChatHeader } from './components/chat-header';

export default function ChatScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <Screen>
        {/* Header */}
        <ChatHeader />

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
              Chat
            </Text>
            <Text
              variant="body"
              style={{
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}
            >
              Chat and messaging features will be added here
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
                1 new message
              </Text>
            </View>
          </Center>
        </View>
      </Screen>
    </SafeAreaView>
  );
}
