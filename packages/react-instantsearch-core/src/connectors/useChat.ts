import { DefaultChatTransport } from 'ai';
import { Chat } from 'instantsearch.js/es/lib/chat';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

import { useAppIdAndApiKey } from '../lib/useAppIdAndApiKey';
import { warn } from '../lib/warn';

import type {
  AbstractChat,
  ChatInit as ChatInitAi,
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

export type ChatInitWithoutTransport<TUiMessage extends UIMessage> = Omit<
  ChatInitAi<TUiMessage>,
  'transport'
>;

export type ChatTransport = {
  agentId?: string;
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
};

export type ChatInit<TUiMessage extends UIMessage> =
  ChatInitWithoutTransport<TUiMessage> & ChatTransport;

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
  warn(false, 'Chat is not yet stable and will change in the future.');

  const [appId, apiKey] = useAppIdAndApiKey();

  const transport = useMemo(() => {
    if ('transport' in options && options.transport) {
      return new DefaultChatTransport(options.transport);
    }
    if ('agentId' in options && options.agentId) {
      const { agentId } = options;
      if (!appId || !apiKey) {
        throw new Error(
          'The `useChat` hook requires an `appId` and `apiKey` to be set on the `InstantSearch` component when using the `agentId` option.'
        );
      }
      return new DefaultChatTransport({
        api: `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
        headers: {
          'x-algolia-application-id': appId,
          'X-Algolia-API-Key': apiKey,
        },
      });
    }

    if ('agentId' in options && 'transport' in options) {
      warn(
        false,
        "`useChat` with `agentId` and `transport` can't be used together. The `transport` option will be used."
      );
    }

    throw new Error(
      'You need to provide either an `agentId` or a `transport`.'
    );
  }, [apiKey, appId, options]);

  const optionsWithTransport = useMemo(() => {
    if ('chat' in options) {
      return options;
    }
    return {
      ...options,
      transport,
    };
  }, [options, transport]);

  const chatRef = useRef<Chat<TUiMessage>>(
    'chat' in optionsWithTransport
      ? optionsWithTransport.chat
      : new Chat(optionsWithTransport)
  );

  const shouldRecreateChat =
    ('chat' in optionsWithTransport &&
      optionsWithTransport.chat !== chatRef.current) ||
    ('id' in optionsWithTransport &&
      chatRef.current.id !== optionsWithTransport.id);

  if (shouldRecreateChat) {
    chatRef.current =
      'chat' in optionsWithTransport
        ? optionsWithTransport.chat
        : new Chat(optionsWithTransport);
  }

  const optionsId =
    'id' in optionsWithTransport ? optionsWithTransport.id : null;

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
