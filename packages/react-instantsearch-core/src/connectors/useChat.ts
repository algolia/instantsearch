import connectChat from 'instantsearch.js/es/connectors/chat/connectChat';
import { useRef } from 'react';

import { useConnector } from '../hooks/useConnector';
import { dequal } from '../lib/dequal';
import { useIsHydrated } from '../lib/useIsHydrated';
import { useIsomorphicLayoutEffect } from '../lib/useIsomorphicLayoutEffect';
import { warn } from '../lib/warn';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatConnector,
  ChatConnectorParams,
  ChatWidgetDescription,
} from 'instantsearch.js/es/connectors/chat/connectChat';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export type UseChatProps<TUiMessage extends UIMessage = UIMessage> =
  ChatConnectorParams<TUiMessage>;

const OPEN_STATE_CACHE_KEY = 'instantsearch-chat-open-state';

function isOpenStatePersistenceEnabled<TUiMessage extends UIMessage>(
  props: UseChatProps<TUiMessage>
) {
  return (
    props.persistence === undefined ||
    props.persistence === true ||
    (typeof props.persistence === 'object' && props.persistence.open === true)
  );
}

function isMessagePersistenceEnabled<TUiMessage extends UIMessage>(
  props: UseChatProps<TUiMessage>
) {
  return (
    props.persistence === undefined ||
    props.persistence === true ||
    (typeof props.persistence === 'object' &&
      props.persistence.messages === true)
  );
}

function hasPersistedOpenState(type: string) {
  try {
    return sessionStorage.getItem(`${OPEN_STATE_CACHE_KEY}-${type}`) === 'true';
  } catch {
    return false;
  }
}

export function useChat<TUiMessage extends UIMessage = UIMessage>(
  props: UseChatProps<TUiMessage>,
  additionalWidgetProperties?: AdditionalWidgetProperties
): ChatWidgetDescription<TUiMessage>['renderState'] {
  const isHydrated = useIsHydrated();
  const previousPropsRef = useRef(props);
  const previousChatStateRef = useRef<Pick<
    ChatWidgetDescription<TUiMessage>['renderState'],
    'messages' | 'open'
  > | null>(null);

  useIsomorphicLayoutEffect(() => {
    const previousProps = previousPropsRef.current;
    const previousChatState = previousChatStateRef.current;

    if (
      previousChatState &&
      !dequal(previousProps, props) &&
      !('chat' in previousProps)
    ) {
      const nextType = props.type ?? 'chat';
      const losesOpenState =
        previousChatState.open &&
        (!isOpenStatePersistenceEnabled(props) ||
          !hasPersistedOpenState(nextType));
      const losesMessages =
        previousChatState.messages.length > 0 &&
        !isMessagePersistenceEnabled(previousProps);

      warn(
        !losesOpenState && !losesMessages,
        'Changing the props of the React <Chat> widget replaces its internal Chat instance and clears open state or non-persisted messages. Use stable prop references or provide your own Chat instance to preserve the conversation.'
      );
    }

    previousPropsRef.current = props;
  });

  const chatState = useConnector<
    ChatConnectorParams<TUiMessage>,
    ChatWidgetDescription<TUiMessage>
  >(
    connectChat as unknown as ChatConnector<TUiMessage>,
    props,
    additionalWidgetProperties
  );

  useIsomorphicLayoutEffect(() => {
    previousChatStateRef.current = chatState;
  });

  if (isHydrated) {
    return chatState;
  }

  // Server rendering only promises the closed Chat shell, so a render that has
  // to reproduce that markup shows no conversation either. `status` is pinned
  // with `messages` because it diverges two ways: a server render suppresses
  // `resumeStream()`, which the browser runs synchronously while initialising,
  // and a caller-owned chat can already be streaming. `error` is pinned because
  // a caller-owned chat can already have failed, which a connector-built one
  // cannot, since its failures arrive in a microtask. `suggestions` is pinned
  // because the connector derives them from those messages. Only an `id` given
  // as a connector option passes through, because that value is the same on
  // both sides. Anything else is withheld: the default is random per Chat, and
  // an `id` carried by a caller-owned instance is no safer, since the server and
  // the browser each construct their own.
  return {
    ...chatState,
    error: undefined,
    id: ('id' in props && props.id) || '',
    messages: [],
    open: false,
    status: 'ready',
    suggestions: undefined,
  };
}
