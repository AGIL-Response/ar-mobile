/**
 * Chat Room Screen
 * Individual chat room/conversation view
 * Refactored following SOLID principles
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { KeyboardAvoidingView, Platform, FlatList, type FlatList as FlatListType } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Background, View, AppBar } from '@/components';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Composer, MediaViewer, MessageListHeader, EmptyState } from './components';
import { useRoomData } from './hooks/use-room-data';
import { useMessages } from './hooks/use-messages';
import { usePagination } from './hooks/use-pagination';
import { useMediaViewer } from './hooks/use-media-viewer';
import { useMessageActions } from './hooks/use-message-actions';
import { useMessageRenderer } from './hooks/use-message-renderer';
import { useInitialMessagesLoading } from './hooks/use-initial-messages-loading';
import { getRoomDisplayName } from './utils/room-name';
import type { ChatMessage, ChatAttachment } from '@/services/chat';
import { useAudioPlayerStore } from '@/stores/audio-player';

export default function ChatRoomScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ roomId: string | string[] }>();

  // Normalize roomId - ensure it's a valid non-empty string
  const rawRoomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const roomId =
    rawRoomId && typeof rawRoomId === 'string' && rawRoomId.trim() !== ''
      ? rawRoomId.trim()
      : undefined;

  // Custom hooks - each with single responsibility
  const { room, isLoading } = useRoomData({ roomId });
  const { messages, messagesRef } = useMessages({ roomId });
  const messagesLength = useMemo(() => messages.length, [messages.length]);
  const { isInitialLoading } = useInitialMessagesLoading({
    roomId,
    messages,
    isLoading,
  });
  // Track if we've done initial scroll to ensure it only happens once
  // Use state instead of ref so component re-renders when it changes
  const [hasScrolledToEnd, setHasScrolledToEnd] = React.useState(false);
  const hasScrolledToEndRef = useRef(false);
  const listRef = useRef<FlatListType<ChatMessage>>(null);
  const previousMessagesLengthRef = useRef(0);
  const loadMoreTriggeredRef = useRef(false);
  const isAtBottomRef = useRef(true); // Track if user is at bottom of list

  const { isLoadingMore, handleLoadMore } = usePagination({
    roomId,
    messages,
    messagesLength,
    isLoading,
    hasScrolledToEndRef,
  });

  const {
    mediaViewerVisible,
    selectedAttachments,
    selectedAttachmentIndex,
    handleAttachmentPress: handleMediaAttachmentPress,
    handleCloseMediaViewer,
  } = useMediaViewer();
  const {
    replyTo,
    handleSend,
    handleTyping,
    handleCancelReply,
  } = useMessageActions({ roomId });
  const stopAudio = useAudioPlayerStore((state) => state.actions.stop);

  // Wrap attachment press to include message context
  const handleAttachmentPress = (message: ChatMessage, attachment: ChatAttachment, index: number) => {
    if (!message.attachments || message.attachments.length === 0) return;
    handleMediaAttachmentPress(message.attachments, index);
  };

  // Message rendering logic
  const { keyExtractor, renderItem } = useMessageRenderer({
    messagesRef,
    room,
    onAttachmentPress: handleAttachmentPress,
  });

  // Memoize room name
  const roomName = useMemo(() => getRoomDisplayName(room), [room]);

  // Memoize content container style
  // With inverted FlatList, padding is applied normally
  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: theme.spacing.gap.xl,
      paddingBottom: theme.spacing.gap.md,
    }),
    [theme.spacing.gap.md, theme.spacing.gap.xl]
  );

  // Reverse messages for inverted FlatList
  // FlatList with inverted=true shows array items from bottom to top
  // So we need [newest, ..., oldest] to show newest at bottom
  const reversedMessages = useMemo(() => {
    return [...messages].reverse();
  }, [messages]);



  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Reset scroll flag when roomId changes
  useEffect(() => {
    hasScrolledToEndRef.current = false;
    setHasScrolledToEnd(false);
    previousMessagesLengthRef.current = 0;
    isAtBottomRef.current = true; // Start at bottom for new room
  }, [roomId]);

  // With inverted FlatList, we don't need initialScrollIndex
  // The list will automatically show the first item (newest) at the bottom

  useEffect(() => {
    if (!isInitialLoading && messages.length > 0 && !hasScrolledToEnd) {
      const timer = setTimeout(() => {
        console.log('[ChatRoom] Marking scroll to end as complete');
        hasScrolledToEndRef.current = true;
        setHasScrolledToEnd(true);
        isAtBottomRef.current = true; // User starts at bottom after initial load
      }, 800);
      return () => clearTimeout(timer);
    } else if (!isInitialLoading && messages.length === 0 && !hasScrolledToEnd) {
      // If no messages, mark as complete immediately (empty state will show)
      hasScrolledToEndRef.current = true;
      setHasScrolledToEnd(true);
      isAtBottomRef.current = true;
    }
  }, [isInitialLoading, messages.length, hasScrolledToEnd]);

  // Show loading overlay until initial load is complete
  // If there are no messages, don't show overlay (empty state will show)
  // Also show overlay when roomId is missing or room is not loaded yet
  const showLoadingOverlay =
    isInitialLoading ||
    !roomId ||
    (!room && !isLoading);

  // Auto-scroll to bottom when new messages arrive (after initial load)
  // Only auto-scroll if user is currently at the bottom of the list
  // With inverted FlatList, scrollToIndex(0) scrolls to the newest message at bottom
  useEffect(() => {
    if (
      !isInitialLoading &&
      hasScrolledToEnd &&
      messages.length > 0 &&
      messages.length > previousMessagesLengthRef.current &&
      isAtBottomRef.current // Only auto-scroll if user is at bottom
    ) {
      // New message(s) arrived and user is at bottom - scroll to bottom (index 0 in reversed array)
      const timer = setTimeout(() => {
        if (listRef.current) {
          try {
            // Scroll to index 0 (newest message) in inverted list
            listRef.current.scrollToIndex({ index: 0, animated: true });
          } catch {
            // If scrollToIndex fails (e.g., item not rendered yet), use scrollToEnd
            // scrollToEnd with inverted scrolls to the "top" which is visually the bottom
            try {
              listRef.current.scrollToEnd({ animated: false });
            } catch {
              // Ignore errors
            }
          }
        }
      }, 100); // Small delay to ensure message is rendered

      previousMessagesLengthRef.current = messages.length;
      return () => clearTimeout(timer);
    } else if (messages.length !== previousMessagesLengthRef.current) {
      // Update ref even if we don't scroll (e.g., during pagination)
      previousMessagesLengthRef.current = messages.length;
    }
  }, [messages.length, isInitialLoading, hasScrolledToEnd]);


  // Calculate keyboard offset accounting for AppBar and safe area
  // AppBar minHeight is 56, plus safe area top inset
  const keyboardVerticalOffset = Platform.OS === 'ios'
    ? (insets.top + 56)
    : 0;

  return (
    <Background>
      <AppBar
        title={roomName}
        showBackButton={true}
        onBackPress={() => router.back()}
        safeArea={true}
        titleAlign="left"
        style={{ borderBottomWidth: 0 }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }} pointerEvents={showLoadingOverlay ? 'none' : 'auto'}>
            <FlatList
              ref={listRef}
              key={`list-${roomId}`}
              data={reversedMessages}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              // Force re-render when messages array reference changes
              extraData={messages.length}
              contentContainerStyle={contentContainerStyle}
              inverted={true}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              // Performance optimizations for variable-sized items
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={15}
              updateCellsBatchingPeriod={50}
              // Pagination: use onScroll to detect when scrolling near top (where older messages are)
              // With inverted={true} and reversed array [newest, ..., oldest]:
              // - Bottom (newest): offsetY is low
              // - Top (oldest): offsetY is high
              // We want to load more when user scrolls up towards the top
              onScroll={(event) => {
                const offsetY = event.nativeEvent.contentOffset.y;

                // Track if user is at bottom (for auto-scroll behavior)
                // With inverted={true}, at bottom means offsetY is low (near 0)
                // Consider "at bottom" if within 100px of bottom
                isAtBottomRef.current = offsetY < 100;

                // Calculate distance from bottom (where newest messages are)
                // With inverted={true} and reversed array [newest, ..., oldest]:
                // - Bottom (newest): offsetY is low (near 0)
                // - Top (oldest): offsetY is high
                // We want to load more when user scrolls up (offsetY increases)
                const threshold = 500; // Trigger when scrolled 500px from bottom (towards top)

                // Only trigger if:
                // 1. We've scrolled up significantly (away from bottom where newest messages are)
                // 2. Initial scroll is complete
                // 3. Not already loading
                // 4. Haven't triggered recently
                if (
                  offsetY > threshold &&
                  hasScrolledToEndRef.current &&
                  !isLoadingMore &&
                  !loadMoreTriggeredRef.current
                ) {
                  loadMoreTriggeredRef.current = true;
                  handleLoadMore();
                  // Reset trigger flag after a delay to prevent rapid firing
                  setTimeout(() => {
                    loadMoreTriggeredRef.current = false;
                  }, 2000);
                }
              }}
              scrollEventThrottle={200}
              // Note: getItemLayout cannot be used with dynamic/variable heights
              // ListFooterComponent appears at top with inverted={true} (where older messages are loaded)
              ListFooterComponent={<MessageListHeader isLoadingMore={isLoadingMore} />}
              ListEmptyComponent={
                // Counter the inversion for empty state
                // Wrap in View with transform to flip it back to normal (inverted FlatList flips everything)
                <View style={{ flex: 1, height: 600, }}>
                  <EmptyState isLoading={isInitialLoading || (messages.length === 0 && isLoading)} />
                </View>
              }
            />
          </View>

          {showLoadingOverlay && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.colors.background.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              pointerEvents="auto"
            >
              <EmptyState isLoading={true} />
            </View>
          )}

          <View style={{ paddingBottom: insets.bottom }}>
            <Composer
              onSend={handleSend}
              onTyping={handleTyping}
              replyTo={replyTo}
              onCancelReply={handleCancelReply}
              roomId={roomId}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Media Viewer */}
      <MediaViewer
        visible={mediaViewerVisible}
        attachments={selectedAttachments}
        initialIndex={selectedAttachmentIndex}
        onClose={handleCloseMediaViewer}
      />
    </Background>
  );
}
