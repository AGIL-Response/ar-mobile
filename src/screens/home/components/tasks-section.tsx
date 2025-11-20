/**
 * Incidents Section Component
 * Display task cards and reports
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Text, View } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import { Palette, useTheme } from '@/theme';
import { TaskCard } from '@/screens/tasks/components/task-card';
import { FontFamilies } from '@/lib/fonts';

export function TasksSection() {
  const theme = useTheme();
  const router = useRouter();
  const authState = useAuthStore();
  const tasksState = useTasksStore();

  const handleViewAll = () => {
    tasksState.actions.setActiveTab('pending');
    router.navigate('/tasks');
  };

  const handleTaskPress = (taskId: string) => {
    router.navigate(`/task/${taskId}`);
  };

  if (tasksState.isLoading && tasksState.tasks.length === 0) {
    return (
      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            variant="h3"
            style={{
              color: theme.colors.text.primary,
              fontFamily: FontFamilies.goldmanRegular,
            }}
          >
            On-going tasks
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text
              variant="caption"
              style={{
                color: Palette.primary,
              }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <Text variant="body" style={{ color: theme.colors.text.primary }}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {/* Header Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          variant="h3"
          style={{
            color: theme.colors.text.primary,
            fontFamily: FontFamilies.goldmanRegular,
          }}
        >
          On-going tasks
        </Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text
            variant="caption"
            style={{
              color: Palette.primary,
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Cards */}
      <View style={{ gap: 12 }}>
        {tasksState.pendingTasks.length === 0 ? (
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.text.secondary }}
          >
            No on-going tasks found
          </Text>
        ) : (
          tasksState.pendingTasks
            .slice(0, 3)
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => handleTaskPress(task.id)}
              />
            ))
        )}
      </View>
    </View>
  );
}
