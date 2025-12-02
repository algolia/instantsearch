/** @jsx h */

import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createChatComponent,
  createChatMessageLoaderComponent,
  createSuggestedFiltersComponent,
} from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';
import { useMemo } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';
import connectChat from '../../connectors/chat/connectChat';
import { SearchIndexToolType, RecommendToolType } from '../../lib/chat';
import { prepareTemplateProps } from '../../lib/templating';
import { useStickToBottom } from '../../lib/useStickToBottom';
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
  ChatMessageProps,
  ChatMessagesTranslations,
  ChatPromptProps,
  ChatPromptTranslations,
  ChatStatus,
  ChatToggleButtonProps,
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

  const SuggestedFilters = createSuggestedFiltersComponent({
    createElement: h,
  });

  const ChatMessageLoader = createChatMessageLoaderComponent({
    createElement: h,
  });

  function SearchLayoutComponent({
    message,
    indexUiState,
    toolState,
    setIndexUiState,
    onClose,
    sendMessage,
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
          suggestedFilters?: Array<{
            label: string;
            attribute: string;
            value: string;
            count: number;
          }>;
        }
      | undefined;

    const items = output?.hits || [];
    const suggestedFilters = output?.suggestedFilters || [];

    const handleFilterClick = (
      attribute: string,
      value: string,
      isRefined: boolean
    ) => {
      const action = isRefined ? 'Remove' : 'Apply';
      sendMessage({
        text: `${action} the ${attribute} filter: ${value}`,
      });
    };

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

    if (toolState === 'input-streaming') {
      return (
        <ChatMessageLoader translations={{ loaderText: 'Searching...' }} />
      );
    }

    const carouselElement = carousel({
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

    return (
      <Fragment>
        {carouselElement}
        {suggestedFilters.length > 0 && (
          <SuggestedFilters
            filters={suggestedFilters}
            onFilterClick={handleFilterClick}
            indexUiState={indexUiState}
          />
        )}
      </Fragment>
    );
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
              {hitsPerPage ?? 0} of {nbHits.toLocaleString()} result
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
              <ArrowRightIcon createElement={h} />
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
              <ChevronLeftIcon createElement={h} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconOnly
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
            >
              <ChevronRightIcon createElement={h} />
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

type ChatWrapperProps = {
  cssClasses: ChatCSSClasses;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatMessages: ChatMessageBase[];
  indexUiState: IndexUiState;
  setIndexUiState: IndexWidget['setIndexUiState'];
  chatStatus: ChatStatus;
  chatInput: ChatRenderState['input'];
  setChatInput: ChatRenderState['setInput'];
  sendMessage: ChatRenderState['sendMessage'];
  regenerate: ChatRenderState['regenerate'];
  stop: ChatRenderState['stop'];
  isClearing: boolean;
  clearMessages: () => void;
  onClearTransitionEnd: () => void;
  toolsForUi: ClientSideTools;
  toggleButtonProps: {
    layoutComponent: ComponentProps<typeof Chat>['toggleButtonComponent'];
    iconComponent: ComponentProps<
      typeof Chat
    >['toggleButtonProps']['toggleIconComponent'];
  };
  headerProps: {
    layoutComponent: ComponentProps<typeof Chat>['headerComponent'];
    closeIconComponent: ChatHeaderProps['closeIconComponent'];
    minimizeIconComponent: ChatHeaderProps['minimizeIconComponent'];
    maximizeIconComponent: ChatHeaderProps['maximizeIconComponent'];
    titleIconComponent: ChatHeaderProps['titleIconComponent'];
    translations: Partial<ChatHeaderTranslations>;
  };
  messagesProps: {
    loaderComponent:
      | ((props: ChatMessageLoaderProps) => JSX.Element)
      | undefined;
    errorComponent: ((props: ChatMessageErrorProps) => JSX.Element) | undefined;
    actionsComponent:
      | ((props: { actions: ChatMessageActionProps[] }) => JSX.Element)
      | undefined;
    assistantMessageProps: {
      leadingComponent: ChatMessageProps['leadingComponent'];
      footerComponent: ChatMessageProps['footerComponent'];
    };
    userMessageProps: {
      leadingComponent: ChatMessageProps['leadingComponent'];
      footerComponent: ChatMessageProps['footerComponent'];
    };
    translations: Partial<ChatMessagesTranslations>;
    messageTranslations: Partial<ChatMessageProps['translations']>;
  };
  promptProps: {
    layoutComponent: ComponentProps<typeof Chat>['promptComponent'];
    headerComponent: ChatPromptProps['headerComponent'];
    footerComponent: ChatPromptProps['footerComponent'];
    translations: Partial<ChatPromptTranslations>;
    promptRef: { current: HTMLTextAreaElement | null };
  };
  state: ReturnType<typeof createLocalState>;
};

function ChatWrapper({
  cssClasses,
  chatOpen,
  setChatOpen,
  chatMessages,
  indexUiState,
  setIndexUiState,
  chatStatus,
  chatInput,
  setChatInput,
  sendMessage,
  regenerate,
  stop,
  isClearing,
  clearMessages,
  onClearTransitionEnd,
  toolsForUi,
  toggleButtonProps,
  headerProps,
  messagesProps,
  promptProps,
  state,
}: ChatWrapperProps) {
  const { scrollRef, contentRef, scrollToBottom, isAtBottom } =
    useStickToBottom({
      initial: 'smooth',
      resize: 'smooth',
    });

  state.init();

  const [maximized, setMaximized] = state.use(false);

  return (
    <Chat
      classNames={cssClasses}
      open={chatOpen}
      maximized={maximized}
      toggleButtonComponent={toggleButtonProps.layoutComponent}
      toggleButtonProps={{
        open: chatOpen,
        onClick: () => setChatOpen(!chatOpen),
        toggleIconComponent: toggleButtonProps.iconComponent,
      }}
      headerComponent={headerProps.layoutComponent}
      promptComponent={promptProps.layoutComponent}
      headerProps={{
        onClose: () => setChatOpen(false),
        maximized,
        onToggleMaximize: () => setMaximized(!maximized),
        onClear: clearMessages,
        canClear: Boolean(chatMessages?.length) && !isClearing,
        closeIconComponent: headerProps.closeIconComponent,
        minimizeIconComponent: headerProps.minimizeIconComponent,
        maximizeIconComponent: headerProps.maximizeIconComponent,
        titleIconComponent: headerProps.titleIconComponent,
        translations: headerProps.translations,
      }}
      messagesProps={{
        status: chatStatus,
        onReload: (messageId) => regenerate({ messageId }),
        onClose: () => setChatOpen(false),
        sendMessage,
        messages: chatMessages,
        indexUiState,
        isClearing,
        onClearTransitionEnd,
        isScrollAtBottom: isAtBottom,
        scrollRef,
        contentRef,
        onScrollToBottom: scrollToBottom,
        setIndexUiState,
        tools: toolsForUi,
        loaderComponent: messagesProps.loaderComponent,
        errorComponent: messagesProps.errorComponent,
        actionsComponent: messagesProps.actionsComponent,
        assistantMessageProps: messagesProps.assistantMessageProps,
        userMessageProps: messagesProps.userMessageProps,
        translations: messagesProps.translations,
        messageTranslations: messagesProps.messageTranslations,
      }}
      promptProps={{
        promptRef: promptProps.promptRef,
        status: chatStatus,
        value: chatInput,
        onInput: (event) => {
          setChatInput((event.currentTarget as HTMLInputElement).value);
        },
        onSubmit: () => {
          sendMessage({ text: chatInput });
          setChatInput('');
        },
        onStop: () => {
          stop();
        },
        headerComponent: promptProps.headerComponent,
        footerComponent: promptProps.footerComponent,
        translations: promptProps.translations,
      }}
    />
  );
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
  const promptRef = { current: null as HTMLTextAreaElement | null };

  // eslint-disable-next-line complexity
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
      setOpen,
      status,
      error,
      regenerate,
      stop,
      isClearing,
      clearMessages,
      onClearTransitionEnd,
      tools: toolsFromConnector,
    } = props;

    if (__DEV__ && error) {
      throw error;
    }

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as ChatTemplates<THit>,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const toolsForUi: ClientSideTools = {};
    Object.entries(toolsFromConnector).forEach(([key, connectorTool]) => {
      const widgetTool = tools[key];

      toolsForUi[key] = {
        ...connectorTool,
        ...(widgetTool?.templates?.layout && {
          layoutComponent: (
            layoutComponentProps: ClientSideToolComponentProps
          ) => {
            return (
              <TemplateComponent
                templates={widgetTool.templates}
                rootTagName="fragment"
                templateKey="layout"
                data={layoutComponentProps}
              />
            );
          },
        }),
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

    const assistantMessageTemplateProps = prepareTemplateProps({
      defaultTemplates: {} as unknown as NonNullable<
        Required<ChatTemplates<THit>['assistantMessage']>
      >,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: templates.assistantMessage,
    }) as PreparedTemplateProps<ChatTemplates<THit>>;
    const assistantMessageLeadingComponent = templates.assistantMessage?.leading
      ? () => {
          return (
            <TemplateComponent
              {...assistantMessageTemplateProps}
              templateKey="leading"
              rootTagName="fragment"
            />
          );
        }
      : undefined;
    const assistantMessageFooterComponent = templates.assistantMessage?.footer
      ? () => {
          return (
            <TemplateComponent
              {...assistantMessageTemplateProps}
              templateKey="footer"
              rootTagName="fragment"
            />
          );
        }
      : undefined;

    const messageTranslations = getDefinedProperties({
      actionsLabel: templates.message?.actionsLabelText,
      messageLabel: templates.message?.messageLabelText,
    });

    const userMessageTemplateProps = prepareTemplateProps({
      defaultTemplates: {} as unknown as NonNullable<
        Required<ChatTemplates<THit>['userMessage']>
      >,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: templates.userMessage,
    }) as PreparedTemplateProps<ChatTemplates<THit>>;
    const userMessageLeadingComponent = templates.userMessage?.leading
      ? () => {
          return (
            <TemplateComponent
              {...userMessageTemplateProps}
              templateKey="leading"
              rootTagName="fragment"
            />
          );
        }
      : undefined;
    const userMessageFooterComponent = templates.userMessage?.footer
      ? () => {
          return (
            <TemplateComponent
              {...userMessageTemplateProps}
              templateKey="footer"
              rootTagName="fragment"
            />
          );
        }
      : undefined;

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

    const toggleButtonTemplateProps = prepareTemplateProps({
      defaultTemplates: {} as unknown as NonNullable<
        Required<ChatTemplates<THit>['toggleButton']>
      >,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: templates.toggleButton,
    }) as PreparedTemplateProps<ChatTemplates<THit>>;
    const toggleButtonLayoutComponent = templates.toggleButton?.layout
      ? (toggleButtonProps: ChatToggleButtonProps) => {
          return (
            <TemplateComponent
              {...toggleButtonTemplateProps}
              templateKey="layout"
              rootTagName="button"
              data={toggleButtonProps}
            />
          );
        }
      : undefined;
    const toggleButtonIconComponent = templates.toggleButton?.icon
      ? ({ isOpen }: { isOpen: boolean }) => {
          return (
            <TemplateComponent
              {...toggleButtonTemplateProps}
              templateKey="icon"
              rootTagName="span"
              data={{ isOpen }}
            />
          );
        }
      : undefined;

    state.subscribe(rerender);

    function rerender() {
      render(
        <ChatWrapper
          cssClasses={cssClasses}
          chatOpen={open}
          setChatOpen={setOpen}
          chatMessages={messages}
          indexUiState={indexUiState}
          setIndexUiState={setIndexUiState}
          chatStatus={status}
          chatInput={input}
          setChatInput={setInput}
          sendMessage={sendMessage}
          regenerate={regenerate}
          stop={stop}
          isClearing={isClearing}
          clearMessages={clearMessages}
          onClearTransitionEnd={onClearTransitionEnd}
          toolsForUi={toolsForUi}
          toggleButtonProps={{
            layoutComponent: toggleButtonLayoutComponent,
            iconComponent: toggleButtonIconComponent,
          }}
          headerProps={{
            layoutComponent: headerLayoutComponent,
            closeIconComponent: headerCloseIconComponent,
            minimizeIconComponent: headerMinimizeIconComponent,
            maximizeIconComponent: headerMaximizeIconComponent,
            titleIconComponent: headerTitleIconComponent,
            translations: headerTranslations,
          }}
          messagesProps={{
            loaderComponent: messagesLoaderComponent,
            errorComponent: messagesErrorComponent,
            actionsComponent,
            assistantMessageProps: {
              leadingComponent: assistantMessageLeadingComponent,
              footerComponent: assistantMessageFooterComponent,
            },
            userMessageProps: {
              leadingComponent: userMessageLeadingComponent,
              footerComponent: userMessageFooterComponent,
            },
            translations: messagesTranslations,
            messageTranslations,
          }}
          promptProps={{
            layoutComponent: promptLayoutComponent,
            headerComponent: promptHeaderComponent,
            footerComponent: promptFooterComponent,
            translations: promptTranslations,
            promptRef,
          }}
          state={state}
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
     * Templates to use for each message.
     */
    message: Partial<{
      /**
       * Label for the message actions
       */
      actionsLabelText?: string;
      /**
       * Label for the message container
       */
      messageLabelText?: string;
    }>;

    /**
     * Templates to use for the assistant message.
     */
    assistantMessage: Partial<{
      /**
       * Template to use for the assistant message leading content.
       */
      leading: Template;
      /**
       * Template to use for the assistant message footer content.
       */
      footer: Template;
    }>;

    /**
     * Templates to use for the user message.
     */
    userMessage: Partial<{
      /**
       * Template to use for the user message leading content.
       */
      leading: Template;
      /**
       * Template to use for the user message footer content.
       */
      footer: Template;
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
     * Templates to use for the toggle button.
     */
    toggleButton: Partial<{
      /**
       * Template to use for the toggle button layout.
       */
      layout: Template<ChatToggleButtonProps>;
      /**
       * Template to use for the toggle button icon.
       */
      icon: Template<{ isOpen: boolean }>;
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
