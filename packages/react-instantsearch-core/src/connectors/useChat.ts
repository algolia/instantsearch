import { DefaultChatTransport } from 'ai';
import { Chat } from 'instantsearch.js/es/lib/chat';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { useAppIdAndApiKey } from '../lib/useAppIdAndApiKey';
import { warn } from '../lib/warn';

import type {
  UserClientSideTools,
  ClientSideTools,
  AddToolResultWithOutput,
} from 'instantsearch-ui-components';
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
  /**
   * The current input value.
   */
  input: string;
  /**
   * Update the input value.
   */
  setInput: (input: string) => void;
  /**
   * Whether the chat is currently open.
   */
  open: boolean;
  /**
   * Update the open state.
   */
  setOpen: (open: boolean) => void;
  /**
   * Whether the chat is in the process of clearing messages.
   */
  isClearing: boolean;
  /**
   * Clear all messages.
   */
  clearMessages: () => void;
  /**
   * Callback to be called when the clear transition ends.
   */
  onClearTransitionEnd: () => void;
  /**
   * Tools with addToolResult injected, ready to be used by the UI.
   */
  toolsForUi: ClientSideTools;
  /**
   * The current error.
   */
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
  /**
   * Initial value for the input field.
   */
  initialInput?: string;
  /**
   * Whether the chat should be open by default.
   */
  defaultOpen?: boolean;
  /**
   * Custom tools to be used in the chat.
   */
  tools?: UserClientSideTools;
};

export function useChat<TUiMessage extends UIMessage = UIMessage>({
  resume = false,
  initialInput = '',
  defaultOpen = false,
  tools = {},
  ...options
}: UseChatOptions<TUiMessage> = {}): UseChatHelpers<TUiMessage> {
  warn(false, 'Chat is not yet stable and will change in the future.');
  warn(
    !('agentId' in options && 'transport' in options),
    "`useChat` with `agentId` and `transport` can't be used together. The `transport` option will be used."
  );

  const [appId, apiKey] = useAppIdAndApiKey();

  const [input, setInput] = useState(initialInput);
  const [open, setOpen] = useState(defaultOpen);
  const [isClearing, setIsClearing] = useState(false);

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
          'x-algolia-api-Key': apiKey,
        },
      });
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

  const createChatInstance = useCallback(() => {
    if ('chat' in optionsWithTransport) {
      return optionsWithTransport.chat;
    }

    const chatInstanceRef = { current: null as Chat<TUiMessage> | null };

    const onToolCall = ({ toolCall }: { toolCall: any }) => {
      const tool = tools[toolCall.toolName];
      const chatInstance = chatInstanceRef.current!;

      if (!tool) {
        if (__DEV__) {
          throw new Error(
            `No tool implementation found for "${toolCall.toolName}". Please provide a tool implementation in the \`tools\` prop.`
          );
        }

        chatInstance.addToolResult({
          output: `No tool implemented for "${toolCall.toolName}".`,
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
        });
        return;
      }

      if (tool.onToolCall) {
        const scopedAddToolResult: AddToolResultWithOutput = ({ output }) =>
          chatInstance.addToolResult({
            output,
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
          });

        tool.onToolCall({ ...toolCall, addToolResult: scopedAddToolResult });
      }
    };

    const chatInstance = new Chat({ ...optionsWithTransport, onToolCall });
    chatInstanceRef.current = chatInstance;
    return chatInstance;
  }, [optionsWithTransport, tools]);

  const chatRef = useRef<Chat<TUiMessage>>(createChatInstance());

  const shouldRecreateChat =
    ('chat' in optionsWithTransport &&
      optionsWithTransport.chat !== chatRef.current) ||
    ('id' in optionsWithTransport &&
      chatRef.current.id !== optionsWithTransport.id);

  if (shouldRecreateChat) {
    chatRef.current = createChatInstance();
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

  const clearMessages = useCallback(() => {
    if (!messages || messages.length === 0) return;
    setIsClearing(true);
  }, [messages]);

  const onClearTransitionEnd = useCallback(() => {
    setMessages([]);
    chatRef.current.clearError();
    setIsClearing(false);
  }, [setMessages, chatRef]);

  const toolsForUi: ClientSideTools = useMemo(() => {
    const result: ClientSideTools = {};
    Object.entries(tools).forEach(([key, tool]) => {
      result[key] = {
        ...tool,
        addToolResult: chatRef.current.addToolResult,
      };
    });
    return result;
  }, [tools]);

  useEffect(() => {
    if (resume) {
      chatRef.current.resumeStream();
    }
  }, [resume, chatRef]);

  return {
    id: chatRef.current.id,
    messages,
    setMessages,
    input,
    setInput,
    open,
    setOpen,
    isClearing,
    clearMessages,
    onClearTransitionEnd,
    toolsForUi,
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
