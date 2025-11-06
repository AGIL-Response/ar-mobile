import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { AppBar, Avatar, Icon, Text, View } from '@/components';
import icons, { iconNames } from '@assets/icons';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { useTheme } from '@/theme';
import type { User } from '@/types';
import { Modal, useModal } from '@/components/modal';
import { MemberDetailModal } from './components/member-detail-modal';
import { X } from '@/components/icons';
import { FontFamilies } from '@/lib/fonts';

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
                size="xl"
                fallback={getInitials(user)}
                style={styles.avatar}
              />
              {/* Status indicator */}

            </View>

            <View style={styles.userNameContainer}>
              <Text variant="h4" style={styles.userName}>
                {user.fullName || user.username}
              </Text>
              <View style={styles.iconContainer}>
                <View style={styles.iconItem}>
                  <Icon
                    name={iconNames.mobile_signal}
                    size={18}
                    color={theme.colors.text.icon}
                  />
                  <Icon
                    name={iconNames.battery}
                    size={28}
                    color={theme.colors.text.icon}
                  />
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Icon
                      name={iconNames.location}
                      size={18}
                      color={theme.colors.text.icon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Icon
                      name={iconNames.message_dots_square}
                      size={18}
                      color={theme.colors.text.icon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupSection = (groupName: string, users: User[]) => {
    const styles = createStyles(theme);

    return (
      <View key={groupName} style={styles.groupSection}>
        <Text variant="bodyMedium" style={styles.groupTitle}>
          {groupName}
        </Text>
        <View style={styles.cardContainer}>{users.map(renderUserCard)}</View>
      </View>
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>

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
                renderGroupSection('Members', users)
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
    header: {
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.secondary,
    },
    title: {
      fontFamily: FontFamilies.goldmanRegular,
    },
    closeButton: {
      width: 28,
      alignItems: 'center',
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
      marginBottom: 8,
    },
    cardContainer: {
      gap: 12,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      borderRadius: 8,
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 1,
      borderColor: theme.colors.surface.border,
      height: 80,
      maxHeight: 80,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      flex: 1,
    },
    avatarContainer: {
      position: 'relative',
      width: 48,
      height: 48,
      justifyContent: 'center',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
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
      fontFamily: FontFamilies.goldmanRegular,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    actionBtn: {
      width: 28,
      height: 28,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.surface.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.overlay,
    },
    menuIcon: {
      color: theme.colors.text.secondary,
    },
    userNameContainer: {
      flex: 1,
    },
    iconContainer: {
      flexDirection: 'row',
      gap: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconItem: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
  });
