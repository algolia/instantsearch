import connectChat from 'instantsearch.js/es/connectors/chat/connectChat';

import { useConnector } from '../hooks/useConnector';
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

export function useChat<TUiMessage extends UIMessage = UIMessage>(
  props: UseChatProps<TUiMessage>,
  additionalWidgetProperties?: AdditionalWidgetProperties
): ChatWidgetDescription<TUiMessage>['renderState'] {
  const isHydrated = useIsHydrated();
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
