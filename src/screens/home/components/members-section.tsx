import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar, Text, View } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { useTheme } from '@/theme';
import type { User } from '@/types';
import { FontFamilies } from '@/lib/fonts';

export function MembersSection(): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();
  const authState = useAuthStore();
  const usersState = useUsersStore();
  const styles = createStyles(theme);

  const tenantId = authState.selectedTenant?.id;

  useEffect(() => {
    if (tenantId) {
      usersState.actions.fetchUsers(tenantId);
    }
  }, [tenantId]);

  const displayUsers = usersState.users.slice(0, 4);
  const hasMore = usersState.users.length > 4;
  const moreCount = usersState.users.length - 4;

  const handleViewAll = () => {
    router.push('/members');
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
        <Text variant="h3" style={styles.title}>
          Members
        </Text>
        <Text variant="body" style={styles.loadingText}>
          Loading members...
        </Text>
      </View>
    );
  }

  if (usersState.users.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="h3" style={styles.title}>
          Members
        </Text>
        <Text variant="body" style={styles.loadingText}>
          No members found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="body" style={styles.title}>
          Members
        </Text>
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
              />
              <View style={styles.statusIndicator} />
            </View>
          </View>
        ))}

        {hasMore && (
          <TouchableOpacity onPress={handleViewAll}>
            <View style={styles.moreContainer}>
              <View style={styles.moreCircle}>
                <Text
                  variant="body"
                  font={FontFamilies.interBold}
                  style={styles.moreText}
                >
                  +{moreCount}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      // padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
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
      borderWidth: 1,
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
      backgroundColor: theme.colors.text.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    moreText: {
      color: theme.colors.background.primary,
      textAlign: 'center',
    },
  });
