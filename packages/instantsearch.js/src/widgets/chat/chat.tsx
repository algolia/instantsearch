/** @jsx h */

import { createChatComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectChat from '../../connectors/chat/connectChat';
import { defaultTools } from '../../lib/chat';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
  find,
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
import type {
  AddToolResultWithOutput,
  ChatClassNames,
  ClientSideTool,
  ClientSideToolComponent,
  ClientSideToolComponentProps,
  UserClientSideTool,
} from 'instantsearch-ui-components';

function createDefaultTools<TObject extends BaseHit = BaseHit>(
  templates: ChatTemplates
): UserClientSideToolWithTemplate[] {
  const Carousel = carousel();

  const Component: ClientSideToolComponent = ({
    message,
    indexUiState,
    setIndexUiState,
  }) => {
    const items =
      (
        message.output as {
          hits?: Array<Hit<TObject>>;
        }
      )?.hits || [];

    const input = message.input as { query: string };

    return (
      <div>
        <Carousel
          items={items}
          templates={{
            item: templates.item
              ? ({ item, sendEvent }) => (
                  <TemplateComponent
                    templates={templates}
                    templateKey="item"
                    rootTagName="fragment"
                    data={item}
                    sendEvent={sendEvent}
                  />
                )
              : undefined,
          }}
          sendEvent={() => {}}
        />

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
  };

  return [
    {
      type: 'tool-algolia_search_index',
      template: {
        component: (props) => {
          return <Component {...props} />;
        },
      },
    },
  ];
}

const combineTools = (
  templates: ChatTemplates,
  userTools?: UserClientSideToolWithTemplate[]
) => {
  const defaults = createDefaultTools(templates);

  if (!userTools) {
    return defaults;
  }

  const userToolsMap = new Map(userTools.map((tool) => [tool.type, tool]));

  const merged = defaults.map(
    (defaultTool) => userToolsMap.get(defaultTool.type) ?? defaultTool
  );

  const extraUserTools = userTools.filter(
    (tool) => !defaultTools.includes(tool.type)
  );

  return [...merged, ...extraUserTools];
};

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
  tools: UserClientSideToolWithTemplate[];
}): Renderer<ChatRenderState, Partial<ChatWidgetParams>> {
  return (props, isFirstRendering) => {
    const {
      instantSearchInstance,
      sendMessage,
      getMessages,
      open,
      setOpen,
      input,
      setInput,
      addToolResult,
    } = props;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as Required<ChatTemplates>,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const toolsForUi: ClientSideTool[] = tools?.map((t) => ({
      ...t,
      component: (componentProps) => (
        <TemplateComponent
          templateKey="component"
          rootTagName="fragment"
          templates={t.template}
          data={componentProps}
        />
      ),
      addToolResult,
    }));

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
            tools: toolsForUi,
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

export type UserClientSideToolTemplate = Partial<{
  component: TemplateWithBindEvent<ClientSideToolComponentProps>;
}>;

export type UserClientSideToolWithTemplate = Omit<
  UserClientSideTool,
  'component'
> & {
  template: UserClientSideToolTemplate;
};

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
  tools?: UserClientSideToolWithTemplate[];

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
    tools: userTools,
    ...options
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const tools = combineTools(templates, userTools);

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

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { getWidgetRenderState, ...rest } = makeWidget({
    resume,
    ...options,
    onToolCall: ({ toolCall }) => {
      const tool = find(tools, (t) => t.type === `tool-${toolCall.toolName}`);

      if (tool && tool.onToolCall) {
        const scopedAddToolResult: AddToolResultWithOutput = ({ output }) => {
          return Promise.resolve(
            getWidgetRenderState().addToolResult({
              output,
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
            })
          );
        };
        return tool.onToolCall({ addToolResult: scopedAddToolResult });
      }
      return Promise.resolve();
    },
  });

  return {
    getWidgetRenderState,
    ...rest,
    $$widgetType: 'ais.chat',
  };
} satisfies ChatWidget);
