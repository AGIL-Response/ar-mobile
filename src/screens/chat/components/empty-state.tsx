/**
 * Empty State Component
 * Single Responsibility: Display empty state for message list
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components';
import { useTheme } from '@/theme';

interface EmptyStateProps {
  isLoading: boolean;
}

export function EmptyState({ isLoading }: EmptyStateProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: theme.spacing.gap.xl * 3,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          variant="body"
          style={{
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.gap.md,
          }}
        >
          Loading messages...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: theme.spacing.gap.xl * 3,
        paddingHorizontal: theme.spacing.gap.xl,
      }}
    >
      <Text
        variant="h3"
        style={{
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.gap.sm,
          textAlign: 'center',
        }}
      >
        💬
      </Text>
      <Text
        variant="h4"
        style={{
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.gap.xs,
          textAlign: 'center',
        }}
      >
        No messages yet
      </Text>
      <Text
        variant="body"
        style={{
          color: theme.colors.text.secondary,
          textAlign: 'center',
        }}
      >
        Start the conversation by sending a message
      </Text>
    </View>
  );
}

