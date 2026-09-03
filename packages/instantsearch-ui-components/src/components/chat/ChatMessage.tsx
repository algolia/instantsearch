/** @jsx createElement */
import { compiler } from 'markdown-to-jsx';

import { cx, startsWith } from '../../lib';
import {
  findTool,
  isPartTextEmpty,
  isReasoningPartActive,
} from '../../lib/utils/chat';
import { collectChatRecords } from '../../lib/utils/chatRecords';
import { createButtonComponent } from '../Button';

import {
  createChatMessageReasoningComponent,
  type ChatMessageReasoningClassNames,
  type ChatMessageReasoningPart,
  type ChatMessageReasoningTranslations,
} from './ChatMessageReasoning';
import { MenuIcon } from './icons';

import type {
  AddToolResult,
  AddToolResultWithOutput,
  ChatComponentContext,
  ChatComponentPropsWithContext,
  ChatMessageBase,
  ChatStatus,
  ChatToolMessage,
  ClientSideTool,
  ClientSideToolContext,
  ClientSideTools,
  ReasoningUIPart,
  TextUIPart,
} from './types';
import type { ChatRecordsStore } from '../../lib/utils/chatRecords';
import type {
  ComponentProps,
  Renderer,
  SendEventForHits,
  VNode,
} from '../../types';

/**
 * The root-level props tool layout components received before everything moved
 * under `context`. Passed alongside `context` so components written against the
 * previous API keep working. Remove together with
 * `DeprecatedClientSideToolRootProps` in the next major.
 */
function getDeprecatedToolRootProps<TMessage extends ChatMessageBase>(
  context: ClientSideToolContext<TMessage>
) {
  return {
    message: context.message,
    messages: context.messages,
    records: context.records,
    insightsEventContext: context.insightsEventContext,
    status: context.status,
    indexUiState: context.indexUiState,
    setIndexUiState: context.setIndexUiState,
    onClose: context.onClose,
    addToolResult: context.addToolResult,
    applyFilters: context.applyFilters,
    sendEvent: context.sendEvent,
  };
}

type MessageScopedClientSideTool = ClientSideTool & {
  '~addToolResultForMessage'?: (
    message: ChatMessageBase,
    params: Parameters<AddToolResult>[0]
  ) => ReturnType<AddToolResult>;
};

export type ChatMessageSide = 'left' | 'right';
export type ChatMessageVariant = 'neutral' | 'subtle';

export type ChatMessageTranslations = {
  /**
   * The label for the message
   */
  messageLabel: string;
  /**
   * The label for message actions
   */
  actionsLabel: string;
} & Partial<ChatMessageReasoningTranslations>;

export type ChatMessageClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the container element
   */
  container: string | string[];
  /**
   * Class names to apply to the leading element (avatar area)
   */
  leading: string | string[];
  /**
   * Class names to apply to the content wrapper
   */
  content: string | string[];
  /**
   * Class names to apply to the message element
   */
  message: string | string[];
  /**
   * Class names to apply to the actions container
   */
  actions: string | string[];
  /**
   * Class names to apply to the footer element
   */
  footer: string | string[];
} & Partial<ChatMessageReasoningClassNames>;

export type ChatMessageActionProps = {
  /**
   * The icon to display in the action button
   */
  icon?: () => JSX.Element;
  /**
   * The title/tooltip for the action
   */
  title?: string;
  /**
   * Whether the action is disabled
   */
  disabled?: boolean;
  /**
   * Click handler for the action
   */
  onClick?: (message: ChatMessageBase) => void;
};

export type ChatMessageTextComponentProps<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = {
  /**
   * The text part to render
   */
  part: TextUIPart;
  /**
   * The message containing the text part
   */
  message: TMessage;
  /**
   * The full conversation, when available
   */
  messages?: TMessage[];
  /**
   * The current chat status
   */
  status: ChatStatus;
  /**
   * The text part's index in the full `message.parts` array
   */
  partIndex: number;
};

export type { ChatMessageReasoningPart } from './ChatMessageReasoning';

