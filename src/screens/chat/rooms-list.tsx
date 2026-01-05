/**
 * Chat Rooms List Screen
 * Displays list of chat rooms/conversations
 */

import React, { useEffect, useState, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { ActivityIndicator, Background, Button, Center, Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import { chatService } from '@/services/chat';
import { RoomCard } from './components';
import type { ChatRoom } from '@/services/chat';
import { RelativePathString, useRouter } from 'expo-router';
import { useObservable } from '@/lib/hooks/use-observable';
import { AppHeader } from '@/screens/home/components/app-header';

export default function ChatRoomsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const styles = createStyles(theme);

  // Memoize the observable to prevent recreation on every render
  const observableRooms = useMemo(() => chatService.observeRooms(), []);
  const roomsObservableResult = useObservable(observableRooms, []) || [];
  
  // Deduplicate rooms by id as a safety measure (should already be deduplicated in observeRooms)
  const rooms = useMemo(() => {
    const roomMap = new Map<string, ChatRoom>();
    for (const room of roomsObservableResult) {
      if (!roomMap.has(room.id)) {
        roomMap.set(room.id, room);
      }
    }
    return Array.from(roomMap.values());
  }, [roomsObservableResult]);

  useEffect(() => {
    const initializeChat = async () => {
      setError(null);
      try {
        await chatService.initialize();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
        console.error('Failed to initialize chat:', err);
        setError(errorMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();

    return () => {
      // Cleanup on unmount
      chatService.disconnect();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await chatService.syncRooms();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh rooms';
      console.error('Failed to refresh rooms:', err);
      setError(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      await chatService.initialize();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
      console.error('Failed to initialize chat:', err);
      setError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleRoomPress = (room: ChatRoom) => {
    router.push(`/chat/${room.id}` as RelativePathString);
  };

  // Show loading state
  if (isInitializing) {
    return (
      <Background>
        <AppHeader />
        <Center style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" style={styles.loadingText}>
            Loading chat rooms...
          </Text>
        </Center>
      </Background>
    );
  }

  // Show error state
  if (error && rooms.length === 0) {
    return (
      <Background>
        <AppHeader />
        <Center style={styles.errorContainer}>
          <Text variant="h3" style={styles.errorTitle}>
            Unable to load chat rooms
          </Text>
          <Text variant="body" style={styles.errorText}>
            {error}
          </Text>
          <Button
            variant="solid"
            size="medium"
            title="Retry"
            onPress={handleRetry}
            colorVariant="primary"
            style={styles.retryButton}
          />
        </Center>
      </Background>
    );
  }

  return (
    <Background>
      <AppHeader />
      <View style={styles.container}>
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard room={item} onPress={handleRoomPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <Center style={styles.emptyContainer}>
              <Text variant="h3" style={styles.emptyTitle}>
                No chat rooms
              </Text>
              <Text variant="body" style={styles.emptyText}>
                Start a conversation to see it here
              </Text>
            </Center>
          }
        />
        {error && rooms.length > 0 && (
          <View style={styles.errorBanner}>
            <Text variant="caption" style={styles.errorBannerText}>
              {error}
            </Text>
          </View>
        )}
      </View>
    </Background>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingBottom: theme.spacing.gap.md,
    },
    loadingContainer: {
      flex: 1,
      gap: theme.spacing.gap.md,
    },
    loadingText: {
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.gap.md,
    },
    errorContainer: {
      flex: 1,
      padding: theme.spacing.gap.xl,
      gap: theme.spacing.gap.md,
    },
    errorTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.gap.sm,
    },
    errorText: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.gap.md,
    },
    retryButton: {
      marginTop: theme.spacing.gap.md,
    },
    emptyContainer: {
      flex: 1,
      paddingTop: theme.spacing.gap.xl * 2,
      gap: theme.spacing.gap.sm,
    },
    emptyTitle: {
      color: theme.colors.text.primary,
    },
    emptyText: {
      color: theme.colors.text.secondary,
    },
    errorBanner: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.semantic.errorBackground,
      padding: theme.spacing.gap.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.semantic.error,
    },
    errorBannerText: {
      color: theme.colors.semantic.error,
      textAlign: 'center',
    },
  });
