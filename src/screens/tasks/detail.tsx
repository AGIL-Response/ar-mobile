/**
 * Task Detail Screen
 * Detailed view of a specific task
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import type { Task } from '@/api/tasks/types';
import {
  AppBar,
  Background,
  Button,
  Center,
  Checkbox,
  Icon,
  iconNames,
  Modal,
  Select,
  Text,
  useModal,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import { useTheme } from '@/theme';

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function TaskDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const authState = useAuthStore();
  const tasksState = useTasksStore();
  const { ref: statusModalRef, present: presentStatusModal, dismiss: dismissStatusModal } = useModal();

  const selectedTenant = authState.selectedTenant;
  const task = tasksState.selectedTask;
  const taskId = id as string;
  const [selectedStatus, setSelectedStatus] = React.useState<Task['status'] | ''>('');

  useEffect(() => {
    if (taskId) {
      tasksState.actions.fetchTask(taskId);
    }

    // Clear selected task when component unmounts
    return () => {
      tasksState.actions.clearSelectedTask();
    };
  }, [taskId]);

  const handleBackPress = () => {
    router.back();
  };

  const handleStatusUpdate = async (status: Task['status']) => {
    if (taskId) {
      await tasksState.actions.updateTaskStatus(taskId as string, status);
    }
  };

  const handleChecklistToggle = async (
    checklistId: string,
    isCompleted: boolean,
    description: string
  ) => {
    await tasksState.actions.updateChecklistItem(checklistId, isCompleted, description);
  };

  const handleOpenStatusModal = () => {
    setSelectedStatus(task?.status || '');
    presentStatusModal();
  };

  const handleStatusChange = async () => {
    if (selectedStatus && taskId) {
      await tasksState.actions.updateTaskStatus(taskId, selectedStatus as Task['status']);
      dismissStatusModal();
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
      <Background>
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
      </Background>
    );
  }

  if (!task) {
    return (
      <Background>
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
      </Background>
    );
  }

  const canMarkComplete = !task.status || task.status !== 'completed';
  const canMarkPending = task.status === 'completed';

  return (
    <Background>
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
            borderWidth: 2,
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

        {/* Checklist Section */}
        {task.checklist && task.checklist.length > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.surface.card,
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: theme.colors.surface.border,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.surface.border,
              }}
            >
              <Text
                variant="h3"
                style={{
                  color: theme.colors.text.primary,
                }}
              >
                Checklist ({task.checklist.filter((item) => item.isCompleted).length}/
                {task.checklist.length})
              </Text>
            </View>

            {task.checklist.map((item, index) => (
              <View
                key={item.id}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth:
                    index < task.checklist.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.surface.border,
                }}
              >
                <Checkbox
                  label={item.description}
                  checked={item.isCompleted}
                  onCheckedChange={(checked) =>
                    handleChecklistToggle(item.id, checked, item.description)
                  }
                  size="medium"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ padding: 16, gap: 12 }}>
          <Button
            title="Change Status"
            variant="solid"
            size="medium"
            onPress={handleOpenStatusModal}
            style={{
              backgroundColor: theme.colors.primary,
            }}
          />
        </View>
      </ScrollView>

      {/* Status Change Modal */}
      <Modal
        ref={statusModalRef}
        snapPoints={['40%']}
        title="Change Status"
      >
        <View style={{ padding: 16, gap: 16 }}>
          <Select
            placeholder="Select Status"
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as Task['status'])}
            options={statusOptions}
          />

          <Button
            title="Update Status"
            variant="solid"
            size="medium"
            onPress={handleStatusChange}
            disabled={!selectedStatus || selectedStatus === task?.status}
          />
        </View>
      </Modal>
    </Background>
  );
}
