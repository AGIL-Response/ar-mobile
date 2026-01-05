/**
 * Chat Room Screen
 * Individual chat room/conversation view
 * Refactored following SOLID principles
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { LegendList, type LegendListRef } from '@legendapp/list';
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
  const listRef = useRef<LegendListRef<ChatMessage>>(null);
  const previousMessagesLengthRef = useRef(0);

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
  // Note: alignItemsAtEnd adds padding above items automatically, so we only need bottom padding
  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: theme.spacing.gap.md,
      paddingBottom: theme.spacing.gap.xl,
    }),
    [theme.spacing.gap.md, theme.spacing.gap.xl]
  );


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
  }, [roomId]);

  // Calculate initialScrollIndex to scroll to the last message (newest) when messages are loaded
  // Messages are in normal order: [oldest, ..., newest], so last index is newest
  // Always set to last message index when messages are available (not during initial loading)
  const initialScrollIndex = useMemo(() => {
    if (isInitialLoading || messages.length === 0) {
      return undefined;
    }
    // Always return the last message index to ensure list starts at bottom
    return messages.length - 1;
  }, [messages.length, isInitialLoading]);

  // Track if initialScrollIndex has been set at least once (for key-based remount)
  const hasInitialScrollIndex = initialScrollIndex !== undefined;

  useEffect(() => {
    if (!isInitialLoading && messages.length > 0 && !hasScrolledToEnd) {
      const timer = setTimeout(() => {
        console.log('[ChatRoom] Marking scroll to end as complete');
        hasScrolledToEndRef.current = true;
        setHasScrolledToEnd(true);
      }, 800);
      return () => clearTimeout(timer);
    } else if (!isInitialLoading && messages.length === 0 && !hasScrolledToEnd) {
      // If no messages, mark as complete immediately (empty state will show)
      hasScrolledToEndRef.current = true;
      setHasScrolledToEnd(true);
    }
  }, [isInitialLoading, messages.length, hasScrolledToEnd]);

  // Show loading overlay until initial scroll to end is complete
  // If there are no messages, don't show overlay (empty state will show)
  // Also show overlay when roomId is missing, room is not loaded yet, or initialScrollIndex is not ready
  // Note: initialScrollIndex must be set before list renders, otherwise LegendList won't scroll to it
  const showLoadingOverlay =
    isInitialLoading ||
    (messages.length > 0 && !hasScrolledToEnd) ||
    !roomId ||
    (!room && !isLoading) ||
    (messages.length > 0 && initialScrollIndex === undefined);

  // Auto-scroll to bottom when new messages arrive (after initial load)
  useEffect(() => {
    if (
      !isInitialLoading &&
      hasScrolledToEnd &&
      messages.length > 0 &&
      messages.length > previousMessagesLengthRef.current
    ) {
      // New message(s) arrived - scroll to bottom
      const timer = setTimeout(() => {
        if (listRef.current) {
          try {
            // Scroll to the last message (newest)
            const lastIndex = messages.length - 1;
            listRef.current.scrollToIndex({ index: lastIndex, animated: true });
          } catch (error) {
            // If scrollToIndex fails (e.g., item not rendered yet), use scrollToEnd
            try {
              listRef.current.scrollToEnd({ animated: true });
            } catch (e) {
              // Ignore errors - maintainScrollAtEnd should handle it
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
            <LegendList
              ref={listRef}
              key={hasInitialScrollIndex ? `list-ready-${roomId}` : 'list-loading'}
              data={messages}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={contentContainerStyle}
              alignItemsAtEnd={true}
              maintainScrollAtEnd={true}
              maintainScrollAtEndThreshold={0.1}
              maintainVisibleContentPosition
              initialScrollIndex={initialScrollIndex}
              estimatedItemSize={75}
              onStartReached={handleLoadMore}
              onStartReachedThreshold={0.1}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              // Performance optimizations for fast scrolling
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={15}
              updateCellsBatchingPeriod={50}
              getItemLayout={undefined} // Can't use this with dynamic heights
              ListHeaderComponent={<MessageListHeader isLoadingMore={isLoadingMore} />}
              ListEmptyComponent={<EmptyState isLoading={isInitialLoading || (messages.length === 0 && isLoading)} />}
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
