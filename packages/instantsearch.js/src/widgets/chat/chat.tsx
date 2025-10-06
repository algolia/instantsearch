/** @jsx h */

import { createChatComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectChat from '../../connectors/chat/connectChat';
import { defaultTools, SearchIndexToolType } from '../../lib/chat';
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
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  WidgetFactory,
  Renderer,
  Hit,
  TemplateWithBindEvent,
  BaseHit,
  Template,
} from '../../types';
import type {
  AddToolResultWithOutput,
  ChatClassNames,
  ChatHeaderTranslations,
  ChatMessageErrorProps,
  ChatMessageLoaderProps,
  ChatMessagesTranslations,
  ChatPromptTranslations,
  ClientSideToolComponent,
  ClientSideToolComponentProps,
  UserClientSideTool,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'chat' });

const Chat = createChatComponent({ createElement: h, Fragment });

function getDefinedProperties<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function createDefaultTools<THit extends NonNullable<object> = BaseHit>(
  templates: ChatTemplates<THit>
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
          hits?: Array<Hit<THit>>;
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
      type: SearchIndexToolType,
      template: {
        component: (props) => {
          return <Component {...props} />;
        },
      },
    },
  ];
}

function combineTools<THit extends NonNullable<object> = BaseHit>(
  templates: ChatTemplates<THit>,
  userTools?: UserClientSideToolWithTemplate[]
) {
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
}

