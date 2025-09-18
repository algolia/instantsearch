/** @jsx h */

import { createChatComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectChat from '../../connectors/chat/connectChat';
import { createInsightsEventHandler } from '../../lib/insights/listener';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { carousel } from '../../templates';

import defaultTemplates from './defaultTemplates';

import type {
  ChatRenderState,
  ChatConnectorParams,
  ChatWidgetDescription,
} from '../../connectors/chat/connectChat';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  WidgetFactory,
  Renderer,
  Hit,
  TemplateWithBindEvent,
  BaseHit,
} from '../../types';
import type { ChatClassNames, Tools, VNode } from 'instantsearch-ui-components';

type ItemComponent<THit> = (props: {
  item: THit;
  onClick: () => void;
  onAuxClick: () => void;
}) => VNode | VNode[];

const withUsage = createDocumentationMessageGenerator({ name: 'chat' });

const Chat = createChatComponent({ createElement: h, Fragment });

function createDefaultTools<THit extends NonNullable<object> = BaseHit>(
  itemComponent?: ItemComponent<THit>
): Tools {
  return [
    {
      type: 'tool-algolia_search_index',
      component: ({ message, indexUiState, setIndexUiState }) => {
        const items =
          (
            message.output as {
              hits?: Array<Hit<THit>>;
            }
          )?.hits || [];

        const input = message.input as { query: string };

        return (
          <div>
            {carousel()({
              items,
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

const createRenderer = <THit extends NonNullable<object> = BaseHit>({
  renderState,
  cssClasses,
  containerNode,
  templates,
  tools: userTools = [],
}: {
  containerNode: HTMLElement;
  cssClasses: ChatCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<Required<ChatTemplates<THit>>>;
  };
  templates: ChatTemplates<THit>;
  tools?: Tools;
}): Renderer<ChatRenderState, Partial<ChatWidgetParams>> => {
  return (props, isFirstRendering) => {
    const {
      indexUiState,
      insights,
      input,
      instantSearchInstance,
      messages,
      open,
      sendEvent,
      sendMessage,
      setIndexUiState,
      setInput,
      setOpen,
    } = props;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const handleInsightsClick = createInsightsEventHandler({
      insights,
      sendEvent,
    });

    const itemComponent: ItemComponent<THit> = ({ item, ...rootProps }) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="item"
        rootTagName="div"
        rootProps={{
          ...rootProps,
          onClick: (event: MouseEvent) => {
            handleInsightsClick(event);
            rootProps.onClick?.();
          },
          onAuxClick: (event: MouseEvent) => {
            handleInsightsClick(event);
            rootProps.onAuxClick?.();
          },
        }}
        data={item}
        sendEvent={sendEvent}
      />
    );

    const hasSearchIndexTool = userTools.some(
      (tool) => tool.type === 'tool-algolia_search_index'
    );

    const tools = hasSearchIndexTool
      ? userTools
      : [...createDefaultTools<THit>(itemComponent), ...userTools];

    render(
      <Chat
        classNames={cssClasses}
        open={open}
        headerProps={{ onClose: () => setOpen(false) }}
        messagesProps={{
          messages,
          indexUiState,
          setIndexUiState,
          tools,
        }}
        promptProps={{
          value: input,
          onInput: (value) => {
            setInput(value);
          },
          onSubmit: (text) => {
            sendMessage({ text });
            setInput('');
          },
        }}
        toggleButtonProps={{ open, onClick: () => setOpen(!open) }}
      />,
      containerNode
    );
  };
};

export type ChatCSSClasses = Partial<ChatClassNames>;

export type ChatTemplates<THit extends NonNullable<object> = BaseHit> =
  Partial<{
    /**
     * Template to use for each result. This template will receive an object containing a single record.
     */
    item: TemplateWithBindEvent<Hit<THit>>;
  }>;

type ChatWidgetParams<THit extends NonNullable<object> = BaseHit> = {
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
  templates?: ChatTemplates<THit>;

  /**
   * CSS classes to add.
   */
  cssClasses?: ChatCSSClasses;
};

export type ChatWidget = WidgetFactory<
  ChatWidgetDescription & { $$widgetType: 'ais.chat' },
  ChatConnectorParams,
  ChatWidgetParams
>;

export default (function chat<THit extends NonNullable<object> = BaseHit>(
  widgetParams: ChatWidgetParams<THit> & ChatConnectorParams
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
