import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Avatar, Text, View } from '@/components';
import { Modal, useModal } from '@/components/modal';
import { MembersScreen } from '@/screens/members';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { useMapStore } from '@/stores/map';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import type { User } from '@/types';

export function MembersSection(): React.JSX.Element {
  const theme = useTheme();
  const teamId = useAuthStore((state) => state.selectedTeam?.id);
  const users = useUsersStore((state) => state.users);
  const isLoading = useUsersStore((state) => state.isLoading);
  const fetchTeamMembers = useUsersStore((state) => state.actions.fetchTeamMembers);
  const flatViewFocusUserId = useMapStore((state) => state.flatViewFocusUserId);
  const styles = createStyles(theme);
  const { ref: membersModalRef, present: presentMembers } = useModal();
  useEffect(() => {
    if (teamId) {
      fetchTeamMembers(teamId);
    }
  }, [teamId]);

  // Open members modal when a user is focused from map
  useEffect(() => {
    if (flatViewFocusUserId) {
      presentMembers();
    }
  }, [flatViewFocusUserId]);

  const displayUsers = users.slice(0, 4);

  const handleViewAll = () => {
    presentMembers();
  };

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

  if (isLoading && users.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="caption" style={styles.loadingText}>
          Loading members...
        </Text>
      </View>
    );
  }

  if (users.length === 0) {
    return <></>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleViewAll}>
          <Text variant="caption" style={styles.viewAllText}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarGroup}>
        {displayUsers.map((user) => (
          <View key={user.id} style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Avatar
                size="medium"
                fallback={getInitials(user)}
                style={styles.avatar}
                fileId={user.avatarId}
                status={user.status || 'unknown'}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleViewAll}>
          <View style={styles.moreContainer}>
            <View style={styles.moreCircle}>
              <Text variant="bodySmall" style={styles.moreText}>
                View All
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Members popup modal */}
      <Modal ref={membersModalRef} snapPoints={['88%']} title="Members">
        <MembersScreen />
      </Modal>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: theme.colors.text.primary,
    },
    viewAllText: {
      color: theme.colors.primary,
    },
    loadingText: {
      color: theme.colors.text.secondary,
    },
    avatarGroup: {
      flexDirection: 'row',
      gap: 12,
    },
    avatarContainer: {
      width: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surface.card,
      borderWidth: 2,
      borderColor: theme.colors.surface.border,
    },
    statusIndicator: {
      position: 'absolute',
      width: 15,
      height: 15,
      borderRadius: 7.5,
      backgroundColor: theme.colors.semantic.success,
      borderWidth: 1.7,
      borderColor: theme.colors.background.primary,
      bottom: -2,
      right: -2,
    },
    moreContainer: {
      width: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    moreCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: theme.colors.surface.border,
      backgroundColor: theme.colors.background.input,
      justifyContent: 'center',
      alignItems: 'center',
    },
    moreText: {
      color: theme.colors.text.primary,
      textAlign: 'center',
      fontSize: 10,
    },
  });
