/**
 * Incidents Section Component
 * Display task cards and reports
 */

import { RelativePathString, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components';
import { useTasksStore } from '@/stores/tasks';
import { Palette, type Theme, useTheme } from '@/theme';
import { TaskCard } from '@/screens/tasks/components/task-card';
import { FontFamilies } from '@/lib/fonts';

export function TasksSection() {
  const theme = useTheme();
  const router = useRouter();
  const tasks = useTasksStore((state) => state.tasks);
  const pendingTasks = useTasksStore((state) => state.pendingTasks);
  const isLoading = useTasksStore((state) => state.isLoading);
  const setActiveTab = useTasksStore((state) => state.actions.setActiveTab);
  const styles = createStyles(theme, isLoading && tasks.length === 0, pendingTasks.length === 0);

  const handleViewAll = () => {
    setActiveTab('pending');
    router.navigate('/tasks' as RelativePathString);
  };

  const handleTaskPress = (taskId: string) => {
    router.navigate(`/task/${taskId}` as RelativePathString);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text variant="h3" style={styles.title}>
            On-going tasks
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text variant="caption" style={styles.viewAll}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <Text variant="body" style={styles.loadingText}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text variant="h3" style={styles.title}>
          On-going tasks
        </Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text variant="caption" style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Cards */}
      <View style={styles.tasksContainer}>
        {pendingTasks.length === 0 ? (
          <Text variant="bodyMedium" style={styles.emptyText}>
            No on-going tasks found
          </Text>
        ) : (
          pendingTasks
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

const createStyles = (theme: Theme, isLoading: boolean, isEmpty: boolean) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.text.primary,
      fontFamily: FontFamilies.goldmanRegular,
    },
    viewAll: {
      color: Palette.primary,
    },
    loadingText: {
      color: theme.colors.text.primary,
    },
    tasksContainer: {
      gap: 12,
    },
    emptyText: {
      color: theme.colors.text.secondary,
    },
  });
