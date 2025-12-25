/**
 * Task Card Component
 * Displays task information in a card format
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import type { Task } from '@/api/tasks/types';
import { Avatar, Text, View } from '@/components';
import { type Theme, useTheme } from '@/theme';
import { formatDateTime, getBackgroundColor, getStatusColor } from '../detail';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme, task.status);

  const getStatusLabel = (status: Task['status']) => {
    if (!status) return 'Not Started';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        {/* Header with Checkbox */}
        <View style={styles.header}>
          {/* Task Title */}
          <Text variant="h4" style={styles.title}>
            {task.name}
          </Text>
        </View>

        {/* Date */}
        <Text variant="caption" style={styles.date}>
          {formatDateTime(task.createdAt)}
        </Text>

        {/* Description */}
        {task.description && (
          <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        {/* Footer: assignee */}
        <View style={styles.footer}>
          <View style={styles.assigneeContainer}>
            <Avatar
              fileId={task.assignee?.avatarId}
              size="small"
              fallback={(task.assignee?.fullName || '?')
                .split(' ')
                .map((s) => s[0])
                .join('')}
            />
            <Text variant="caption" style={styles.assigneeName}>
              {task.assignee?.fullName || 'Unassigned'}
            </Text>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getBackgroundColor(task.status),
              },
            ]}
          >
            <Text
              variant="caption"
              style={[
                styles.statusText,
                {
                  color: getStatusColor(task.status),
                },
              ]}
            >
              {getStatusLabel(task.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme, status: Task['status']) =>
  StyleSheet.create({
    card: {
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.surface.border,
      padding: 16,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      color: theme.colors.text.tertiary,
      fontFamily: theme.fonts.goldmanRegular,
      flex: 1,
    },
    date: {
      color: theme.colors.text.inactive,
    },
    description: {
      color: theme.colors.text.secondary,
      marginTop: 8,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    assigneeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    assigneeName: {
      marginLeft: 8,
      color: theme.colors.text.secondary,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