export type ChatMessageReasoningComponentProps<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = ChatComponentPropsWithContext<
  {
    /**
     * The reasoning part to render
     */
    part: ReasoningUIPart;
    /**
     * The reasoning part's index in the full `message.parts` array
     */
    partIndex: number;
    /**
     * Whether this reasoning part is currently being produced
     */
    isStreaming: boolean;
    /**
     * The message containing the reasoning part
     */
    message: TMessage;
  },
  TMessage
>;

export type ChatMessageProps<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = ComponentProps<'article'> & {
  /**
   * The message object associated with this chat message
   */
  message: TMessage;
  /**
   * The side of the message
   */
  side?: ChatMessageSide;
  /**
   * The variant of the message
   */
  variant?: ChatMessageVariant;
  /**
   * Array of action buttons
   */
  actions?: ChatMessageActionProps[];
  /**
   * Whether to auto-hide actions until hover
   */
  autoHideActions?: boolean;
  /**
   * Leading content
   */
  leadingComponent?: () => JSX.Element;
  /**
   * Custom actions renderer
   */
  actionsComponent?: (
    props: ChatComponentPropsWithContext<{
      actions: ChatMessageActionProps[];
      message: ChatMessageBase;
    }>
  ) => JSX.Element | null;
  /**
   * Footer content
   */
  footerComponent?: () => JSX.Element;
  /**
   * Custom text part renderer
   */
  textComponent?: (
    props: ChatMessageTextComponentProps<TMessage>
  ) => JSX.Element | null;
  /**
   * Custom reasoning renderer, called once per reasoning part at that part's own
   * stream position. It changes how reasoning renders, not whether: reasoning
   * renders by default, and `showReasoning: false` suppresses this renderer
   * along with it.
   */
  reasoningComponent?: (
    props: ChatMessageReasoningComponentProps<TMessage>
  ) => JSX.Element | null;
  /**
   * The index UI state
   */
  indexUiState: object;
  /**
   * Set the index UI state
   */
  setIndexUiState: (state: object) => void;
  /**
   * The full conversation. Forwarded to tool and text components so those that
   * only receive object IDs (e.g. display results) can hydrate records from a
   * preceding search tool's hits. Defaults to `context.messages` when omitted.
   */
  messages?: TMessage[];
  /**
   * @deprecated Read `context.status` instead. Overrides `context.status` when
   * provided, for callers written against the previous API.
   */
  status?: ChatStatus;
  /**
   * @deprecated Read `context.tools` instead. Overrides `context.tools` when
   * provided, for callers written against the previous API.
   */
  tools?: ClientSideTools;
  /**
   * @deprecated Read `context.onClose` instead. Overrides `context.onClose`
   * when provided, for callers written against the previous API.
   */
  onClose?: () => void;
  /**
   * Optional suggestions element
   */
  suggestionsElement?: VNode;
  /**
   * Optional loader element, rendered under the message's parts. Set by
   * `ChatMessages` when `loaderPosition` is `message-inline`.
   */
  loaderElement?: VNode;
  /**
   * Whether to render the reasoning an agent sends. `true` by default, so
   * reasoning that arrives is shown. Pass `false` to suppress it in this
   * widget. It cannot make an agent send reasoning: whether reasoning reaches
   * the client at all is the agent's own `sendReasoning` setting.
   */
  showReasoning?: boolean;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatMessageClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatMessageTranslations>;
  /**
   * Whether to render text and reasoning parts as markdown.
   *
   * When `true` (default), they are compiled with `markdown-to-jsx` (links,
   * code blocks, emphasis, …). When `false`, they render as plain text with
   * newlines preserved — useful for user messages where the source is the
   * human's literal input and incidental markdown syntax (`*`, `_`, …)
   * shouldn't be transformed. Note that opting out means links in the output
   * are no longer clickable.
   */
  parseMarkdown?: boolean;
};

