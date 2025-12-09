import connectChat from 'instantsearch.js/es/connectors/chat/connectChat';
import { useEffect } from 'react';

import { useConnector } from '../hooks/useConnector';
import { useInstantSearch } from '../index.umd';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatConnector,
  ChatConnectorParams,
  ChatInit,
  ChatWidgetDescription,
} from 'instantsearch.js/es/connectors/chat/connectChat';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export type UsePromptSuggestionsProps<
  TUiMessage extends UIMessage = UIMessage
> = Pick<ChatInit<TUiMessage>, 'agentId' | 'transport'>;

export function usePromptSuggestions<TUiMessage extends UIMessage = UIMessage>(
  props: UsePromptSuggestionsProps<TUiMessage>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  const {
    indexRenderState,
    results: { hits },
  } = useInstantSearch();

  const suggestionsClickCallback = (suggestion: string) => {
    indexRenderState.chat?.setOpen(true);
    indexRenderState.chat?.setInput(suggestion);
  };

  const { suggestions, messages, sendMessage, status } = useConnector<
    ChatConnectorParams<TUiMessage>,
    ChatWidgetDescription<TUiMessage>
  >(
    connectChat as unknown as ChatConnector<TUiMessage>,
    props,
    additionalWidgetProperties
  );

  useEffect(() => {
    if (hits.length > 0 && messages.length === 0) {
      const objectToSend = hits[0];
      sendMessage({
        text: JSON.stringify(objectToSend),
      });
    }
  }, [messages.length, hits, sendMessage]);

  return { suggestions, suggestionsClickCallback, status };
}
