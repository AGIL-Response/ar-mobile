/**
 * Chat Room Screen
 * Individual chat room/conversation view
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Background, View, Text } from '@/components';
import { useTheme } from '@/theme';
import { chatService } from '@/services/chat';
import { Message, Composer } from './components';
import type { ChatMessage, ChatRoom, SendMessageData } from '@/services/chat';
import { useObservable } from '@/lib/hooks/use-observable';
import { AppHeader } from '@/screens/home/components/app-header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatRoomScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ roomId: string | string[] }>();
  const rawRoomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  // Normalize roomId - ensure it's a valid non-empty string
  const roomId = rawRoomId && typeof rawRoomId === 'string' && rawRoomId.trim() !== ''
    ? rawRoomId.trim()
    : undefined;

  const [replyTo, setReplyTo] = useState<{ messageId: string; content: string } | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Memoize observables to prevent recreation on every render
  // Only create observables if roomId is a valid non-empty string
  const observableRoom = useMemo(() => {
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return null;
    }
    try {
      return chatService.observeRoom(roomId);
    } catch (error) {
      console.error('Error creating room observable:', error, { roomId });
      return null;
    }
  }, [roomId]);
  const room = useObservable(observableRoom, null);

  const observableMessages = useMemo(() => {
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return null;
    }
    try {
      return chatService.observeMessages(roomId, 100);
    } catch (error) {
      console.error('❌ [RoomScreen] Error creating messages observable:', error, { roomId });
      return null;
    }
  }, [roomId]);
  const messagesObservableResult = useObservable(observableMessages, []);
  const messages = useMemo(() => messagesObservableResult || [], [messagesObservableResult]);

  // Memoize messages length to prevent unnecessary re-renders
  const messagesLength = useMemo(() => messages.length, [messages.length]);

  // Auto-scroll to bottom when messages change (only if user hasn't scrolled up)
  useEffect(() => {
    if (messagesLength > 0 && shouldAutoScroll) {
      const timeoutId = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messagesLength, shouldAutoScroll]);

  // Load more messages (older messages)
  const handleLoadMore = useCallback(async () => {
    if (!roomId || isLoadingMore || messagesLength === 0) return;

    setIsLoadingMore(true);
    try {
      // Load older messages using the first message ID as the 'before' parameter
      const oldestMessageId = messages[0]?.id;
      if (oldestMessageId) {
        await chatService.syncMessages(roomId, 50, oldestMessageId);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [roomId, isLoadingMore, messagesLength, messages]);

  // Handle scroll events to detect if user scrolled up
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;

    // If user scrolled up more than 100px from bottom, disable auto-scroll
    setShouldAutoScroll(distanceFromBottom < 100);

    // Load more messages when near the top
    if (contentOffset.y < 200 && !isLoadingMore && messagesLength > 0) {
      handleLoadMore();
    }
  }, [isLoadingMore, messagesLength, handleLoadMore]);

  useEffect(() => {
    if (!roomId) {
      router.back();
      return;
    }

    const loadRoomData = async () => {
      try {
        setIsLoading(true);

        // First, get room details to ensure room exists in DB
        chatService.getSocketService().getConversationDetails(roomId);

        // Sync messages from API
        await chatService.syncMessages(roomId, 50);

        // Join room via socket
        chatService.getSocketService().joinRoom(roomId);

        // Mark as read
        await chatService.markAsRead(roomId);
      } catch (error) {
        console.error('❌ [RoomScreen] Failed to load room data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoomData();

    return () => {
      // Leave room on unmount
      if (roomId) {
        chatService.getSocketService().leaveRoom(roomId);
      }
    };
  }, [roomId, router]);

  const handleSend = async (data: Omit<SendMessageData, 'roomId'>) => {
    if (!roomId) return;

    try {
      // Force auto-scroll when sending a message
      setShouldAutoScroll(true);

      await chatService.sendMessage({
        ...data,
        roomId,
      });

      // Clear reply
      setReplyTo(undefined);

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (roomId) {
      chatService.setTyping(roomId, isTyping);
    }
  };

  const handleMessagePress = (message: ChatMessage) => {
    // TODO: Show message options (reply, edit, delete, etc.)
    setReplyTo({
      messageId: message.id,
      content: message.content,
    });
  };

  const handleCancelReply = useCallback(() => {
    setReplyTo(undefined);
  }, []);

  // Memoize room name to prevent recalculation on every render
  const roomName = useMemo(() => {
    if (!room) return 'Chat';
    if (room.type === 'direct' && room.members.length > 0) {
      const otherMember = room.members.find((m) => m.id !== room.members[0]?.id);
      return otherMember?.displayName || otherMember?.username || 'Chat';
    }
    return room.name || 'Chat';
  }, [room]);

  // Memoize content container style
  const contentContainerStyle = useMemo(() => ({
    paddingVertical: theme.spacing.gap.md,
    paddingBottom: theme.spacing.gap.xl,
  }), [theme.spacing.gap.md, theme.spacing.gap.xl]);

  // Helper function to check if two dates are on different days
  const isDifferentDay = (date1: Date, date2: Date): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() !== d2.getTime();
  };

  // Helper function to format date separator text
  const formatDateSeparator = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);
    const messageDateStr = messageDate.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    if (messageDateStr === todayStr) {
      return 'Today';
    } else if (messageDateStr === yesterdayStr) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Memoize render item callback
  const renderItem = useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

    // Show avatar when sender changes or it's the first message
    const showAvatar = !previousMessage || previousMessage.senderId !== item.senderId;

    // Show sender name for group chats when sender changes
    const showSenderName =
      room?.type === 'group' &&
      (!previousMessage || previousMessage.senderId !== item.senderId);

    // Group messages from same sender (compact mode)
    const isGrouped =
      nextMessage?.senderId === item.senderId &&
      new Date(nextMessage.timestamp).getTime() - new Date(item.timestamp).getTime() < 60000; // Within 1 minute

    // Check if we need to show date separator
    const showDateSeparator = !previousMessage || isDifferentDay(previousMessage.timestamp, item.timestamp);
    const dateSeparatorText = showDateSeparator ? formatDateSeparator(item.timestamp) : undefined;

    return (
      <Message
        message={item}
        showAvatar={showAvatar}
        showSenderName={showSenderName}
        compact={!showAvatar && isGrouped}
        showDateSeparator={showDateSeparator}
        dateSeparatorText={dateSeparatorText}
      />
    );
  }, [messages, room?.type]);

  // Memoize onContentSizeChange callback
  const handleContentSizeChange = useCallback(() => {
    if (shouldAutoScroll) {
      flatListRef.current?.scrollToEnd({ animated: false });
    }
  }, [shouldAutoScroll]);

  if (!roomId || (!room && !isLoading)) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <Background>
        <AppHeader title={roomName} showBackButton showRightSection={false} />
        <View style={{ flex: 1, paddingBottom: insets.bottom }}>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={contentContainerStyle}
            inverted={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
            ListHeaderComponent={
              isLoadingMore ? (
                <View
                  style={{
                    paddingVertical: theme.spacing.gap.md,
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.text.secondary,
                      marginTop: theme.spacing.gap.xs,
                    }}
                  >
                    Loading more messages...
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: theme.spacing.gap.xl * 3,
                    paddingHorizontal: theme.spacing.gap.xl,
                  }}
                >
                  <Text
                    variant="h3"
                    style={{
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.gap.sm,
                      textAlign: 'center',
                    }}
                  >
                    💬
                  </Text>
                  <Text
                    variant="h4"
                    style={{
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.gap.xs,
                      textAlign: 'center',
                    }}
                  >
                    No messages yet
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      color: theme.colors.text.secondary,
                      textAlign: 'center',
                    }}
                  >
                    Start the conversation by sending a message
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: theme.spacing.gap.xl * 3,
                  }}
                >
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text
                    variant="body"
                    style={{
                      color: theme.colors.text.secondary,
                      marginTop: theme.spacing.gap.md,
                    }}
                  >
                    Loading messages...
                  </Text>
                </View>
              )
            }
          />

          <Composer
            onSend={handleSend}
            onTyping={handleTyping}
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
          />
        </View>
      </Background>
    </KeyboardAvoidingView>
  );
}

