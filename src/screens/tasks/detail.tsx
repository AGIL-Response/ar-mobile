/**
 * Task Detail Screen
 * Detailed view of a specific task
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Task } from '@/api/tasks/types';
import {
  AppBar,
  Button,
  Center,
  Icon,
  iconNames,
  Text,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import { useTheme } from '@/theme';

export default function TaskDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const authState = useAuthStore();
  const tasksState = useTasksStore();

  const selectedTenant = authState.selectedTenant;
  const task = tasksState.selectedTask;
  const taskId = id as string;

  useEffect(() => {
    if (selectedTenant?.id && taskId) {
      tasksState.actions.fetchTask(selectedTenant.id, taskId);
    }

    // Clear selected task when component unmounts
    return () => {
      tasksState.actions.clearSelectedTask();
    };
  }, [selectedTenant?.id, taskId]);

  const handleBackPress = () => {
    router.back();
  };

  const handleStatusUpdate = async (status: Task['status']) => {
    if (selectedTenant?.id && taskId) {
      await tasksState.actions.updateTaskStatus(
        selectedTenant.id,
        taskId as string,
        status
      );
    }
  };

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
        return '#ff8800';
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
        return theme.colors.semantic.success;
      case 'in_progress':
        return theme.colors.primary; // Use primary instead of info
      case 'cancelled':
        return theme.colors.semantic.error;
      case 'pending':
      default:
        return theme.colors.semantic.warning;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: Task['status']) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const InfoRow = ({
    icon,
    label,
    value,
    valueColor,
  }: {
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface.border,
      }}
    >
      <Icon
        name={icon}
        size={20}
        color={theme.colors.text.secondary}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          variant="caption"
          style={{
            color: theme.colors.text.secondary,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          variant="body"
          style={{
            color: valueColor || theme.colors.text.primary,
            fontWeight: '500',
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );

  if (tasksState.isLoadingDetail) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
        <AppBar
          title="Task Details"
          showBackButton
          onBackPress={handleBackPress}
        />
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
            }}
          >
            Loading task details...
          </Text>
        </Center>
      </SafeAreaView>
    );
  }

  if (tasksState.error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
        <AppBar
          title="Task Details"
          showBackButton
          onBackPress={handleBackPress}
        />
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.semantic.error,
              textAlign: 'center',
            }}
          >
            {tasksState.error}
          </Text>
          <Button
            title="Retry"
            variant="outline"
            size="medium"
            onPress={() => {
              if (selectedTenant?.id && taskId) {
                tasksState.actions.fetchTask(
                  selectedTenant.id,
                  taskId as string
                );
              }
            }}
            style={{ marginTop: 16 }}
          />
        </Center>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
        <AppBar
          title="Task Details"
          showBackButton
          onBackPress={handleBackPress}
        />
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Task not found
          </Text>
        </Center>
      </SafeAreaView>
    );
  }

  const canMarkComplete = !task.status || task.status !== 'completed';
  const canMarkPending = task.status === 'completed';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <AppBar
        title="Task Details"
        showBackButton
        onBackPress={handleBackPress}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header Section */}
        <View
          style={{
            backgroundColor: theme.colors.surface.card,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.surface.border,
            overflow: 'hidden',
          }}
        >
          {/* Title and Type */}
          <View style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${getTaskTypeColor(task.type)}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Icon
                  name={getTaskTypeIcon(task.type)}
                  size={20}
                  color={getTaskTypeColor(task.type)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  variant="h3"
                  style={{
                    color: theme.colors.text.primary,
                    marginBottom: 4,
                  }}
                >
                  {task.name}
                </Text>
                <Text
                  variant="caption"
                  style={{
                    color: theme.colors.text.secondary,
                    textTransform: 'capitalize',
                  }}
                >
                  {task.type} Task
                </Text>
              </View>
            </View>

            {/* Description */}
            {task.description && (
              <Text
                variant="body"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 20,
                }}
              >
                {task.description}
              </Text>
            )}
          </View>

          {/* Task Information */}
          <InfoRow
            icon={iconNames.notification_badge}
            label="Priority"
            value={task.priority.toUpperCase()}
            valueColor={getPriorityColor(task.priority)}
          />

          <InfoRow
            icon={iconNames.clock}
            label="Status"
            value={getStatusLabel(task.status)}
            valueColor={getStatusColor(task.status)}
          />

          <InfoRow
            icon={iconNames.clock}
            label="Created"
            value={formatDate(task.createdAt)}
          />

          {task.deadline && (
            <InfoRow
              icon={iconNames.clock}
              label="Deadline"
              value={formatDate(task.deadline)}
            />
          )}

          {task.startTime && (
            <InfoRow
              icon={iconNames.clock}
              label="Start Time"
              value={formatDate(task.startTime)}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ padding: 16, gap: 12 }}>
          {canMarkComplete && (
            <Button
              title="Mark as Completed"
              variant="solid"
              size="medium"
              onPress={() => handleStatusUpdate('completed')}
              style={{
                backgroundColor: theme.colors.semantic.success,
              }}
            />
          )}

          {canMarkPending && (
            <Button
              title="Mark as Pending"
              variant="outline"
              size="medium"
              onPress={() => handleStatusUpdate('pending')}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
