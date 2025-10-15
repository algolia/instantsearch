/** @jsx h */

import {
  ArrowRightIconComponent,
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  createButtonComponent,
  createChatComponent,
} from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';
import { useMemo } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';
import connectChat from '../../connectors/chat/connectChat';
import { SearchIndexToolType, RecommendToolType } from '../../lib/chat';
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
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  WidgetFactory,
  Renderer,
  Hit,
  TemplateWithBindEvent,
  BaseHit,
  Template,
  IndexUiState,
  IndexWidget,
} from '../../types';
import type {
  ChatClassNames,
  ChatHeaderProps,
  ChatHeaderTranslations,
  ChatMessageActionProps,
  ChatMessageBase,
  ChatMessageErrorProps,
  ChatMessageLoaderProps,
  ChatMessagesTranslations,
  ChatPromptProps,
  ChatPromptTranslations,
  ClientSideToolComponentProps,
  ClientSideTools,
  RecordWithObjectID,
  UserClientSideTool,
} from 'instantsearch-ui-components';
import type { ComponentProps } from 'preact';

const withUsage = createDocumentationMessageGenerator({ name: 'chat' });

const Chat = createChatComponent({ createElement: h, Fragment });

export { SearchIndexToolType, RecommendToolType };

function getDefinedProperties<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function createCarouselTool<
  THit extends RecordWithObjectID = RecordWithObjectID
>(
  showViewAll: boolean,
  templates: ChatTemplates<THit>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideToolWithTemplate {
  const Button = createButtonComponent({
    createElement: h,
  });

  function SearchLayoutComponent({
    message,
    indexUiState,
    setIndexUiState,
    onClose,
  }: ClientSideToolComponentProps) {
    const input = message?.input as
      | {
          query: string;
          number_of_results?: number;
        }
      | undefined;

    const output = message?.output as
      | {
          hits?: Array<RecordWithObjectID<THit>>;
          nbHits?: number;
        }
      | undefined;

    const items = output?.hits || [];

    const MemoedHeaderComponent = useMemo(() => {
      return (
        props: Omit<
          ComponentProps<typeof HeaderComponent>,
          | 'nbHits'
          | 'query'
          | 'hitsPerPage'
          | 'setIndexUiState'
          | 'indexUiState'
          | 'getSearchPageURL'
          | 'onClose'
        >
      ) => (
        <HeaderComponent
          nbHits={output?.nbHits}
          query={input?.query}
          hitsPerPage={items.length}
          setIndexUiState={setIndexUiState}
          indexUiState={indexUiState}
          getSearchPageURL={getSearchPageURL}
          onClose={onClose}
          {...props}
        />
      );
    }, [
      items.length,
      input?.query,
      output?.nbHits,
      setIndexUiState,
      indexUiState,
      onClose,
    ]);

    return carousel({
      showNavigation: false,
      templates: {
        header: MemoedHeaderComponent,
      },
    })({
      items,
      templates: {
        item: ({ item }) => (
          <TemplateComponent
            templates={templates}
            templateKey="item"
            data={item}
            rootTagName="fragment"
          />
        ),
      },
      sendEvent: () => {},
    });
  }

  function HeaderComponent({
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    nbHits,
    query,
    hitsPerPage,
    setIndexUiState,
    indexUiState,
    onClose,
    // eslint-disable-next-line no-shadow
    getSearchPageURL,
  }: {
    canScrollLeft: boolean;
    canScrollRight: boolean;
    scrollLeft: () => void;
    scrollRight: () => void;
    nbHits?: number;
    query?: string;
    hitsPerPage?: number;
    setIndexUiState: IndexWidget['setIndexUiState'];
    indexUiState: IndexUiState;
    onClose: () => void;
    getSearchPageURL?: (nextUiState: IndexUiState) => string;
  }) {
    if ((hitsPerPage ?? 0) < 1) {
      return null;
    }

    return (
      <div className="ais-ChatToolSearchIndexCarouselHeader">
        <div className="ais-ChatToolSearchIndexCarouselHeaderResults">
          {nbHits && (
            <div className="ais-ChatToolSearchIndexCarouselHeaderCount">
              {hitsPerPage ?? 0} of {nbHits} result
              {nbHits > 1 ? 's' : ''}
            </div>
          )}
          {showViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!query) return;

                const nextUiState = { ...indexUiState, query };

                // If no main search page URL or we are on the search page, just update the state
                if (
                  !getSearchPageURL ||
                  (getSearchPageURL &&
                    new URL(getSearchPageURL(nextUiState)).pathname ===
                      window.location.pathname)
                ) {
                  setIndexUiState(nextUiState);
                  onClose();
                  return;
                }

                // Navigate to different page
                window.location.href = getSearchPageURL(nextUiState);
              }}
              className="ais-ChatToolSearchIndexCarouselHeaderViewAll"
            >
              View all
              <ArrowRightIconComponent createElement={h} />
            </Button>
          )}
        </div>

        {(hitsPerPage ?? 0) > 2 && (
          <div className="ais-ChatToolSearchIndexCarouselHeaderScrollButtons">
            <Button
              variant="outline"
              size="sm"
              iconOnly
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
            >
              <ChevronLeftIconComponent createElement={h} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconOnly
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
            >
              <ChevronRightIconComponent createElement={h} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return {
    templates: { layout: SearchLayoutComponent },
  };
}

function createDefaultTools<
  THit extends RecordWithObjectID = RecordWithObjectID
>(
  templates: ChatTemplates<THit>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideToolsWithTemplate {
  return {
    [SearchIndexToolType]: createCarouselTool(
      true,
      templates,
      getSearchPageURL
    ),
    [RecommendToolType]: createCarouselTool(false, templates, getSearchPageURL),
  };
}

const createRenderer = <THit extends RecordWithObjectID = RecordWithObjectID>({
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
  tools: UserClientSideToolsWithTemplate;
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
      regenerate,
      stop,
    } = props;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as ChatTemplates<THit>,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const toolsForUi: ClientSideTools = {};
    Object.entries(tools).forEach(([key, tool]) => {
      toolsForUi[key] = {
        ...tool,
        addToolResult,
        layoutComponent: (
          layoutComponentProps: ClientSideToolComponentProps
        ) => {
          return (
            <TemplateComponent
              templates={tool.templates}
              rootTagName="fragment"
              templateKey="layout"
              data={layoutComponentProps}
            />
          );
        },
      };
    });

    const headerTemplateProps = prepareTemplateProps({
      defaultTemplates: {} as unknown as NonNullable<
        Required<ChatTemplates<THit>['header']>
      >,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: templates.header,
    }) as PreparedTemplateProps<ChatTemplates<THit>>;
    const headerLayoutComponent = templates.header?.layout
      ? (headerProps: ChatHeaderProps) => {
          return (
            <TemplateComponent
              {...headerTemplateProps}
              templateKey="layout"
              rootTagName="div"
              data={headerProps}
            />
          );
        }
      : undefined;
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
    const promptLayoutComponent = templates.prompt?.layout
      ? (promptProps: ChatPromptProps) => {
          return (
            <TemplateComponent
              {...promptTemplateProps}
              templateKey="layout"
              rootTagName="div"
              data={promptProps}
            />
          );
        }
      : undefined;
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

    const actionsComponent = templates.actions
      ? (actionsProps: { actions: ChatMessageActionProps[] }) => {
          return (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="actions"
              rootTagName="div"
              data={actionsProps}
            />
          );
        }
      : undefined;

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
          toggleButtonProps={{ open, onClick: () => setOpen(!open) }}
          headerComponent={headerLayoutComponent}
          promptComponent={promptLayoutComponent}
          headerProps={{
            onClose: () => setOpen(false),
            maximized,
            onToggleMaximize: () => setMaximized(!maximized),
            onClear,
            canClear: Boolean(messages?.length) && !isClearing,
            closeIconComponent: headerCloseIconComponent,
            minimizeIconComponent: headerMinimizeIconComponent,
            maximizeIconComponent: headerMaximizeIconComponent,
            titleIconComponent: headerTitleIconComponent,
            translations: headerTranslations,
          }}
          messagesProps={{
            status,
            onReload: (messageId) => regenerate({ messageId }),
            onClose: () => setOpen(false),
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
            actionsComponent,
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
            onStop: () => {
              stop();
            },
            headerComponent: promptHeaderComponent,
            footerComponent: promptFooterComponent,
            translations: promptTranslations,
          }}
        />,
        containerNode
      );
    }

    rerender();
  };
};

