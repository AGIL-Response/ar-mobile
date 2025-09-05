import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Avatar, Badge, Text, View } from '@/components';
import { useTheme } from '@/theme';
import type { User } from '@/types';

type Props = {
  user: User;
  onLoadRoles: () => void;
};

export function MemberCard({ user, onLoadRoles }: Props): React.JSX.Element {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  const getInitials = (fullName: string, username: string) => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return username?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <TouchableOpacity
      onPress={onLoadRoles}
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.mainContent}>
        <Avatar 
          size="medium"
          fallback={getInitials(user.fullName, user.username)}
        />
        
        <View style={styles.userInfo}>
          <Text variant="h3" style={styles.userName}>
            {user.fullName || user.username || 'Unknown User'}
          </Text>
          <Text variant="body" style={styles.username}>
            @{user.username}
          </Text>
          <Text variant="caption" style={styles.email}>
            {user.email}
          </Text>
        </View>
        
        <View style={styles.badgeContainer}>
          <View style={styles.badgeRow}>
            <Badge 
              variant="soft"
              colorVariant={user.enabled ? 'success' : 'error'}
              label={user.enabled ? 'Active' : 'Inactive'}
            />
          </View>
          
          <View style={styles.badgeRow}>
            <Badge 
              variant="soft"
              colorVariant={user.emailVerified ? 'success' : 'warning'}
              label={user.emailVerified ? 'Verified' : 'Unverified'}
            />
          </View>
        </View>
      </View>
      
      {user.roles && user.roles.length > 0 && (
        <View style={styles.rolesSection}>
          <Text variant="caption" style={styles.rolesLabel}>
            Roles
          </Text>
          <View style={styles.rolesContainer}>
            {user.roles.slice(0, 3).map((role) => (
              <Badge 
                key={role.id}
                variant="outline"
                colorVariant="primary"
                label={role.name}
              />
            ))}
            {user.roles.length > 3 && (
              <Badge 
                variant="outline"
                colorVariant="neutral"
                label={`+${user.roles.length - 3} more`}
              />
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.surface.border,
    borderWidth: 1,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: theme.colors.text.primary,
  },
  username: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  email: {
    color: theme.colors.text.muted,
    marginTop: 1,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  rolesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: theme.colors.surface.border,
    borderTopWidth: 1,
  },
  rolesLabel: {
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});
