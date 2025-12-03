import { iconNames } from '@assets/icons';
import { RelativePathString, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Avatar, Background, Icon, Text, View } from '@/components';
import { BatteryIcon } from '@/components/battery-icon';
import { useModal } from '@/components/modal';
import { NetworkSignalIcon } from '@/components/network-signal-icon';
import { FontFamilies } from '@/lib/fonts';
import { useUsersStore } from '@/stores/users';
import { useMapStore } from '@/stores/map';
import { useTheme } from '@/theme';
import type { User } from '@/types';

import { MemberDetailModal } from './components/member-detail-modal';

export function MembersScreen(): React.JSX.Element {
  const users = useUsersStore((state) => state.users);
  const isLoading = useUsersStore((state) => state.isLoading);
  const error = useUsersStore((state) => state.error);
  const setMapFocusUserId = useMapStore((state) => state.actions.setMapFocusUserId);
  const setFlatViewFocusUserId = useMapStore((state) => state.actions.setFlatViewFocusUserId);
  const theme = useTheme();
  const { ref, present } = useModal();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();
  const flatViewFocusUserId = useMapStore((state) => state.flatViewFocusUserId);

  // Temp skip fetch because it will override the value from socket
  // useEffect(() => {
  //   if (teamId) {
  //     usersState.actions.fetchTeamMembers(teamId);
  //   }
  // }, [teamId]);

  // Show member details when focused from map
  useEffect(() => {
    if (flatViewFocusUserId) {
      const focusedUser = users.find(
        (user) => user.id === flatViewFocusUserId
      );
      if (focusedUser) {
        setSelectedUser(focusedUser);
        present();
        setFlatViewFocusUserId(null);
      }
    }
  }, [flatViewFocusUserId]);

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

    users.forEach((user) => {
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
  }, [users]);

  const handleViewRoles = (user: User) => {
    setSelectedUser(user);
    present();
  };

  const handleMapFocus = (userId: string) => {
    router.dismissTo('/(app)/map' as RelativePathString);
    setMapFocusUserId(userId);
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
                fileId={user.avatarId}
                status={user.status || 'unknown'}
              />
              {/* Status indicator */}
            </View>

            <View style={styles.userNameContainer}>
              <Text variant="h4" style={styles.userName}>
                {user.fullName || user.username}
              </Text>
              <View style={styles.iconContainer}>
                <View style={styles.iconItem}>
                  <NetworkSignalIcon
                    networkMbps={user.attributes?.networkMbps}
                    size={18}
                    color={theme.colors.text.icon}
                  />
                  <BatteryIcon
                    batteryPercentage={user.attributes?.batteryPercentage}
                    size={28}
                    outlineColor={theme.colors.text.icon}
                  />
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleMapFocus(user.id)}
                  >
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
    <Background>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && users.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="body" style={styles.loadingText}>
                Loading members...
              </Text>
            </View>
          ) : users.length === 0 ? (
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
                .filter(([groupName]) => groupName === 'Members')
                .map(([groupName, users]) =>
                  renderGroupSection('Members', users)
                )}

              {Object.entries(groupedUsers)
                .filter(([groupName]) => groupName === 'Responder')
                .map(([groupName, users]) =>
                  renderGroupSection('Responder', users)
                )}
            </>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text variant="body" style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}
        </ScrollView>
        <MemberDetailModal ref={ref} user={selectedUser} />
      </View>
    </Background>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      borderWidth: 2,
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
      borderWidth: 2,
      borderColor: theme.colors.surface.border,
    },
    statusIndicator: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 2,
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
      borderWidth: 2,
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
