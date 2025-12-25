import React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';
import type { User } from '@/types';

type Props = {
  users: User[];
};

export function MemberStats({ users }: Props): React.JSX.Element {
  const theme = useTheme();
  const styles = createStyles(theme);
  const totalUsers = users.length;
  const verifiedUsers = users.filter(user => user.emailVerified).length;
  const enabledUsers = users.filter(user => user.enabled).length;

  return (
    <View style={styles.container}>
      <View style={[styles.statCard, styles.firstCard]}>
        <Text variant="caption" style={styles.label}>
          Total Users
        </Text>
        <Text variant="h2" style={styles.totalValue}>
          {totalUsers}
        </Text>
      </View>
      
      <View style={[styles.statCard, styles.middleCard]}>
        <Text variant="caption" style={styles.label}>
          Verified
        </Text>
        <Text variant="h2" style={styles.successValue}>
          {verifiedUsers}
        </Text>
      </View>
      
      <View style={[styles.statCard, styles.lastCard]}>
        <Text variant="caption" style={styles.label}>
          Enabled
        </Text>
        <Text variant="h2" style={styles.primaryValue}>
          {enabledUsers}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface.card,
  },
  firstCard: {
    marginRight: 8,
  },
  middleCard: {
    marginHorizontal: 4,
  },
  lastCard: {
    marginLeft: 8,
  },
  label: {
    color: theme.colors.text.secondary,
  },
  totalValue: {
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  successValue: {
    color: theme.colors.semantic.success,
    marginTop: 2,
  },
  primaryValue: {
    color: theme.colors.primary,
    marginTop: 2,
  },
});
