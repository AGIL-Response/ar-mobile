/**
 * Task Tab Selector Component
 * Tab selector for task filtering (All, Pending, Completed)
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';

export type TaskTab = 'all' | 'pending' | 'completed';

interface TaskTabSelectorProps {
  activeTab: TaskTab;
  onTabChange: (tab: TaskTab) => void;
  pendingCount?: number;
  completedCount?: number;
}

export function TaskTabSelector({
  activeTab,
  onTabChange,
  pendingCount = 0,
  completedCount = 0,
}: TaskTabSelectorProps) {
  const theme = useTheme();
  const styles = createStyles(theme, activeTab);

  const tabs = [
    {
      key: 'all' as TaskTab,
      label: 'All',
      count: pendingCount + completedCount,
    },
    { key: 'pending' as TaskTab, label: 'Pending', count: pendingCount },
    { key: 'completed' as TaskTab, label: 'Completed', count: completedCount },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab(isActive)}
            onPress={() => onTabChange(tab.key)}
            testID={`tab-${tab.key}`}
          >
            <View style={styles.tabContent}>
              <Text variant="bodyMedium" style={styles.tabText(isActive)}>
                {tab.label}
              </Text>

              {tab.count > 0 && tab.key !== 'all' && (
                <Text variant="bodyMedium" style={styles.tabCount(isActive)}>
                  ({tab.count})
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme, activeTab: TaskTab) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface.border,
      marginBottom: 16,
      backgroundColor: theme.colors.background.primary,
    },
    tab: (isActive: boolean) => ({
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: isActive ? 2 : 0,
      borderBottomColor: isActive ? theme.colors.primary : 'transparent',
    }),
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tabText: (isActive: boolean) => ({
      color: isActive ? theme.colors.text.tertiary : theme.colors.text.inactive,
      fontWeight: isActive ? '600' : '500',
      fontSize: 14,
    }),
    tabCount: (isActive: boolean) => ({
      color: isActive ? theme.colors.text.tertiary : theme.colors.text.inactive,
      fontWeight: isActive ? '600' : '500',
      fontSize: 14,
      marginLeft: 4,
    }),
  });
