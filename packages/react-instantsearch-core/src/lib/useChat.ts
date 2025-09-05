import { Chat } from 'instantsearch.js/es/lib/chat';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

import type {
  AbstractChat,
  ChatInit,
  UIMessage,
} from 'instantsearch.js/es/lib/chat';

export type UseChatHelpers<TUiMessage extends UIMessage> = {
  /**
   * The id of the chat.
   */
  readonly id: string;

  /**
   * Update the `messages` state locally. This is useful when you want to
   * edit the messages on the client, and then trigger the `reload` method
   * manually to regenerate the AI response.
   */
  setMessages: (
    messages: TUiMessage[] | ((m: TUiMessage[]) => TUiMessage[])
  ) => void;

  error: Error | undefined;
} & Pick<
  AbstractChat<TUiMessage>,
  | 'sendMessage'
  | 'regenerate'
  | 'stop'
  | 'resumeStream'
  | 'addToolResult'
  | 'status'
  | 'messages'
  | 'clearError'
>;

export type UseChatOptions<TUiMessage extends UIMessage> = (
  | { chat: Chat<TUiMessage> }
  | ChatInit<TUiMessage>
) & {
  /**
   * Whether to resume an ongoing chat generation stream.
   */
  resume?: boolean;
};

export function useChat<TUiMessage extends UIMessage = UIMessage>({
  resume = false,
  ...options
}: UseChatOptions<TUiMessage> = {}): UseChatHelpers<TUiMessage> {
  const chatRef = useRef<Chat<TUiMessage>>(
    'chat' in options ? options.chat : new Chat(options)
  );

  const shouldRecreateChat =
    ('chat' in options && options.chat !== chatRef.current) ||
    ('id' in options && chatRef.current.id !== options.id);

  if (shouldRecreateChat) {
    chatRef.current = 'chat' in options ? options.chat : new Chat(options);
  }

  const optionsId = 'id' in options ? options.id : null;

  const subscribeToMessages = useCallback(
    (update: () => void) =>
      chatRef.current['~registerMessagesCallback'](update),
    // optionsId is required to trigger re-subscription when the chat ID changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [optionsId]
  );

  const messages = useSyncExternalStore(
    subscribeToMessages,
    () => chatRef.current.messages,
    () => chatRef.current.messages
  );

  const status = useSyncExternalStore(
    chatRef.current['~registerStatusCallback'],
    () => chatRef.current.status,
    () => chatRef.current.status
  );

  const error = useSyncExternalStore(
    chatRef.current['~registerErrorCallback'],
    () => chatRef.current.error,
    () => chatRef.current.error
  );

  const setMessages = useCallback(
    (messagesParam: TUiMessage[] | ((m: TUiMessage[]) => TUiMessage[])) => {
      if (typeof messagesParam === 'function') {
        messagesParam = messagesParam(chatRef.current.messages);
      }
      chatRef.current.messages = messagesParam;
    },
    [chatRef]
  );

  useEffect(() => {
    if (resume) {
      chatRef.current.resumeStream();
    }
  }, [resume, chatRef]);

  return {
    id: chatRef.current.id,
    messages,
    setMessages,
    sendMessage: chatRef.current.sendMessage,
    regenerate: chatRef.current.regenerate,
    clearError: chatRef.current.clearError,
    stop: chatRef.current.stop,
    error,
    resumeStream: chatRef.current.resumeStream,
    status,
    addToolResult: chatRef.current.addToolResult,
  };
}
