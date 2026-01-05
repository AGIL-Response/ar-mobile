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

export function EmptyState({ isLoading, }: EmptyStateProps) {
  const theme = useTheme();

  const outerContainerStyle = {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  const innerContainerStyle = {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingTop: theme.spacing.gap.xl * 3,
  };

  if (isLoading) {
    return (
      <View style={outerContainerStyle}>
        <View style={innerContainerStyle}>
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
      </View>
    );
  }

  return (
    <View style={outerContainerStyle}>
      <View
        style={{
          ...innerContainerStyle,
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
    </View>
  );
}

