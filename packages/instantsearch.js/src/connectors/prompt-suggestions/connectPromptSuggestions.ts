import type { Chat } from '../../lib/chat';
import type {
  Connector,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  WidgetRenderState,
  IndexRenderState,
} from '../../types';
import type { DefaultChatTransport, UIMessage } from '../../lib/ai-lite';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
  connector: true,
});

export type PromptSuggestionsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PromptSuggestionsTransport = {
  agentId?: string;
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
};

export type PromptSuggestionsConnectorParams<
  TUiMessage extends UIMessage = UIMessage
> = ({ chat: Chat<TUiMessage> } | PromptSuggestionsTransport) & {
  /**
   * Context object to send to the agent (e.g., product data for a PDP).
   */
  context: Record<string, unknown>;
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
    const chatWidget = connectChat(
      noop,
      unmountFn
    )({
      ...widgetParams,
      type: 'promptSuggestions',
    });

    return {
      ...chatWidget,
      $$type: 'ais.promptSuggestions',

      init(initOptions) {
        chatWidget.init(initOptions);

        const render = () => {
          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance: initOptions.instantSearchInstance,
            },
            false
          );
        };

        chatWidget.chatInstance['~registerMessagesCallback'](render);
        chatWidget.chatInstance['~registerStatusCallback'](render);
        chatWidget.chatInstance['~registerErrorCallback'](render);

        const renderState = chatWidget.getWidgetRenderState(initOptions);
        renderState.sendMessage({ text: JSON.stringify(widgetParams.context) });

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
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
        const chatRenderState = chatWidget.getWidgetRenderState(renderOptions);

        const { suggestions, status } = chatRenderState;

        let uiStatus: PromptSuggestionsStatus = 'idle';
        if (status === 'error') {
          uiStatus = 'error';
        } else if (status === 'submitted' || status === 'streaming') {
          uiStatus = 'loading';
        } else if (
          status === 'ready' &&
          suggestions &&
          suggestions.length > 0
        ) {
          uiStatus = 'ready';
        }

        return {
          suggestions,
          status: uiStatus,
          error: chatRenderState.error,
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
      },
    };
  };
} satisfies PromptSuggestionsConnector);