const createRenderer = <THit extends NonNullable<object> = BaseHit>({
  renderState,
  cssClasses,
  containerNode,
  templates,
  tools,
}: {
  containerNode: HTMLElement;
  cssClasses: ChatCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<ChatTemplates<THit>>;
  };
  templates: ChatTemplates<THit>;
  tools: UserClientSideToolWithTemplate[];
}): Renderer<ChatRenderState, Partial<ChatWidgetParams>> => {
  const state = createLocalState();
  return (props, isFirstRendering) => {
    const {
      indexUiState,
      input,
      instantSearchInstance,
      messages,
      open,
      sendMessage,
      setIndexUiState,
      setInput,
      setMessages,
      setOpen,
      status,
      addToolResult,
    } = props;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as ChatTemplates<THit>,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const toolsForUi = tools?.map((t) => ({
      ...t,
      addToolResult,
      component: (componentProps: ClientSideToolComponentProps) => {
        return (
          <TemplateComponent
            templates={t.template}
            rootTagName="fragment"
            templateKey="component"
            data={componentProps}
          />
        );
      },
    }));

    const headerTemplateProps = prepareTemplateProps({
      defaultTemplates: {} as unknown as NonNullable<
        Required<ChatTemplates<THit>['header']>
      >,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: templates.header,
    }) as PreparedTemplateProps<ChatTemplates<THit>>;
    const headerCloseIconComponent = templates.header?.closeIcon
      ? () => {
          return (
            <TemplateComponent
              {...headerTemplateProps}
              templateKey="closeIcon"
              rootTagName="span"
            />
          );
        }
      : undefined;
    const headerMinimizeIconComponent = templates.header?.minimizeIcon
      ? () => {
          return (
            <TemplateComponent
              {...headerTemplateProps}
              templateKey="minimizeIcon"
              rootTagName="span"
            />
          );
        }
      : undefined;
    const headerMaximizeIconComponent = templates.header?.maximizeIcon
      ? ({ maximized }: { maximized: boolean }) => {
          return (
            <TemplateComponent
              {...headerTemplateProps}
              templateKey="maximizeIcon"
              rootTagName="span"
              data={{ maximized }}
            />
          );
        }
      : undefined;
    const headerTitleIconComponent = templates.header?.titleIcon
      ? () => {
          return (
            <TemplateComponent
              {...headerTemplateProps}
              templateKey="titleIcon"
              rootTagName="span"
            />
          );
        }
      : undefined;
    const headerTranslations: Partial<ChatHeaderTranslations> =
      getDefinedProperties({
        title: templates.header?.titleText,
        minimizeLabel: templates.header?.minimizeLabelText,
        maximizeLabel: templates.header?.maximizeLabelText,
        closeLabel: templates.header?.closeLabelText,
        clearLabel: templates.header?.clearLabelText,
      });

    const messagesTemplateProps = prepareTemplateProps({
      defaultTemplates: {} as unknown as NonNullable<
        Required<ChatTemplates<THit>['messages']>
      >,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: templates.messages,
    }) as PreparedTemplateProps<ChatTemplates<THit>>;
    const messagesLoaderComponent = templates.messages?.loader
      ? (loaderProps: ChatMessageLoaderProps) => {
          return (
            <TemplateComponent
              {...messagesTemplateProps}
              templateKey="loader"
              rootTagName="div"
              data={loaderProps}
            />
          );
        }
      : undefined;
    const messagesErrorComponent = templates.messages?.error
      ? (errorProps: ChatMessageErrorProps) => {
          return (
            <TemplateComponent
              {...messagesTemplateProps}
              templateKey="error"
              rootTagName="div"
              data={errorProps}
            />
          );
        }
      : undefined;
    const messagesTranslations: Partial<ChatMessagesTranslations> =
      getDefinedProperties({
        scrollToBottomLabel: templates.messages?.scrollToBottomLabelText,
        loaderText: templates.messages?.loaderText,
        copyToClipboardLabel: templates.messages?.copyToClipboardLabelText,
        regenerateLabel: templates.messages?.regenerateLabelText,
      });

    const promptTemplateProps = prepareTemplateProps({
      defaultTemplates: {} as unknown as NonNullable<
        Required<ChatTemplates<THit>['prompt']>
      >,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: templates.prompt,
    }) as PreparedTemplateProps<ChatTemplates<THit>>;
    const promptHeaderComponent = templates.prompt?.header
      ? () => {
          return (
            <TemplateComponent
              {...promptTemplateProps}
              templateKey="header"
              rootTagName="fragment"
            />
          );
        }
      : undefined;
    const promptFooterComponent = templates.prompt?.footer
      ? () => {
          return (
            <TemplateComponent
              {...promptTemplateProps}
              templateKey="footer"
              rootTagName="fragment"
            />
          );
        }
      : undefined;
    const promptTranslations: Partial<ChatPromptTranslations> =
      getDefinedProperties({
        textareaLabel: templates.prompt?.textareaLabelText,
        textareaPlaceholder: templates.prompt?.textareaPlaceholderText,
        emptyMessageTooltip: templates.prompt?.emptyMessageTooltipText,
        stopResponseTooltip: templates.prompt?.stopResponseTooltipText,
        sendMessageTooltip: templates.prompt?.sendMessageTooltipText,
        disclaimer: templates.prompt?.disclaimerText,
      });

    state.subscribe(rerender);

    function rerender() {
      state.init();

      const [isClearing, setIsClearing] = state.use(false);
      const [maximized, setMaximized] = state.use(false);
      const [isScrollAtBottom, setIsScrollAtBottom] = state.use(true);

      const onClear = () => setIsClearing(true);
      const onClearTransitionEnd = () => {
        setMessages([]);
        setIsClearing(false);
      };
      render(
        <Chat
          classNames={cssClasses}
          open={open}
          maximized={maximized}
          headerProps={{
            onClose: () => setOpen(false),
            onToggleMaximize: () => setMaximized(!maximized),
            onClear,
            canClear: messages.length > 0 && isClearing !== true,
            closeIconComponent: headerCloseIconComponent,
            minimizeIconComponent: headerMinimizeIconComponent,
            maximizeIconComponent: headerMaximizeIconComponent,
            titleIconComponent: headerTitleIconComponent,
            translations: headerTranslations,
          }}
          messagesProps={{
            messages,
            indexUiState,
            isClearing,
            onClearTransitionEnd,
            isScrollAtBottom,
            setIsScrollAtBottom,
            setIndexUiState,
            tools: toolsForUi,
            loaderComponent: messagesLoaderComponent,
            errorComponent: messagesErrorComponent,
            translations: messagesTranslations,
          }}
          promptProps={{
            status,
            value: input,
            onInput: (event) => {
              setInput(event.currentTarget.value);
            },
            onSubmit: () => {
              sendMessage({ text: input });
              setInput('');
            },
            headerComponent: promptHeaderComponent,
            footerComponent: promptFooterComponent,
            translations: promptTranslations,
          }}
          toggleButtonProps={{ open, onClick: () => setOpen(!open) }}
        />,
        containerNode
      );
    }

    rerender();
  };
};

