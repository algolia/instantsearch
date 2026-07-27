import connectChat from 'instantsearch.js/es/connectors/chat/connectChat';
import { useContext } from 'react';

import { useConnector } from '../hooks/useConnector';
import { ChatMessageSnapshotContext } from '../lib/ChatMessageSnapshotContext';
import { useIsHydrated } from '../lib/useIsHydrated';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatConnector,
  ChatConnectorParams,
  ChatWidgetDescription,
} from 'instantsearch.js/es/connectors/chat/connectChat';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export type UseChatProps<TUiMessage extends UIMessage = UIMessage> =
  ChatConnectorParams<TUiMessage>;

type HydratableChat<TUiMessage extends UIMessage> = {
  '~getServerMessages': (capturedRevision?: unknown) => TUiMessage[];
};

function getSuggestions<TUiMessage extends UIMessage>(
  messages: TUiMessage[]
): string[] | undefined {
  const assistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.parts);
  const suggestionsPart = assistantMessage?.parts?.find(
    (
      part
    ): part is {
      type: `data-${string}`;
      data: { suggestions: string[] };
    } =>
      'type' in part &&
      part.type === 'data-suggestions' &&
      'data' in part &&
      Array.isArray(
        (part as { data?: { suggestions?: unknown } }).data?.suggestions
      )
  );

  return suggestionsPart?.data.suggestions;
}

function getInitialMessages<TUiMessage extends UIMessage>(
  props: UseChatProps<TUiMessage>,
  capturedRevision: unknown | undefined
): TUiMessage[] {
  const messages =
    'chat' in props
      ? // A `chat` from another copy of instantsearch.js has no snapshot hook.
        // Fall back to empty rather than to `chat.messages`: that array also
        // holds messages restored from storage, which the server never sees,
        // so seeding the hydration render from it causes a mismatch. Such a
        // chat's caller messages appear after hydration instead.
        (props.chat as typeof props.chat & Partial<HydratableChat<TUiMessage>>)[
          '~getServerMessages'
        ]?.(capturedRevision) ?? []
      : props.messages ?? [];

  if (messages.length > 0 || props.resume || !props.initialMessages?.length) {
    return messages;
  }

  return props.initialMessages;
}

export function useChat<TUiMessage extends UIMessage = UIMessage>(
  props: UseChatProps<TUiMessage>,
  additionalWidgetProperties?: AdditionalWidgetProperties
): ChatWidgetDescription<TUiMessage>['renderState'] {
  const isHydrated = useIsHydrated();
  const chatMessageSnapshot = useContext(ChatMessageSnapshotContext);
  const chatState = useConnector<
    ChatConnectorParams<TUiMessage>,
    ChatWidgetDescription<TUiMessage>
  >(
    connectChat as unknown as ChatConnector<TUiMessage>,
    props,
    additionalWidgetProperties
  );

  if (isHydrated) {
    return chatState;
  }

  // Messages restored from browser storage must not enter the hydration tree,
  // which the server rendered without them.
  const messages = getInitialMessages(props, chatMessageSnapshot);

  // `messages` is pinned to a captured revision, so status and error have to
  // be pinned with it. Letting them run live lets a delayed boundary render a
  // tuple that never existed, and the hydrating client starts from another.
  return {
    ...chatState,
    messages,
    status: 'ready',
    error: undefined,
    suggestions: getSuggestions(messages),
  };
}
