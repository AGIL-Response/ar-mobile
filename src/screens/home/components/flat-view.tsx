/**
 * Flat View Component
 * Contains Members and Incidents sections for the flat view tab
 */

import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { TasksSection } from './tasks-section';
import { MembersSection } from './members-section';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/theme';
import { View, Text } from '@/components';
import { RelativePathString, router } from 'expo-router';

export function FlatView() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const selectedTeamName = useAuthStore((state) => state.selectedTeam?.name || '');
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 16,
        gap: 20,
        paddingBottom: 100, // Extra space for FAB
      }}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.headerRow}>
        <Text variant="h3" style={styles.teamTitle}>
          {selectedTeamName}
        </Text>

        <TouchableOpacity
          onPress={() => {
            router.navigate('/(app)/map' as RelativePathString);
          }}
          activeOpacity={0.8}
        >
          <Text variant="bodySmall" style={styles.viewMapText}>
            View Map
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Members Section */}
      <MembersSection />

      {/* Tasks Section */}
      <TasksSection />
    </ScrollView>
  );
}
const createStyles = (theme: any) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    teamTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.goldmanRegular,
      flex: 1,
      marginRight: 12,
    },
    viewMapText: {
      color: theme.colors.text.quaternary,
      borderColor: theme.colors.button.borderPrimary,
      backgroundColor: theme.colors.button.ghost,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 2,
      borderWidth: 1,
    },
  });