/**
 * Task Detail Screen
 * Detailed view of a specific task
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import type { Task } from '@/api/tasks/types';
import {
  AppBar,
  AttachmentsGallery,
  Background,
  Button,
  Center,
  CenteredModal,
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
import { Palette, useTheme } from '@/theme';

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];
export const getStatusColor = (status: Task['status']) => {
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

export const getBackgroundColor = (status: Task['status']) => {
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

export const formatDateTime = (dateString?: string) => {
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

export default function TaskDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const authState = useAuthStore();
  const tasksState = useTasksStore();
  const {
    ref: statusModalRef,
    present: presentStatusModal,
    dismiss: dismissStatusModal,
  } = useModal();
  const [isMarkDoneModalVisible, setIsMarkDoneModalVisible] = useState(false);

  const selectedTenant = authState.selectedTenant;
  const task = tasksState.selectedTask;
  const taskId = id as string;
  const [selectedStatus, setSelectedStatus] = React.useState<
    Task['status'] | ''
  >('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
    // Don't allow checklist changes if task is completed or cancelled
    if (task?.status === 'completed' || task?.status === 'cancelled') {
      return;
    }

    await tasksState.actions.updateChecklistItem(
      checklistId,
      isCompleted,
      description
    );
  };

  const handleOpenStatusModal = () => {
    setSelectedStatus(task?.status || '');
    presentStatusModal();
  };

  const handleStatusChange = async () => {
    if (selectedStatus && taskId) {
      await tasksState.actions.updateTaskStatus(
        taskId,
        selectedStatus as Task['status']
      );
      dismissStatusModal();
    }
  };

  const handleMarkAsDone = async () => {
    if (taskId) {
      await tasksState.actions.updateTaskStatus(taskId, 'completed');
      setIsMarkDoneModalVisible(false);
    }
  };

  const handleMarkAsDonePress = () => {
    if (!task) return;

    if (task.status === 'in_progress') {
      setIsMarkDoneModalVisible(true);
    } else if (task.status === 'pending' || !task.status) {
      handleStatusUpdate('in_progress');
    }
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
    backgroundColor,
  }: {
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
    backgroundColor?: string;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Icon
          name={icon}
          size={20}
          color={theme.colors.text.icon}
          style={{ marginRight: 12 }}
        />
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.text.secondary,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
      </View>

      {label !== 'Status' ? (
        <Text
          variant="bodyMedium"
          style={{
            color: valueColor || theme.colors.text.secondary,
            fontWeight: '500',
          }}
        >
          {value}
        </Text>
      ) : (
        <View
          style={{
            backgroundColor: backgroundColor || `${valueColor}66`,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text
            variant="bodyMedium"
            style={{
              color: valueColor || theme.colors.text.secondary,
              fontWeight: '500',
            }}
          >
            {value}
          </Text>
        </View>
      )}
    </View>
  );

  if (tasksState.isLoadingDetail) {
    return (
      <Background>
        <AppBar
          title="Task Detail"
          showBackButton
          onBackPress={handleBackPress}
          titleAlign="left"
          titleFontFamily={theme.fonts.goldmanRegular}
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
          title="Task Detail"
          showBackButton
          onBackPress={handleBackPress}
          titleAlign="left"
          titleFontFamily={theme.fonts.goldmanRegular}
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

  const descriptionMaxLength = 200;
  const shouldShowSeeMore =
    task.description && task.description.length > descriptionMaxLength;
  const displayDescription = isDescriptionExpanded
    ? task.description
    : task.description?.substring(0, descriptionMaxLength);

  return (
    <Background>
      <AppBar
        title="Task Detail"
        showBackButton
        onBackPress={handleBackPress}
        titleAlign="left"
        titleFontFamily={theme.fonts.goldmanRegular}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Task Information Section */}
        <View
          style={{
            marginTop: 8,
            borderRadius: 8,
          }}
        >
          <InfoRow
            icon={iconNames.clock_fast_forward}
            label="Created at"
            value={formatDateTime(task.createdAt)}
          />

          {task.assignee && (
            <InfoRow
              icon={iconNames.user_plus}
              label="Assigned to"
              value={task.assignee.fullName || task.assignee.username}
            />
          )}

          <InfoRow
            icon={iconNames.check_circle_broken}
            label="Status"
            value={getStatusLabel(task.status)}
            valueColor={getStatusColor(task.status)}
            backgroundColor={getBackgroundColor(task.status)}
          />

          {task.startTime && (
            <InfoRow
              icon={iconNames.clock}
              label="Start time"
              value={formatDateTime(task.startTime)}
            />
          )}

          {task.deadline && (
            <InfoRow
              icon={iconNames.hourglass}
              label="Deadline"
              value={formatDateTime(task.deadline)}
            />
          )}
        </View>

        {/* Description Section */}
        {task.description && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 24,
            }}
          >
            <Text
              variant="h4"
              style={{
                color: theme.colors.text.tertiary,
                fontFamily: theme.fonts.goldmanRegular,
              }}
            >
              Description
            </Text>

            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.text.tertiary,
                marginTop: 8,
              }}
            >
              {displayDescription}
              {shouldShowSeeMore && !isDescriptionExpanded ? '... ' : ' '}
              {shouldShowSeeMore && (
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.text.tertiary,
                    textDecorationLine: 'underline',
                  }}
                  onPress={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                >
                  {isDescriptionExpanded ? 'See less' : 'See more'}
                </Text>
              )}
            </Text>
          </View>
        )}

        {/* Checklist Section */}
        {task.checklist && task.checklist.length > 0 && (
          <View
            style={{
              marginHorizontal: 12,
              marginTop: 16,
              borderTopWidth: 1,
              borderTopColor: theme.colors.surface.border,
            }}
          >
            <View style={{ paddingTop: 12 }}>
              <Text
                variant="h4"
                style={{
                  color: theme.colors.text.tertiary,
                  fontFamily: theme.fonts.goldmanRegular,
                }}
              >
                Check list
              </Text>
            </View>

            {task.checklist.map((item, index) => (
              <View
                key={item.id}
                style={{
                  paddingVertical: 8,
                }}
              >
                <Checkbox
                  label={item.description}
                  checked={item.isCompleted}
                  disabled={
                    task?.status === 'completed' || task?.status === 'cancelled'
                  }
                  onCheckedChange={(checked) =>
                    handleChecklistToggle(item.id, checked, item.description)
                  }
                  size="medium"
                  containerStyle={{ marginBottom: 0 }}
                  variant="outlined"
                />
              </View>
            ))}
          </View>
        )}

        {/* Attachments Section */}
        {task.fileIds && task.fileIds.length > 0 && (
          <View style={{ marginHorizontal: 12, marginTop: 16 }}>
            <Text
              variant="h4"
              style={{
                color: theme.colors.text.tertiary,
                fontFamily: theme.fonts.goldmanRegular,
                marginBottom: 8,
              }}
            >
              Attachments
            </Text>
            <AttachmentsGallery fileIds={task.fileIds} />
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      {task.status !== 'completed' && task.status !== 'cancelled' && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            backgroundColor: theme.colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: theme.colors.surface.border,
          }}
        >
          <Button
            title={
              task.status === 'in_progress' ? 'Mark As Done' : 'Start This Task'
            }
            variant="solid"
            size="medium"
            onPress={handleMarkAsDonePress}
            colorVariant="secondary"
          />
        </View>
      )}

      {/* Status Change Modal */}
      <Modal ref={statusModalRef} snapPoints={['40%']} title="Change Status">
        <View style={{ padding: 16, gap: 16 }}>
          <Select
            placeholder="Select Status"
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as Task['status'])
            }
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

      {/* Mark As Done Confirmation Modal */}
      <CenteredModal
        visible={isMarkDoneModalVisible}
        onClose={() => setIsMarkDoneModalVisible(false)}
        title="Header"
        subText="Sub text here"
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            justifyContent: 'flex-end',
            marginTop: 8,
          }}
        >
          <Button
            title="Cancel"
            variant="solid"
            size="medium"
            onPress={() => setIsMarkDoneModalVisible(false)}
            style={{ flex: 0, minWidth: 100 }}
            colorVariant="disabled"
          />
          <Button
            title="Confirm"
            variant="solid"
            size="medium"
            onPress={handleMarkAsDone}
            style={{ flex: 0, minWidth: 100 }}
            colorVariant="secondary"
          />
        </View>
      </CenteredModal>
    </Background>
  );
}
