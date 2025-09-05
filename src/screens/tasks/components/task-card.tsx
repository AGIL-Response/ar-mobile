/**
 * Task Card Component
 * Displays task information in a card format
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Icon, iconNames, Text, View } from '@/components';
import type { Task } from '@/api/tasks/types';
import { useTheme } from '@/theme';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const theme = useTheme();

  const getTaskTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'maintenance':
        return iconNames.settings;
      case 'emergency':
        return iconNames.notification_badge;
      case 'inspection':
        return iconNames.search;
      case 'training':
        return iconNames.user;
      default:
        return iconNames.list;
    }
  };

  const getTaskTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'maintenance':
        return theme.colors.primary; // Use primary instead of info
      case 'emergency':
        return theme.colors.semantic.error;
      case 'inspection':
        return theme.colors.semantic.warning;
      case 'training':
        return theme.colors.primary;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return theme.colors.semantic.error;
      case 'high':
        return '#ff8800'; // Orange
      case 'medium':
        return theme.colors.semantic.warning;
      case 'low':
        return theme.colors.semantic.success;
      default:
        return theme.colors.text.secondary;
    }
  };

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
              fontWeight: '600',
              flex: 1,
              fontSize: 18,
              lineHeight: 20,
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
                color: (!task.status || task.status === 'pending') ? '#6a7178' : theme.colors.semantic.white,
                fontWeight: '600',
                fontSize: 12,
                lineHeight: 18,
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
              lineHeight: 21,
              fontSize: 14,
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
            fontSize: 10,
            lineHeight: 12,
          }}
        >
          {formatDate(task.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
