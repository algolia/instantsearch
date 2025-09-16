/** @jsx h */

import { createChatComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import connectChat from '../../connectors/chat/connectChat';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { carousel } from '../../templates';

import type {
  ChatRenderState,
  ChatConnectorParams,
  ChatWidgetDescription,
} from '../../connectors/chat/connectChat';
import type { UIMessage } from '../../lib/chat';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  WidgetFactory,
  Renderer,
  Hit,
  TemplateWithBindEvent,
  BaseHit,
} from '../../types';
import type { ChatClassNames, Tools } from 'instantsearch-ui-components';

function createDefaultTools<TObject extends BaseHit = BaseHit>(
  itemComponent?: (props: { item: Hit<TObject> }) => h.JSX.Element
): Tools {
  return [
    {
      type: 'tool-algolia_search_index',
      component: ({ message, indexUiState, setIndexUiState }) => {
        const items =
          (
            message.output as {
              hits?: Array<Hit<TObject>>;
            }
          )?.hits || [];

        const input = message.input as { query: string };

        return (
          <div>
            {carousel()({
              items,
              // TODO: fix ts error
              // @ts-expect-error
              templates: { item: itemComponent },
              sendEvent: () => {},
            })}

            {input?.query && (
              <button
                className="ais-ChatToolSearchIndexRefineButton"
                onClick={() => {
                  if (input?.query) {
                    setIndexUiState({
                      ...indexUiState,
                      query: input.query,
                    });
                  }
                }}
              >
                Refine on this query
              </button>
            )}
          </div>
        );
      },
      onToolCall: ({ toolCall, addToolResult }) => {
        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: '',
        });
      },
    },
  ];
}

const withUsage = createDocumentationMessageGenerator({
  name: 'chat',
});

const Chat = createChatComponent({
  createElement: h,
  Fragment,
});

function createRenderer({
  renderState,
  cssClasses,
  containerNode,
  templates,
  tools,
}: {
  containerNode: HTMLElement;
  cssClasses: ChatCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<Required<ChatTemplates>>;
  };
  templates: ChatTemplates;
  tools?: Tools;
}): Renderer<ChatRenderState, Partial<ChatWidgetParams>> {
  // TODO: move these to connector
  let open = false;
  let input = '';

  const userTools = tools ?? [];
  const defaultTools = createDefaultTools();
  const hasSearchIndexTool = userTools.some(
    (tool) => tool.type === 'tool-algolia_search_index'
  );
  const combinedTools = hasSearchIndexTool
    ? userTools
    : [...defaultTools, ...userTools];

  return (props, isFirstRendering) => {
    const { instantSearchInstance, sendMessage, getMessages } = props;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as Required<ChatTemplates>,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const setOpen = (o: boolean) => {
      open = o;
      renderChat();
    };

    const setInput = (i: string) => {
      input = i;
      renderChat();
    };

    function renderChat() {
      render(
        <Chat
          open={open}
          toggleButtonProps={{
            open,
            onClick: () => {
              setOpen(!open);
            },
          }}
          messagesProps={{
            messages: getMessages(),
            // TODO: retrieve proper index name and index ui state
            indexUiState:
              instantSearchInstance.getUiState()[
                instantSearchInstance.indexName
              ] || {},
            setIndexUiState: (state) =>
              instantSearchInstance.setUiState({
                ...instantSearchInstance.getUiState(),
                [instantSearchInstance.indexName]: state,
              }),
            tools: combinedTools,
          }}
          headerProps={{
            onClose: () => {
              setOpen(false);
            },
          }}
          promptProps={{
            value: input,
            onInput: (e) => {
              setInput(e);
            },
            onSubmit: (e) => {
              sendMessage({ text: e });
              setInput('');
            },
          }}
          classNames={cssClasses}
        />,
        containerNode
      );
    }

    renderChat();
  };
}

export type ChatCSSClasses = Partial<ChatClassNames>;

export type ChatTemplates<THit extends NonNullable<object> = BaseHit> =
  Partial<{
    /**
     * Template to use for each result. This template will receive an object containing a single record.
     */
    item: TemplateWithBindEvent<Hit<THit>>;
  }>;

type ChatWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Client-side tools to add to the chat
   */
  tools?: Tools;

  /**
   * Templates to use for the widget.
   */
  templates?: ChatTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: ChatCSSClasses;
};

export type ChatWidget = WidgetFactory<
  // TODO: fix for generic
  ChatWidgetDescription<UIMessage> & {
    $$widgetType: 'ais.chat';
  },
  ChatConnectorParams,
  ChatWidgetParams
>;

export default (function chat<TUiMessage extends UIMessage = UIMessage>(
  widgetParams: ChatWidgetParams & ChatConnectorParams<TUiMessage>
) {
  const {
    container,
    templates = {},
    cssClasses = {},
    resume = false,
    tools,
    ...options
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
    tools,
  });

  const makeWidget = connectChat(specializedRenderer, () =>
    render(null, containerNode)
  );
  return {
    ...makeWidget({
      resume,
      ...options,
    }),
    $$widgetType: 'ais.chat',
  };
} satisfies ChatWidget);
