/**
 * Chat Room Screen
 * Individual chat room/conversation view
 * Refactored following SOLID principles
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { LegendList } from '@legendapp/list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Background, View, AppBar } from '@/components';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Composer, MediaViewer, MessageListHeader, EmptyState } from './components';
import { useRoomData } from './hooks/use-room-data';
import { useMessages } from './hooks/use-messages';
import { usePagination } from './hooks/use-pagination';
import { useScrollHandler } from './hooks/use-scroll-handler';
import { useMediaViewer } from './hooks/use-media-viewer';
import { useMessageActions } from './hooks/use-message-actions';
import { useMessageRenderer } from './hooks/use-message-renderer';
import { getRoomDisplayName } from './utils/room-name';
import type { ChatMessage, ChatAttachment } from '@/services/chat';
import { useAudioPlayerStore } from '@/stores/audio-player';

export default function ChatRoomScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ roomId: string | string[] }>();
  const flatListRef = useRef<any>(null);

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
  const { isLoadingMore, handleLoadMore } = usePagination({
    roomId,
    messages,
    messagesLength,
    isLoading,
  });
  const { handleScroll } = useScrollHandler({
    isLoading,
    messagesLength,
    flatListRef,
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
  const contentContainerStyle = useMemo(
    () => ({
      paddingVertical: theme.spacing.gap.md,
      paddingBottom: theme.spacing.gap.xl,
    }),
    [theme.spacing.gap.md, theme.spacing.gap.xl]
  );

  // Memoize onContentSizeChange callback
  const handleContentSizeChange = () => {
    // LegendList handles content size changes internally
    // This callback is kept for potential future debugging if needed
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

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
        <AppBar
          title={roomName}
          showBackButton={true}
          onBackPress={() => router.back()}
          safeArea={true}
          titleAlign="left"
          style={{ borderBottomWidth: 0 }}
        />
        {/* Container with explicit flex: 1 - required for LegendList */}
        <View style={{ flex: 1, paddingBottom: insets.bottom }}>
          <LegendList
            ref={flatListRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={contentContainerStyle}
            // Chat-specific optimizations
            // alignItemsAtEnd: aligns items to bottom (messages start at bottom)
            // maintainScrollAtEnd: keeps scroll at bottom when new messages arrive
            // maintainScrollAtEndThreshold: 10% of screen height counts as "bottom" (default is 0.1)
            alignItemsAtEnd={true}
            maintainScrollAtEnd={true}
            maintainScrollAtEndThreshold={0.1}
            recycleItems={true}
            initialScrollIndex={messages.length - 1}
            // Performance optimizations to prevent container pool warnings
            // estimatedItemSize: average height of a chat message (text-only, 1-2 lines)
            // This helps LegendList pre-allocate containers more accurately
            estimatedItemSize={75}
            // initialContainerPoolRatio: create more containers upfront to handle varying message sizes
            // Default is 2, increased to 4 to accommodate messages with attachments/date separators
            initialContainerPoolRatio={4}
            // Event handlers
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
            onStartReached={handleLoadMore}
            onStartReachedThreshold={0.1}
            extraData={room?.type}
            ListHeaderComponent={<MessageListHeader isLoadingMore={isLoadingMore} />}
            ListEmptyComponent={<EmptyState isLoading={isLoading} />}
          />

          <Composer
            onSend={handleSend}
            onTyping={handleTyping}
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
            roomId={roomId}
          />
        </View>

        {/* Media Viewer */}
        <MediaViewer
          visible={mediaViewerVisible}
          attachments={selectedAttachments}
          initialIndex={selectedAttachmentIndex}
          onClose={handleCloseMediaViewer}
        />
      </Background>
    </KeyboardAvoidingView>
  );
}