export type UserClientSideToolTemplate = Partial<{
  component: TemplateWithBindEvent<ClientSideToolComponentProps>;
}>;

type UserClientSideToolWithTemplate = Omit<UserClientSideTool, 'component'> & {
  template: UserClientSideToolTemplate;
};

export type Tool = UserClientSideToolWithTemplate;

export type ChatCSSClasses = Partial<ChatClassNames>;

export type ChatTemplates<THit extends NonNullable<object> = BaseHit> =
  Partial<{
    /**
     * Template to use for each result. This template will receive an object containing a single record.
     */
    item: TemplateWithBindEvent<Hit<THit>>;

    /**
     * Templates to use for the header.
     */
    header: Partial<{
      /**
       * Optional close icon
       */
      closeIcon: Template;
      /**
       * Optional minimize icon
       */
      minimizeIcon?: Template;
      /**
       * Optional maximize icon
       */
      maximizeIcon?: Template<{ maximized: boolean }>;
      /**
       * Optional title icon (defaults to sparkles)
       */
      titleIcon?: Template;
      /**
       * The title to display in the header
       */
      titleText: string;
      /**
       * Accessible label for the minimize button
       */
      minimizeLabelText: string;
      /**
       * Accessible label for the maximize button
       */
      maximizeLabelText: string;
      /**
       * Accessible label for the close button
       */
      closeLabelText: string;
      /**
       * Text for the clear button
       */
      clearLabelText: string;
    }>;

    /**
     * Templates to use for the messages.
     */
    messages: Partial<{
      /**
       * Template to use when loading messages
       */
      loader: Template<ChatMessageLoaderProps>;
      /**
       * Template to use when there is an error loading messages
       */
      error: Template<ChatMessageErrorProps>;
      /**
       * Label for the scroll to bottom button
       */
      scrollToBottomLabelText?: string;
      /**
       * Text to display in the loader
       */
      loaderText?: string;
      /**
       * Label for the copy to clipboard action
       */
      copyToClipboardLabelText?: string;
      /**
       * Label for the regenerate action
       */
      regenerateLabelText?: string;
    }>;

    /**
     * Templates to use for the prompt.
     */
    prompt: Partial<{
      /**
       * Template to use for the prompt header.
       */
      header: Template;
      /**
       * Template to use for the prompt footer.
       */
      footer: Template;
      /**
       * The label for the textarea
       */
      textareaLabelText: string;
      /**
       * The placeholder text for the textarea
       */
      textareaPlaceholderText: string;
      /**
       * The tooltip for the submit button when message is empty
       */
      emptyMessageTooltipText: string;
      /**
       * The tooltip for the stop button
       */
      stopResponseTooltipText: string;
      /**
       * The tooltip for the send button
       */
      sendMessageTooltipText: string;
      /**
       * The disclaimer text shown in the footer
       */
      disclaimerText: string;
    }>;
  }>;

type ChatWidgetParams<THit extends NonNullable<object> = BaseHit> = {
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

  const { chatInstance, ...rest } = makeWidget({
    resume,
    ...options,
    onToolCall: ({ toolCall }) => {
      const tool = find(tools, (t) => t.type === `tool-${toolCall.toolName}`);

      if (tool && tool.onToolCall) {
        const scopedAddToolResult: AddToolResultWithOutput = ({ output }) => {
          return Promise.resolve(
            chatInstance.addToolResult({
              output,
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
            })
          );
        };
        tool.onToolCall({ addToolResult: scopedAddToolResult });
      }
    },
  });

  return {
    ...rest,
    $$widgetType: 'ais.chat',
  };
} satisfies ChatWidget);

function createLocalState() {
  const state: unknown[] = [];
  const subscriptions = new Set<() => void>();
  let cursor = 0;

  function use<T>(initialValue: T): [T, (value: T) => T] {
    const index = cursor++;
    if (state[index] === undefined) {
      state[index] = initialValue;
    }

    return [
      state[index] as T,
      (value: T) => {
        const prev = state[index] as T;
        if (prev === value) {
          return prev;
        }

        state[index] = value;
        subscriptions.forEach((fn) => fn());
        return value;
      },
    ];
  }

  return {
    init() {
      cursor = 0;
    },
    subscribe(fn: () => void): () => void {
      subscriptions.add(fn);

      return () => subscriptions.delete(fn);
    },
    use,
  };
}
