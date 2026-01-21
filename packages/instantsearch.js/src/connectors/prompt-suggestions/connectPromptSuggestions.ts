import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
} from '../../lib/utils';

import type {
  Connector,
  InitOptions,
  RenderOptions,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  WidgetRenderState,
  IndexRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
  connector: true,
});

export type PromptSuggestionsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PromptSuggestionsTransport = {
  /**
   * The custom API endpoint URL.
   */
  api: string;
  /**
   * Custom headers to send with the request.
   */
  headers?: Record<string, string>;
  /**
   * Function to prepare the request body before sending.
   * Receives the default body and returns the modified request options.
   */
  prepareSendMessagesRequest?: (body: Record<string, unknown>) => {
    body: Record<string, unknown>;
  };
};

export type PromptSuggestionsConnectorParams = {
  /**
   * The ID of the agent configured in the Algolia dashboard.
   * Required unless a custom `transport` is provided.
   */
  agentId?: string;
  /**
   * Context object to send to the agent (e.g., product data for a PDP).
   */
  context: Record<string, unknown>;
  /**
   * Custom transport configuration for the API requests.
   * When provided, allows using a custom endpoint, headers, and request body.
   */
  transport?: PromptSuggestionsTransport;
};

export type PromptSuggestionsRenderState = {
  /**
   * Suggestions received from the AI model.
   */
  suggestions?: string[];
  /**
   * The status of the prompt suggestions request.
   */
  status: PromptSuggestionsStatus;
  /**
   * Error that occurred during the request.
   */
  error?: Error;
  /**
   * Sends a suggestion to the main chat. Opens the chat if not already open.
   */
  sendSuggestion: (suggestion: string) => void;
};

export type PromptSuggestionsWidgetDescription = {
  $$type: 'ais.promptSuggestions';
  renderState: PromptSuggestionsRenderState;
  indexRenderState: {
    promptSuggestions: WidgetRenderState<
      PromptSuggestionsRenderState,
      PromptSuggestionsConnectorParams
    >;
  };
};

export type PromptSuggestionsConnector = Connector<
  PromptSuggestionsWidgetDescription,
  PromptSuggestionsConnectorParams
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

  return (widgetParams: TWidgetParams & PromptSuggestionsConnectorParams) => {
    const { agentId, context, transport } = widgetParams;

    if (!agentId && !transport) {
      throw new Error(
        withUsage(
          'The `agentId` option is required unless a custom `transport` is provided.'
        )
      );
    }

    let endpoint: string;
    let headers: Record<string, string>;
    let status: PromptSuggestionsStatus = 'idle';
    let suggestions: string[] | undefined;
    let error: Error | undefined;

    const getWidgetRenderState = (
      renderOptions: InitOptions | RenderOptions
    ) => {
      return {
        suggestions,
        status,
        error,
        sendSuggestion: (suggestion: string) => {
          const indexId = renderOptions.parent.getIndexId();
          const mainChat = renderOptions.instantSearchInstance.renderState[
            indexId
          ]?.chat as WidgetRenderState<any, any> | undefined;

          if (!mainChat) {
            throw new Error(
              'PromptSuggestions: Chat widget not found. Make sure you have a Chat widget in your InstantSearch instance.'
            );
          }

          if (!mainChat.open) {
            mainChat.setOpen(true);
          }

          mainChat.sendMessage({ text: suggestion });
        },
        widgetParams,
      };
    };

    const fetchSuggestions = (initOptions: InitOptions) => {
      const { instantSearchInstance } = initOptions;

      status = 'loading';
      renderFn(
        {
          ...getWidgetRenderState(initOptions),
          instantSearchInstance,
        },
        false
      );

      const payload: Record<string, unknown> = {
        messages: [
          {
            role: 'user',
            content: JSON.stringify(context),
          },
        ],
      };

      const finalPayload = transport?.prepareSendMessagesRequest
        ? transport.prepareSendMessagesRequest(payload).body
        : payload;

      fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const assistantMessage = data.messages?.find(
            (msg: { role: string }) => msg.role === 'assistant'
          );

          if (assistantMessage?.parts) {
            const suggestionsPart = assistantMessage.parts.find(
              (part: { type: string }) => part.type === 'data-suggestions'
            );
            if (suggestionsPart?.data?.suggestions) {
              suggestions = suggestionsPart.data.suggestions;
            }
          }

          status = 'ready';
        })
        .catch((e) => {
          status = 'error';
          error = e;
        })
        .finally(() => {
          renderFn(
            {
              ...getWidgetRenderState(initOptions),
              instantSearchInstance,
            },
            false
          );
        });
    };

    return {
      $$type: 'ais.promptSuggestions' as const,

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        if (transport) {
          endpoint = transport.api;
          headers = transport.headers || {};
        } else {
          const [appId, apiKey] = getAppIdAndApiKey(
            instantSearchInstance.client
          );

          if (!appId || !apiKey) {
            throw new Error(
              withUsage(
                'Could not extract Algolia credentials from the search client.'
              )
            );
          }

          endpoint = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5&stream=false`;
          headers = {
            'x-algolia-application-id': appId,
            'x-algolia-api-key': apiKey,
            'x-algolia-agent': getAlgoliaAgent(instantSearchInstance.client),
          };
        }

        renderFn(
          {
            ...getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );

        fetchSuggestions(initOptions);
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;

        renderFn(
          {
            ...getWidgetRenderState(renderOptions),
            instantSearchInstance,
          },
          false
        );
      },

      getRenderState(
        renderState,
        renderOptions
      ): IndexRenderState &
        PromptSuggestionsWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          promptSuggestions: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState(renderOptions) {
        return getWidgetRenderState(renderOptions);
      },

      dispose() {
        unmountFn();
      },
    };
  };
} satisfies PromptSuggestionsConnector);
