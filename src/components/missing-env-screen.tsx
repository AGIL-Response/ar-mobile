/**
 * MissingEnvScreen
 * Full-screen component shown when required environment variables are missing.
 * Blocks app startup until .env is properly configured.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export interface MissingEnvScreenProps {
  /** List of missing environment variable names */
  missing: string[];
}

export function MissingEnvScreen({ missing }: MissingEnvScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        <Text style={styles.title}>Configuration Error</Text>
        <Text style={styles.subtitle}>
          Missing required environment variables. The app cannot start until these are set.
        </Text>
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Missing variables:</Text>
          {missing.map((name) => (
            <Text key={name} style={styles.listItem}>
              • {name}
            </Text>
          ))}
        </View>
        <Text style={styles.hint}>
          Add them to your .env file (e.g. .env.dev or .env.prod) and restart the app.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  listContainer: {
    alignSelf: 'stretch',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 15,
    color: '#7f1d1d',
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
