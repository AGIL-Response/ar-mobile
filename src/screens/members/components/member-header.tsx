import React from 'react';

import { SearchInput, Text, View } from '@/components';
import { useTheme } from '@/theme';

type Props = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function MemberHeader({ searchQuery, onSearchChange }: Props): React.JSX.Element {
  const theme = useTheme();
  
  return (
    <View className="px-4 pt-4 pb-2">
      <Text variant="h1" style={{ color: theme.colors.text.primary, marginBottom: 4 }}>
        Members
      </Text>
      <Text variant="body" style={{ color: theme.colors.text.secondary, marginBottom: 16 }}>
        View and manage all system users and their permissions
      </Text>
      
      <SearchInput
        placeholder="Search by name, email, or username..."
        value={searchQuery}
        onChangeText={onSearchChange}
      />
    </View>
  );
}
