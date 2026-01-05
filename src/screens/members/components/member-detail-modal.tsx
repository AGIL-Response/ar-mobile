import React from 'react';
import { StyleSheet } from 'react-native';
import { Modal } from '@/components/modal';
import { Text, View } from '@/components';
import type { User } from '@/types';
import { Theme, useTheme } from '@/theme';

type Props = {
  user: User | null;
}

export const MemberDetailModal = React.forwardRef<any, Props>(({ user }, ref) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal ref={ref}>
      <View style={styles.content}>
        {!user ? (
          <Text variant="body" style={styles.emptyText}>
            No member selected
          </Text>
        ) : (
          <>
            {/* Basic Info */}
            <Text variant="h4" style={styles.sectionTitle}>
              Basic Info
            </Text>
            <View style={styles.item}>
              <Text variant="body" style={styles.label}>
                Full Name:
              </Text>
              <Text variant="body">{user.fullName || 'N/A'}</Text>
            </View>
            <View style={styles.item}>
              <Text variant="body" style={styles.label}>
                Username:
              </Text>
              <Text variant="body">{user.username || 'N/A'}</Text>
            </View>
            <View style={styles.item}>
              <Text variant="body" style={styles.label}>
                Email:
              </Text>
              <Text variant="body">{user.email || 'N/A'}</Text>
            </View>
            <View style={styles.item}>
              <Text variant="body" style={styles.label}>
                Email Verified:
              </Text>
              <Text variant="body">{user.emailVerified ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.item}>
              <Text variant="body" style={styles.label}>
                Enabled:
              </Text>
              <Text variant="body">{user.enabled ? 'Active' : 'Disabled'}</Text>
            </View>
            {user.createdAt && (
              <View style={styles.item}>
                <Text variant="body" style={styles.label}>
                  Created At:
                </Text>
                <Text variant="body">
                  {new Date(user.createdAt).toLocaleString()}
                </Text>
              </View>
            )}

            {/* Roles */}
            <Text variant="h4" style={[styles.sectionTitle, { marginTop: 16 }]}>
              Roles
            </Text>
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role, index) => (
                <View key={index} style={styles.roleCard}>
                  <Text variant="body" style={styles.roleName}>
                    {role.displayName || role.name || 'Unknown'}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="body" style={styles.noRoles}>
                No roles assigned
              </Text>
            )}
          </>
        )}
      </View>
    </Modal>
  );
});

// Attach display name for better debugging and satisfying lint rules
MemberDetailModal.displayName = 'MemberDetailModal';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      padding: 16,
    },
    sectionTitle: {
      marginBottom: 8,
      color: theme.colors.text.primary,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    label: {
      color: theme.colors.text.secondary,
    },
    roleCard: {
      marginBottom: 12,
      padding: 8,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.surface.border,
      backgroundColor: theme.colors.surface.card,
    },
    roleName: {
      color: theme.colors.text.primary,
    },
    noRoles: {
      color: theme.colors.text.secondary,
    },
    emptyText: {
      textAlign: 'center',
      padding: 16,
      color: theme.colors.text.secondary,
    },
  });
