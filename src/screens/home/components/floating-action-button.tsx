/**
 * Floating Action Button Component
 * Main action button for creating new items
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon, iconNames } from '@/components';
import { Palette, type Theme, useTheme } from '@/theme';

export function FloatingActionButton() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);

  const handlePress = () => {
    // Navigate to create incident screen (location permission will be handled there)
    router.navigate('/incidents/create');
  };
  
  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Icon
        name={iconNames.plus}
        size={24}
        color={Palette.white}
      />
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      position: 'absolute',
      bottom: 24,
      right: 16,
      width: 56,
      height: 56,
      backgroundColor: Palette.primary,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
  });
