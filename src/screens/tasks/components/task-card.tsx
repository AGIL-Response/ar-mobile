/**
 * Task Card Component
 * Displays task information in a card format
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import type { Task } from '@/api/tasks/types';
import { Text, View } from '@/components';
import { useTheme } from '@/theme';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const theme = useTheme();

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '#37b24d'; // Forest green from Figma
      case 'in_progress':
        return '#f59f00'; // Orange from Figma
      case 'cancelled':
        return '#c92a2a'; // Fire brick from Figma
      case 'pending':
      default:
        return '#f8f9fa'; // Whitesmoke from Figma for "Not Started"
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: Task['status']) => {
    if (!status) return 'Not Started';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: theme.colors.surface.card,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.surface.border,
          padding: 16,
          marginBottom: 12,
        }}
      >
        {/* Header with Checkbox */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          {/* Checkbox */}
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: theme.colors.surface.border,
              backgroundColor: theme.colors.background.primary,
              marginRight: 12,
            }}
          />

          {/* Task Title */}
          <Text
            variant="h4"
            style={{
              color: theme.colors.text.primary,
              flex: 1,
            }}
          >
            {task.name}
          </Text>

          {/* Status Badge */}
          <View
            style={{
              backgroundColor: getStatusColor(task.status),
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 100,
            }}
          >
            <Text
              variant="caption"
              style={{
                color:
                  !task.status || task.status === 'pending'
                    ? '#6a7178'
                    : theme.colors.semantic.white,
              }}
            >
              {getStatusLabel(task.status)}
            </Text>
          </View>
        </View>

        {/* Description */}
        {task.description && (
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        )}

        {/* Date */}
        <Text
          variant="caption"
          style={{
            color: theme.colors.text.muted,
          }}
        >
          {formatDate(task.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
