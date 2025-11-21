import { DefaultChatTransport } from 'ai';

import { Chat } from '../../lib/chat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAppIdAndApiKey,
  noop,
} from '../../lib/utils';

import type {
  AbstractChat,
  ChatInit as ChatInitAi,
  UIMessage,
} from '../../lib/chat';
import type {
  Connector,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  InstantSearch,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
  connector: true,
});

export type PromptSuggestionsRenderState<
  TUiMessage extends UIMessage = UIMessage
> = Pick<
  AbstractChat<TUiMessage>,
  | 'clearError'
  | 'error'
  | 'id'
  | 'regenerate'
  | 'resumeStream'
  | 'status'
  | 'stop'
> & {
  suggestions: Array<{ title: string }>;
};

export type PromptSuggestionsInitWithoutTransport<
  TUiMessage extends UIMessage
> = Omit<ChatInitAi<TUiMessage>, 'transport'>;

export type PromptSuggestionsTransport = {
  agentId?: string;
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
};

export type PromptSuggestionsInit<TUiMessage extends UIMessage> =
  PromptSuggestionsInitWithoutTransport<TUiMessage> &
    PromptSuggestionsTransport;

export type PromptSuggestionsConnectorParams<
  TUiMessage extends UIMessage = UIMessage
> =
  | { chat: Chat<TUiMessage> }
  | (PromptSuggestionsInit<TUiMessage> & {
      item: Record<string, unknown>;
    });

export type PromptSuggestionsWidgetDescription<
  TUiMessage extends UIMessage = UIMessage
> = {
  $$type: 'ais.promptSuggestions';
  renderState: PromptSuggestionsRenderState<TUiMessage>;
  indexRenderState: Record<string, unknown>;
};

export type PromptSuggestionsConnector<
  TUiMessage extends UIMessage = UIMessage
> = Connector<
  PromptSuggestionsWidgetDescription<TUiMessage>,
  PromptSuggestionsConnectorParams<TUiMessage>
>;

export default (function connectPromptSuggestions<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<
    PromptSuggestionsRenderState,
    TWidgetParams & PromptSuggestionsConnectorParams
  >,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <TUiMessage extends UIMessage = UIMessage>(
    widgetParams: TWidgetParams & PromptSuggestionsConnectorParams<TUiMessage>
  ) => {
    const { ...options } = widgetParams || {};

    let _chatInstance: Chat<TUiMessage>;

    const makeChatInstance = (instantSearchInstance: InstantSearch) => {
      let transport;
      const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);
      if ('transport' in options && options.transport) {
        transport = new DefaultChatTransport(options.transport);
      }
      if ('agentId' in options && options.agentId) {
        const { agentId } = options;
        if (!appId || !apiKey) {
          throw new Error(
            withUsage(
              'Could not extract Algolia credentials from the search client.'
            )
          );
        }
        transport = new DefaultChatTransport({
          api: `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
          headers: {
            'x-algolia-application-id': appId,
            'x-algolia-api-Key': apiKey,
          },
        });
      }
      if (!transport) {
        throw new Error(
          withUsage('You need to provide either an `agentId` or a `transport`.')
        );
      }

      if ('chat' in options) {
        return options.chat;
      }

      return new Chat({
        ...options,
        transport,
      });
    };

    return {
      $$type: 'ais.promptSuggestions',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        _chatInstance = makeChatInstance(instantSearchInstance);

        const render = () => {
          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance: initOptions.instantSearchInstance,
            },
            false
          );
        };

        _chatInstance['~registerErrorCallback'](render);
        _chatInstance['~registerMessagesCallback'](render);
        _chatInstance['~registerStatusCallback'](render);

        if (
          'item' in options &&
          options.item &&
          _chatInstance.messages.length === 0
        ) {
          _chatInstance.sendMessage({
            text: JSON.stringify(options.item),
          });
        }

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState) {
        return renderState;
      },

      getWidgetRenderState(renderState) {
        if (!_chatInstance) {
          this.init!({ ...renderState, uiState: {}, results: undefined });
        }

        const suggestions: Array<{ title: string }> = [];
        if (_chatInstance.status === 'ready') {
          const lastMessage = _chatInstance.messages.findLast(
            (message) => message.role === 'assistant'
          );

          if (lastMessage) {
            try {
              const payload = lastMessage.parts.find(
                (part) => part.type === 'text'
              );
              const parsed = JSON.parse(payload?.text || '');
              if (Array.isArray(parsed.suggestions)) {
                suggestions.push(...parsed.suggestions);
              }
              // eslint-disable-next-line no-empty
            } catch {}
          }
        }

        return {
          widgetParams,
          suggestions,
          clearError: _chatInstance.clearError,
          error: _chatInstance.error,
          id: _chatInstance.id,
          regenerate: _chatInstance.regenerate,
          resumeStream: _chatInstance.resumeStream,
          status: _chatInstance.status,
          stop: _chatInstance.stop,
        };
      },

      dispose() {
        unmountFn();
      },

      shouldRender() {
        return true;
      },

      get chatInstance() {
        return _chatInstance;
      },
    };
  };
} satisfies PromptSuggestionsConnector);
