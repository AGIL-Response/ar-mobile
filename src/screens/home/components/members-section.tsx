import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar, Text, View } from '@/components';
import { Modal, useModal } from '@/components/modal';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { useTheme } from '@/theme';
import type { User } from '@/types';
import { FontFamilies } from '@/lib/fonts';
import { MembersScreen } from '@/screens/members';

export function MembersSection(): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();
  const authState = useAuthStore();
  const usersState = useUsersStore();
  const styles = createStyles(theme);
  const { ref: membersModalRef, present: presentMembers } = useModal();

  const teamId = authState.selectedTeam?.id;

  useEffect(() => {
    if (teamId) {
      usersState.actions.fetchTeamMembers(teamId);
    }
  }, [teamId]);

  const displayUsers = usersState.users.slice(0, 4);
  const hasMore = usersState.users.length > 1;
  const moreCount = usersState.users.length - 1;

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

  if (usersState.isLoading && usersState.users.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="caption" style={styles.loadingText}>
          Loading members...
        </Text>
      </View>
    );
  }

  if (usersState.users.length === 0) {
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
              />
            </View>
          </View>
        ))}

        {hasMore && (
          <TouchableOpacity onPress={handleViewAll}>
            <View style={styles.moreContainer}>
              <View style={styles.moreCircle}>
                <Text variant="bodyMedium" style={styles.moreText}>
                  +{moreCount}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Members popup modal */}
      <Modal ref={membersModalRef} snapPoints={['88%']} title="Members">
        <MembersScreen />
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) =>
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
    },
  });