export function createChatMessageComponent({
  createElement,
  Fragment,
}: Renderer) {
  const Button = createButtonComponent({ createElement });
  const ChatMessageReasoning = createChatMessageReasoningComponent({
    createElement,
  });

  return function ChatMessage<
    TMessage extends ChatMessageBase = ChatMessageBase,
  >(
    userProps: ChatComponentPropsWithContext<
      ChatMessageProps<TMessage>,
      TMessage
    >
  ) {
    const {
      classNames = {},
      message,
      side = 'left',
      variant = 'subtle',
      actions = [],
      autoHideActions = false,
      leadingComponent: LeadingComponent,
      actionsComponent: ActionsComponent,
      footerComponent: FooterComponent,
      textComponent: TextComponent,
      reasoningComponent: ReasoningComponent,
      indexUiState,
      setIndexUiState,
      translations: userTranslations,
      suggestionsElement,
      loaderElement,
      showReasoning = true,
      parseMarkdown = true,
      messages: ownMessages,
      /* eslint-disable typescript/no-deprecated -- reading the
         deprecated aliases is the point: they are resolved into `context`
         below so callers on the previous API keep working. */
      status: ownStatus,
      tools: ownTools,
      onClose: ownOnClose,
      /* eslint-enable typescript/no-deprecated */
      context: sharedContext,
      ...props
    } = userProps;

    // Root-level overrides win over the shared context, so a caller can scope
    // these to a single message. `messages` is supported going forward; the
    // other three are deprecated aliases kept for callers written against the
    // pre-`context` API. Resolving them into one object up front means every
    // consumer below (tools, actions, text) reads consistent values.
    const context: ChatComponentContext<TMessage> = {
      ...sharedContext,
      messages: ownMessages ?? sharedContext.messages,
      status: ownStatus ?? sharedContext.status,
      tools: ownTools ?? sharedContext.tools,
      onClose: ownOnClose ?? sharedContext.onClose,
    };
    const { messages, status, tools } = context;

    const translations: Required<ChatMessageTranslations> = {
      messageLabel: 'Message',
      actionsLabel: 'Message actions',
      reasoningLabel: 'Reasoning',
      ...userTranslations,
    };

    // A message rendered without a connector-attached store falls back to
    // collecting from the conversation it was handed.
    let fallbackRecords: ChatRecordsStore | undefined;
    const getFallbackRecords = () => {
      fallbackRecords = fallbackRecords || collectChatRecords(messages);
      return fallbackRecords;
    };

    const hasLeading = Boolean(LeadingComponent);
    const isCurrentMessage =
      messages === undefined ||
      messages[messages.length - 1]?.id === message.id;

    const reasoningParts = showReasoning
      ? message.parts.reduce<ChatMessageReasoningPart[]>(
          (receivedParts, part, partIndex) => {
            if (part.type !== 'reasoning') {
              return receivedParts;
            }

            const isStreaming =
              status === 'streaming' &&
              isCurrentMessage &&
              isReasoningPartActive(message.parts, partIndex);

            if (!isStreaming && part.text.trim().length === 0) {
              return receivedParts;
            }

            receivedParts.push({ part, partIndex, isStreaming });
            return receivedParts;
          },
          []
        )
      : [];
    const firstReasoningPartIndex = reasoningParts[0]?.partIndex;
    // Keep the built-in native disclosure mounted through a temporary
    // eligibility gap so its reader-owned state survives resumed reasoning.
    const reasoningPartIndex =
      firstReasoningPartIndex ??
      (showReasoning &&
      !ReasoningComponent &&
      status === 'streaming' &&
      isCurrentMessage
        ? message.parts.findIndex((part) => part.type === 'reasoning')
        : -1);
    const isReasoningStreaming = reasoningParts.some(
      (part) => part.isStreaming
    );

    // `status` is the chat's, not the row's: gating every row on it took the
    // actions off completed answers the moment a follow-up turn started,
    // reflowing rows the turn hasn't touched. Only the row the turn is
    // producing waits for the status to settle.
    const showActions =
      Boolean(actions.length > 0 || ActionsComponent) &&
      (status === 'ready' || !isCurrentMessage);

    const cssClasses: Required<ChatMessageClassNames> = {
      root: cx(
        'ais-ChatMessage',
        `ais-ChatMessage--${side}`,
        `ais-ChatMessage--${variant}`,
        autoHideActions && 'ais-ChatMessage--auto-hide-actions',
        classNames.root
      ),
      container: cx('ais-ChatMessage-container', classNames.container),
      leading: cx('ais-ChatMessage-leading', classNames.leading),
      content: cx('ais-ChatMessage-content', classNames.content),
      message: cx('ais-ChatMessage-message', classNames.message),
      actions: cx('ais-ChatMessage-actions', classNames.actions),
      footer: cx('ais-ChatMessage-footer', classNames.footer),
      reasoning: cx('ais-ChatMessageReasoning', classNames.reasoning),
      reasoningHeader: cx(
        'ais-ChatMessageReasoning-header',
        classNames.reasoningHeader
      ),
      reasoningIcon: cx(
        'ais-ChatMessageReasoning-icon',
        classNames.reasoningIcon
      ),
      reasoningLabel: cx(
        'ais-ChatMessageReasoning-label',
        classNames.reasoningLabel
      ),
      reasoningChevron: cx(
        'ais-ChatMessageReasoning-chevron',
        classNames.reasoningChevron
      ),
      reasoningBody: cx(
        'ais-ChatMessageReasoning-body',
        classNames.reasoningBody
      ),
      reasoningText: cx(
        'ais-ChatMessageReasoning-text',
        classNames.reasoningText
      ),
    };

    function renderMessagePart(
      part: ChatMessageBase['parts'][number],
      index: number
    ) {
      if (part.type === 'step-start') {
        return null;
      }
      if (part.type === 'reasoning') {
        // A custom component renders each step where it arrived, so the rendered
        // order matches the stream. The built-in disclosure below aggregates the
        // whole message into a single row, which is why only it is placed by
        // index.
        if (ReasoningComponent) {
          const receivedPart = reasoningParts.find(
            (candidate) => candidate.partIndex === index
          );

          if (!receivedPart) {
            return null;
          }

          return (
            <Fragment key={`${message.id}-reasoning-${index}`}>
              <ReasoningComponent
                part={receivedPart.part}
                partIndex={index}
                isStreaming={receivedPart.isStreaming}
                message={message}
                context={context}
              />
            </Fragment>
          );
        }

        if (index !== reasoningPartIndex) {
          return null;
        }

        return (
          <ChatMessageReasoning
            key={`${message.id}-reasoning`}
            parts={reasoningParts}
            hidden={reasoningParts.length === 0}
            parseMarkdown={parseMarkdown}
            translations={translations}
            classNames={{
              ...cssClasses,
              reasoningIcon: cx(
                cssClasses.reasoningIcon,
                isReasoningStreaming &&
                  'ais-ChatMessageReasoning-icon--streaming'
              ),
              reasoningLabel: cx(
                cssClasses.reasoningLabel,
                isReasoningStreaming &&
                  'ais-ChatMessageReasoning-label--streaming'
              ),
            }}
          />
        );
      }
      if (part.type === 'text') {
        if (isPartTextEmpty(part)) {
          return null;
        }
        if (TextComponent) {
          return (
            <Fragment key={`${message.id}-${index}`}>
              <TextComponent
                part={part}
                message={message}
                messages={messages}
                status={status}
                partIndex={index}
              />
            </Fragment>
          );
        }
        if (!parseMarkdown) {
          // Render the literal text. The `ais-ChatMessage-text` class applies
          // `white-space: pre-wrap` to preserve the newlines that markdown
          // would otherwise collapse, and streaming deltas append cleanly
          // because there's no parser state to get into a half-parsed entity.
          // Wrapped in a `<p>` to keep some structure for screen readers
          // (markdown produces semantic elements; a bare text node would not).
          return (
            <p key={`${message.id}-${index}`} className="ais-ChatMessage-text">
              {part.text}
            </p>
          );
        }
        const markdown = compiler(part.text, {
          createElement: createElement as any,
          disableParsingRawHTML: true,
        });
        return <span key={`${message.id}-${index}`}>{markdown}</span>;
      }
      if (startsWith(part.type, 'tool-')) {
        const tool = findTool(part.type, tools) as
          | MessageScopedClientSideTool
          | undefined;

        if (
          tool?.shouldRender?.({
            ...context,
            message: part as ChatToolMessage,
            parentMessage: message,
          }) === false
        ) {
          return null;
        }

        if (tool) {
          const ToolLayoutComponent = tool.layoutComponent;
          const toolMessage = part as ChatToolMessage;

          const boundAddToolResult: AddToolResultWithOutput = (params) =>
            tool['~addToolResultForMessage']
              ? tool['~addToolResultForMessage'](message, {
                  output: params.output,
                  tool: part.type,
                  toolCallId: toolMessage.toolCallId,
                })
              : tool.addToolResult({
                  output: params.output,
                  tool: part.type,
                  toolCallId: toolMessage.toolCallId,
                });

          if (toolMessage.state === 'input-streaming' && !tool.streamInput) {
            return null;
          }

          if (!ToolLayoutComponent) {
            return toolMessage.state === 'output-error' ? (
              <div
                key={`${message.id}-${index}`}
                className="ais-ChatMessage-tool ais-ChatMessage-toolError"
              >
                {toolMessage.errorText || 'Tool call failed.'}
              </div>
            ) : null;
          }

          const toolSendEvent = tool.sendEvent || (() => {});
          const agentId = tool.insightsEventContext?.agentId;
          const sendEvent = ((
            eventType: any,
            hits?: any,
            eventName?: any,
            additionalData?: any
          ) => {
            if (
              hits === undefined &&
              eventName === undefined &&
              additionalData === undefined
            ) {
              return toolSendEvent(eventType);
            }

            return toolSendEvent(eventType, hits, eventName, {
              ...(additionalData || {}),
              queryID: 'message_' + message.id,
              ...(agentId ? { agentId } : {}),
              toolCallId: toolMessage.toolCallId,
            });
          }) as SendEventForHits;

          const toolContext: ClientSideToolContext<TMessage> = {
            ...context,
            records: tool.records || getFallbackRecords(),
            message: toolMessage,
            insightsEventContext: tool.insightsEventContext,
            indexUiState,
            setIndexUiState,
            addToolResult: boundAddToolResult,
            applyFilters: tool.applyFilters,
            sendEvent,
          };

          return (
            <div
              key={`${message.id}-${index}`}
              className="ais-ChatMessage-tool"
            >
              <ToolLayoutComponent
                {...getDeprecatedToolRootProps(toolContext)}
                context={toolContext}
              />
            </div>
          );
        }
      }
      return null;
    }

    const renderedParts = message.parts.map(renderMessagePart);
    const hasRenderedParts = renderedParts.some((part) => part != null);

    if (
      !hasRenderedParts &&
      !loaderElement &&
      !(ActionsComponent && showActions) &&
      !FooterComponent
    ) {
      return suggestionsElement ?? null;
    }

    return (
      <article
        {...props}
        className={cx(cssClasses.root, props.className)}
        aria-label={translations.messageLabel}
      >
        <div className={cx(cssClasses.container)}>
          {hasLeading && (
            <div className={cx(cssClasses.leading)}>
              {LeadingComponent && <LeadingComponent />}
            </div>
          )}

          <div className={cx(cssClasses.content)}>
            <div className={cx(cssClasses.message)}>
              {renderedParts}
              {loaderElement}
            </div>

            {suggestionsElement}

            {showActions && (
              <div
                className={cx(cssClasses.actions)}
                aria-label={translations.actionsLabel}
              >
                {ActionsComponent ? (
                  <ActionsComponent
                    actions={actions}
                    message={message}
                    context={context}
                  />
                ) : (
                  actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      iconOnly
                      className="ais-ChatMessage-action"
                      disabled={action.disabled}
                      aria-label={action.title}
                      onClick={() => action.onClick?.(message)}
                    >
                      {action.icon ? (
                        <action.icon />
                      ) : (
                        <MenuIcon createElement={createElement} />
                      )}
                    </Button>
                  ))
                )}
              </div>
            )}

            {FooterComponent && (
              <div className={cx(cssClasses.footer)}>
                <FooterComponent />
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };
}
