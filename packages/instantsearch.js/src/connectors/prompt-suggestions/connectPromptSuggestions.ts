import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from '../../lib/ai-lite';

import { Chat } from '../../lib/chat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
  warning,
} from '../../lib/utils';

import type { UIMessage } from '../../lib/chat';
import type {
  Connector,
  IndexRenderState,
  InstantSearch,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
  connector: true,
});

export type PromptSuggestionsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PromptSuggestionsTransport = {
  agentId?: string;
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
};

export type PromptSuggestionsConnectorParams = PromptSuggestionsTransport & {
  /**
   * Context object to send to the agent (e.g., product data for a PDP).
   */
  context: Record<string, unknown>;
};

export type PromptSuggestionsRenderState = {
  /**
   * Suggestions received from the AI model.
   */
  suggestions: string[];
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

/**
 * Extract suggestions from the messages' data-suggestions part
 */
function extractSuggestionsFromMessages(messages: UIMessage[]): string[] {
  // Find the last assistant message (iterate from end)
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.parts);

  if (!lastAssistantMessage?.parts) {
    return [];
  }

  // Find the data-suggestions part
  const suggestionsPart = lastAssistantMessage.parts.find(
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

  return suggestionsPart?.data?.suggestions || [];
}

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
    warning(
      false,
      'PromptSuggestions is not yet stable and will change in the future.'
    );

    const { agentId, transport: transportConfig, context } = widgetParams || {};

    let suggestions: string[] = [];
    let status: PromptSuggestionsStatus = 'idle';
    let error: Error | undefined;
    let chatInstance: Chat<UIMessage> | null = null;
    let hasFetched = false;

    const setStatus = (
      newStatus: PromptSuggestionsStatus,
      render: () => void
    ) => {
      status = newStatus;
      render();
    };

    const setSuggestions = (newSuggestions: string[], render: () => void) => {
      suggestions = newSuggestions;
      render();
    };

    const setError = (newError: Error | undefined, render: () => void) => {
      error = newError;
      render();
    };

    const createChatInstance = (instantSearchInstance: InstantSearch) => {
      const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);
      let transport: DefaultChatTransport<UIMessage>;

      if (transportConfig) {
        transport = new DefaultChatTransport(transportConfig);
      } else if (agentId) {
        if (!appId || !apiKey) {
          throw new Error(
            withUsage(
              'Could not extract Algolia credentials from the search client.'
            )
          );
        }

        // TODO: Update to production URL
        const baseApi = `http://localhost:8000/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5&cache=false`;

        transport = new DefaultChatTransport({
          api: baseApi,
          headers: {
            'x-algolia-application-id': appId,
            'x-algolia-api-Key': apiKey,
            'x-algolia-agent': getAlgoliaAgent(instantSearchInstance.client),
          },
        });
      } else {
        throw new Error(
          withUsage('You need to provide either an `agentId` or a `transport`.')
        );
      }

      // Create a new chat instance with empty messages (no persistence)
      // Use sendAutomaticallyWhen to handle tool calls automatically
      return new Chat<UIMessage>({
        transport,
        messages: [],
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      });
    };

    const fetchSuggestions = (
      instantSearchInstance: InstantSearch,
      render: () => void
    ) => {
      if (hasFetched || !context) {
        return;
      }
      hasFetched = true;

      setStatus('loading', render);
      setError(undefined, render);

      try {
        chatInstance = createChatInstance(instantSearchInstance);

        // Register callbacks to track status and extract suggestions
        // Don't unsubscribe until we get suggestions (there may be multiple
        // request/response cycles due to tool calls with sendAutomaticallyWhen)
        let hasFoundSuggestions = false;
        const unsubscribeStatus = chatInstance['~registerStatusCallback'](
          () => {
            const chatStatus = chatInstance!.status;

            if (chatStatus === 'ready') {
              const extractedSuggestions = extractSuggestionsFromMessages(
                chatInstance!.messages
              );

              if (extractedSuggestions.length > 0) {
                hasFoundSuggestions = true;
                setSuggestions(extractedSuggestions, render);
                setStatus('ready', render);
                unsubscribeStatus();
              }
              // If no suggestions yet, keep listening for the next response
              // (tool calls trigger automatic follow-up requests)
            } else if (chatStatus === 'error') {
              setError(chatInstance!.error, render);
              setStatus('error', render);
              unsubscribeStatus();
            }
          }
        );

        // Set a timeout to stop waiting if suggestions never arrive
        setTimeout(() => {
          if (!hasFoundSuggestions) {
            setStatus('idle', render);
            unsubscribeStatus();
          }
        }, 30000); // 30 second timeout

        // Send the context as a message
        chatInstance
          .sendMessage({
            text: JSON.stringify(context),
          })
          .catch((err: Error) => {
            setError(err, render);
            setStatus('error', render);
          });
      } catch (err) {
        setError(err as Error, render);
        setStatus('error', render);
      }
    };

    const sendSuggestion = (
      suggestion: string,
      instantSearchInstance: InstantSearch,
      indexId: string
    ) => {
      const chatRenderState = instantSearchInstance.renderState[indexId]?.chat;

      if (!chatRenderState) {
        warning(
          false,
          'PromptSuggestions: Chat widget not found. Make sure you have a Chat widget in your InstantSearch instance.'
        );
        return;
      }

      // Open the chat if not already open
      if (!chatRenderState.open) {
        chatRenderState.setOpen(true);
      }

      // Include the product context with the suggestion so the chat knows
      // what product the user is asking about. Use HTML comment format that
      // will be stripped from the UI display but sent to the backend.
      const messageWithContext = context
        ? `<!--ais-context:${JSON.stringify(context)}-->${suggestion}`
        : suggestion;

      // Send the message with context
      chatRenderState.sendMessage({ text: messageWithContext });
    };

    return {
      $$type: 'ais.promptSuggestions',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        const render = () => {
          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance,
            },
            false
          );
        };

        // Fetch suggestions on init
        if (context) {
          fetchSuggestions(instantSearchInstance, render);
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
        const { instantSearchInstance } = renderOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
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
        const { instantSearchInstance, parent } = renderOptions;

        return {
          suggestions,
          status,
          error,
          sendSuggestion: (suggestion: string) =>
            sendSuggestion(
              suggestion,
              instantSearchInstance,
              parent.getIndexId()
            ),
          widgetParams,
        };
      },

      dispose() {
        unmountFn();
      },
    };
  };
} satisfies PromptSuggestionsConnector);