export type UserClientSideToolTemplates = Partial<{
  layout: TemplateWithBindEvent<ClientSideToolComponentProps>;
}>;

type UserClientSideToolWithTemplate = Omit<
  UserClientSideTool,
  'layoutComponent'
> & {
  templates: UserClientSideToolTemplates;
};
type UserClientSideToolsWithTemplate = Record<
  string,
  UserClientSideToolWithTemplate
>;

export type Tool = UserClientSideToolWithTemplate;
export type Tools = UserClientSideToolsWithTemplate;

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
       * Template to use for the chat header.
       */
      layout: Template<ChatHeaderProps>;
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
       * Template to use for the chat prompt.
       */
      layout: Template<ChatPromptProps>;
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

    /**
     * Template to use for the message actions.
     */
    actions: Template<{
      actions: ChatMessageActionProps[];
      message: ChatMessageBase;
    }>;
  }>;

type ChatWidgetParams<THit extends RecordWithObjectID = RecordWithObjectID> = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Return the URL of the main search page with the `nextUiState`.
   * This is used to navigate to the main search page when the user clicks on "View all" in the search tool.
   *
   * @example (nextUiState) => `/search?${qs.stringify(nextUiState)}`
   */
  getSearchPageURL?: (nextUiState: IndexUiState) => string;

  /**
   * Client-side tools to add to the chat
   */
  tools?: UserClientSideToolsWithTemplate;

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

const defaultTemplates: ChatTemplates = {
  item(item) {
    return JSON.stringify(item, null, 2);
  },
};

export default (function chat<
  THit extends RecordWithObjectID = RecordWithObjectID
>(widgetParams: ChatWidgetParams<THit> & ChatConnectorParams) {
  const {
    container,
    templates: userTemplates = {},
    cssClasses = {},
    resume = false,
    tools: userTools,
    getSearchPageURL,
    ...options
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const templates: ChatTemplates<THit> = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const defaultTools = createDefaultTools(templates, getSearchPageURL);

  const tools = { ...defaultTools, ...userTools };

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
      tools,
      ...options,
    }),
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
