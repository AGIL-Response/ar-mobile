/**
 * Task Card Component
 * Displays task information in a card format
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import type { Task } from '@/api/tasks/types';
import { Avatar, Text, View } from '@/components';
import { Palette, useTheme } from '@/theme';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const theme = useTheme();

  const getBackgroundColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return Palette.successAlt; // Forest green from Figma
      case 'in_progress':
        return Palette.warningAlt;
      case 'cancelled':
        return Palette.errorAlt;
      case 'pending':
      default:
        return Palette.backgroundSecondary;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return Palette.success; // Forest green from Figma
      case 'in_progress':
        return Palette.warning; // Orange from Figma
      case 'cancelled':
        return Palette.error; // Fire brick from Figma
      case 'pending':
      default:
        return Palette.primary500; // Whitesmoke from Figma for "Not Started"
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${datePart} ${timePart}`;
  };

  const getStatusLabel = (status: Task['status']) => {
    if (!status) return 'Not Started';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 2,
          borderColor: theme.colors.surface.border,
          padding: 16,
          marginBottom: 12,
          // minHeight: 150,
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
          {/* Task Title */}
          <Text
            variant="h4"
            style={{
              color: theme.colors.text.tertiary,
              fontFamily: theme.fonts.goldmanRegular,
              flex: 1,
            }}
          >
            {task.name}
          </Text>
        </View>

        {/* Date */}
        <Text
          variant="caption"
          style={{
            color: theme.colors.text.inactive,
          }}
        >
          {formatDateTime(task.createdAt)}
        </Text>

        {/* Description */}
        {task.description && (
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.text.secondary,
              marginTop: 8,
            }}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        )}

        {/* Footer: assignee */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar
              fileId={task.assignee?.avatarId}
              size="small"
              fallback={(task.assignee?.fullName || '?')
                .split(' ')
                .map((s) => s[0])
                .join('')}
              variant="bordered"
            />
            <Text
              variant="label"
              numberOfLines={1}
              style={{
                color: theme.colors.text.secondary,
                marginLeft: 8,
                maxWidth: '80%',
              }}
            >
              {task.assignee?.fullName || 'Unassigned'}
            </Text>
          </View>

          {/* Status Badge */}
          <View
            style={{
              backgroundColor: getBackgroundColor(task.status),
              paddingHorizontal: 6,
              paddingTop: 8,
              paddingBottom: 4,
              borderRadius: 4,
            }}
          >
            <Text
              variant="caption"
              style={{
                color: getStatusColor(task.status),
              }}
            >
              {getStatusLabel(task.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
