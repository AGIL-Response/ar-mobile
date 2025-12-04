/**
 * Chat Rooms List Screen
 * Displays list of chat rooms/conversations
 */

import React, { useEffect, useState, useMemo } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Background, View } from '@/components';
import { useTheme } from '@/theme';
import { chatService } from '@/services/chat';
import { RoomCard } from './components';
import type { ChatRoom } from '@/services/chat';
import { useRouter } from 'expo-router';
import { useObservable } from '@/lib/hooks/use-observable';
import { AppHeader } from '@/screens/home/components/app-header';

export default function ChatRoomsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Memoize the observable to prevent recreation on every render
  const observableRooms = useMemo(() => chatService.observeRooms(), []);
  const rooms = useObservable(observableRooms, []) || [];

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await chatService.initialize();
      } catch (error) {
        console.error('Failed to initialize chat:', error);
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
    try {
      await chatService.syncRooms();
    } catch (error) {
      console.error('Failed to refresh rooms:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRoomPress = (room: ChatRoom) => {
    router.push(`/chat/${room.id}`);
  };

  return (
    <Background>
      <AppHeader title="Chat" />
      <View style={{ flex: 1 }}>
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard room={item} onPress={handleRoomPress} />
          )}
          contentContainerStyle={{
            paddingBottom: theme.spacing.gap.md,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            !isInitializing ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: theme.spacing.gap.xl * 2,
                }}
              >
                {/* TODO: Add empty state component */}
              </View>
            ) : null
          }
        />
      </View>
    </Background>
  );
}

