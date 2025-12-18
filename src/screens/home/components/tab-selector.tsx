/**
 * Tab Selector Component
 * Flat View / Map View toggle
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';

interface TabSelectorProps {
  activeTab: 'flat' | 'map';
  onTabChange: (tab: 'flat' | 'map') => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  const theme = useTheme();
  const styles = createStyles(theme, activeTab);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('flat')}>
        <Text variant="label" style={styles.tabTextFlat}>
          Flat View
        </Text>
        <View style={styles.indicatorFlat} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('map')}>
        <Text variant="label" style={styles.tabTextMap}>
          Map View
        </Text>
        <View style={styles.indicatorMap} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme, activeTab: 'flat' | 'map') =>
  StyleSheet.create({
    container: {
      height: 56,
      backgroundColor: theme.colors.background.primary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tab: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    tabTextFlat: {
      color: activeTab === 'flat' ? theme.colors.text.primary : theme.colors.text.tertiary,
      textAlign: 'center',
    },
    tabTextMap: {
      color: activeTab === 'map' ? theme.colors.text.primary : theme.colors.text.tertiary,
      textAlign: 'center',
    },
    indicatorFlat: {
      position: 'absolute',
      bottom: 0,
      height: 2,
      width: '100%',
      backgroundColor: activeTab === 'flat' ? theme.colors.text.primary : theme.colors.text.muted,
    },
    indicatorMap: {
      position: 'absolute',
      bottom: 0,
      height: 2,
      width: '100%',
      backgroundColor: activeTab === 'map' ? theme.colors.text.primary : theme.colors.text.muted,
    },
  });
