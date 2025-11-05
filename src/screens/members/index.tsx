import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { AppBar, Avatar, Icon, Text, View } from '@/components';
import icons, { iconNames } from '@assets/icons';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { useTheme } from '@/theme';
import type { User } from '@/types';
import { Modal, useModal } from '@/components/modal';
import { MemberDetailModal } from './components/member-detail-modal';

export function MembersScreen(): React.JSX.Element {
  const router = useRouter();
  const authState = useAuthStore();
  const usersState = useUsersStore();
  const theme = useTheme();
  const { ref, present } = useModal();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const teamId = authState.selectedTeam?.id;

  useEffect(() => {
    if (teamId) {
      usersState.actions.fetchTeamMembers(teamId);
    }
  }, [teamId]);

  const getInitials = (user: User) => {
    if (user.fullName) {
      return user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.username?.charAt(0)?.toUpperCase() || 'U';
  };

  // Helper function to get display name for role
  const getRoleDisplayName = (role: any) => {
    if (!role) return 'Unknown';
    return role.displayName || role.name || 'Unknown';
  };

  // Group users by role
  const groupedUsers = useMemo(() => {
    const groups: { [key: string]: User[] } = {};

    usersState.users.forEach((user) => {
      if (user.roles && user.roles.length > 0) {
        // Use the last role for grouping
        const lastRole = user.roles[user.roles.length - 1];
        const roleDisplayName = getRoleDisplayName(lastRole);
        if (!groups[roleDisplayName]) {
          groups[roleDisplayName] = [];
        }
        groups[roleDisplayName].push(user);
      } else {
        // Users without roles go to "Members" group
        if (!groups['Members']) {
          groups['Members'] = [];
        }
        groups['Members'].push(user);
      }
    });

    return groups;
  }, [usersState.users]);

  const handleViewRoles = (user: User) => {
    setSelectedUser(user);
    present();
  };

  const renderUserCard = (user: User) => {
    const styles = createStyles(theme);

    return (
      <TouchableOpacity key={user.id} onPress={() => handleViewRoles(user)}>
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Avatar
                size="small"
                fallback={getInitials(user)}
                style={styles.avatar}
              />
              {/* Status indicator */}
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: user.enabled
                      ? theme.colors.semantic.success
                      : theme.colors.surface.disabled,
                  },
                ]}
              />
            </View>
            <Text variant="body" style={styles.userName}>
              {user.fullName || user.username}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupSection = (groupName: string, users: User[]) => {
    const styles = createStyles(theme);

    return (
      <View key={groupName} style={styles.groupSection}>
        <Text variant="h4" style={styles.groupTitle}>
          {groupName}
        </Text>
        <View style={styles.cardContainer}>{users.map(renderUserCard)}</View>
      </View>
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <AppBar
        title="Members"
        titleAlign="left"
        showBackButton={true}
        onBackPress={() => router.back()}
        safeArea
        style={{ borderBottomWidth: 0 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {usersState.isLoading && usersState.users.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="body" style={styles.loadingText}>
              Loading members...
            </Text>
          </View>
        ) : usersState.users.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="h3" style={styles.noMembersText}>
              No members found
            </Text>
          </View>
        ) : (
          <>
            {/* Render groups in order: Commander first, then others */}
            {Object.keys(groupedUsers).includes('Commander') &&
              renderGroupSection('Commander', groupedUsers['Commander'])}

            {Object.entries(groupedUsers)
              .filter(([groupName]) => groupName !== 'Commander')
              .map(([groupName, users]) =>
                renderGroupSection(groupName, users)
              )}
          </>
        )}

        {usersState.error && (
          <View style={styles.errorContainer}>
            <Text variant="body" style={styles.errorText}>
              {usersState.error}
            </Text>
          </View>
        )}
      </ScrollView>
      <MemberDetailModal ref={ref} user={selectedUser} />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
      paddingTop: 4,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    },
    loadingText: {
      color: theme.colors.text.secondary,
    },
    noMembersText: {
      color: theme.colors.text.secondary,
    },
    errorContainer: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: theme.colors.semantic.errorBackground,
    },
    errorText: {
      color: theme.colors.semantic.error,
    },
    groupSection: {
      marginBottom: 32,
    },
    groupTitle: {
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    cardContainer: {
      gap: 16,
      backgroundColor: theme.colors.surface.card,
      borderWidth: 1,
      borderColor: theme.colors.surface.border,
      padding: 12,
      borderRadius: 8,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 4,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      flex: 1,
    },
    avatarContainer: {
      position: 'relative',
      width: 24,
      justifyContent: 'center',
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(209, 209, 209, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(209, 209, 209, 0.05)',
    },
    statusIndicator: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.background.primary,
      bottom: -1,
      right: -1,
    },
    userName: {
      color: theme.colors.text.primary,
    },
    menuIcon: {
      color: theme.colors.text.secondary,
    },
  });
