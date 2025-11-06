/**
 * Tasks Screen
 * Task management and list view with tab functionality
 */

import images from '@assets/images';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import {
  AppBar,
  Avatar,
  Background,
  Center,
  Icon,
  iconNames,
  Text,
  TouchableOpacity,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import { useTheme } from '@/theme';

import { TaskCard } from './components/task-card';
import { type TaskTab, TaskTabSelector } from './components/task-tab-selector';
import { AppHeader } from '../home/components/app-header';

export default function TasksScreen() {
  const theme = useTheme();
  const authState = useAuthStore();
  const tasksState = useTasksStore();
  const selectedTenant = authState.selectedTenant;

  // Fetch tasks on mount
  useEffect(() => {
    const userId = authState.user?.id;
    const teamId = authState.selectedTeam?.id;

    console.log('Tasks screen - userId:', userId, 'teamId:', teamId);

    if (userId && teamId) {
      console.log('Fetching tasks with params:', {
        assigneeId: userId,
        teamId,
      });
      tasksState.actions.fetchTasks({
        assigneeId: userId,
        teamId: teamId,
      });
    } else {
      console.log('Missing userId or teamId, not fetching tasks');
    }
  }, [authState.user?.id, authState.selectedTeam?.id]);

  const handleRefresh = () => {
    const userId = authState.user?.id;
    const teamId = authState.selectedTeam?.id;

    if (userId && teamId) {
      tasksState.actions.fetchTasks({
        assigneeId: userId,
        teamId: teamId,
      });
    }
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  const renderTaskSection = (title: string, tasks: any[], showCount = true) => {
    if (tasks.length === 0) return null;

    return (
      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
        >
          <Text
            variant="h4"
            style={{
              color: theme.colors.text.primary,
            }}
          >
            {title}
            {showCount && ` (${tasks.length})`}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => handleTaskPress(task.id)}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (tasksState.isLoading) {
      return (
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
            }}
          >
            Loading tasks...
          </Text>
        </Center>
      );
    }

    const allTasks = tasksState.tasks;
    const pendingTasks = allTasks.filter(
      (task) => !task.status || task.status !== 'completed'
    );
    const completedTasks = allTasks.filter(
      (task) => task.status === 'completed'
    );

    if (allTasks.length === 0) {
      return (
        <Center style={{ flex: 1 }}>
          <Text
            variant="h3"
            style={{
              color: theme.colors.text.primary,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            No Tasks Yet
          </Text>
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Tasks will appear here when created
          </Text>
        </Center>
      );
    }

    // Render based on active tab
    switch (tasksState.activeTab) {
      case 'pending':
        if (pendingTasks.length === 0) {
          return (
            <Center style={{ flex: 1 }}>
              <Text
                variant="body"
                style={{
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                No pending tasks
              </Text>
            </Center>
          );
        }
        return (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={tasksState.isLoading}
                onRefresh={handleRefresh}
              />
            }
          >
            {renderTaskSection('Pending Tasks', pendingTasks, false)}
          </ScrollView>
        );

      case 'completed':
        if (completedTasks.length === 0) {
          return (
            <Center style={{ flex: 1 }}>
              <Text
                variant="body"
                style={{
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                No completed tasks
              </Text>
            </Center>
          );
        }
        return (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={tasksState.isLoading}
                onRefresh={handleRefresh}
              />
            }
          >
            {renderTaskSection('Completed Tasks', completedTasks, false)}
          </ScrollView>
        );

      case 'all':
      default:
        return (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={tasksState.isLoading}
                onRefresh={handleRefresh}
              />
            }
          >
            {renderTaskSection('Pending Tasks', pendingTasks)}
            {renderTaskSection('Completed Tasks', completedTasks)}
          </ScrollView>
        );
    }
  };

  return (
    <Background>
      <AppHeader title={'Tasks'} />

      {/* Tab Selector */}
      <TaskTabSelector
        activeTab={tasksState.activeTab}
        onTabChange={tasksState.actions.setActiveTab}
        pendingCount={
          tasksState.tasks.filter(
            (task) => !task.status || task.status !== 'completed'
          ).length
        }
        completedCount={
          tasksState.tasks.filter((task) => task.status === 'completed').length
        }
      />

      {/* Content */}
      {renderContent()}
    </Background>
  );
}
