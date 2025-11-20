/**
 * Task Card Component
 * Displays task information in a card format
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import type { Task } from '@/api/tasks/types';
import { Avatar, Text, View } from '@/components';
import { Palette, useTheme } from '@/theme';
import { formatDateTime, getBackgroundColor, getStatusColor } from '../detail';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const theme = useTheme();

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
