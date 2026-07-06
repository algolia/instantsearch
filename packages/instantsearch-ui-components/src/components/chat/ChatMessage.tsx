/** @jsx createElement */
import { compiler } from 'markdown-to-jsx';

import { cx, startsWith } from '../../lib';
import { createButtonComponent } from '../Button';

import {
  createChatMessageReasoningComponent,
  type ChatMessageReasoningClassNames,
  type ChatMessageReasoningTranslations,
  type ChatMessageReasoningVisibility,
} from './ChatMessageReasoning';
import { MenuIcon } from './icons';

import type { ComponentProps, Renderer, VNode } from '../../types';
import type {
  AddToolResultWithOutput,
  ChatMessageBase,
  ChatStatus,
  ChatToolMessage,
  ClientSideTools,
} from './types';

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
};

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
};

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

export type ChatMessageProps = ComponentProps<'article'> & {
  /**
   * The message object associated with this chat message
   */
  message: ChatMessageBase;
  /**
   * The status of the message (e.g. whether it's still streaming)
   */
  status: ChatStatus;
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
  actionsComponent?: (props: {
    actions: ChatMessageActionProps[];
    message: ChatMessageBase;
  }) => JSX.Element | null;
  /**
   * Footer content
   */
  footerComponent?: () => JSX.Element;
  /**
   * The index UI state
   */
  indexUiState: object;
  /**
   * Set the index UI state
   */
  setIndexUiState: (state: object) => void;
  /**
   * The full conversation. Forwarded to tool components so those that only
   * receive object IDs (e.g. display results) can hydrate records from a
   * preceding search tool's hits.
   */
  messages?: ChatMessageBase[];
  /**
   * Close the chat
   */
  onClose: () => void;
  /**
   * Array of tools available for the assistant (for tool messages)
   */
  tools: ClientSideTools;
  /**
   * Optional suggestions element
   */
  suggestionsElement?: VNode;
  /**
   * Whether to render `reasoning` UI parts via `<ChatMessageReasoning>`.
   * Off by default - enable explicitly when the backend emits reasoning
   * summaries / extended thinking and you want to surface them.
   */
  showReasoning?: boolean;
  /**
   * Visibility strategy for the reasoning panel.
   * - `collapsed` (default): closed, user can expand.
   * - `expanded`: always open.
   * - `auto`: open while streaming, collapsible afterwards.
   * - `hidden`: do not render reasoning even if parts exist.
   */
  reasoningVisibility?: ChatMessageReasoningVisibility;
  /**
   * Injectable strings for the reasoning panel (title, toggle label).
   * Forwarded to `<ChatMessageReasoning>`.
   */
  reasoningTranslations?: Partial<ChatMessageReasoningTranslations>;
  /**
   * Optional class names for the reasoning panel. Forwarded to
   * `<ChatMessageReasoning>`.
   */
  reasoningClassNames?: Partial<ChatMessageReasoningClassNames>;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatMessageClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatMessageTranslations>;
  /**
   * Whether to render text parts as markdown.
   *
   * When `true` (default), text parts are compiled with `markdown-to-jsx`
   * (links, code blocks, emphasis, …). When `false`, text parts render as
   * plain text with newlines preserved — useful for user messages where the
   * source is the human's literal input and incidental markdown syntax (`*`,
   * `_`, …) shouldn't be transformed. Note that opting out means links in the
   * output are no longer clickable.
   */
  parseMarkdown?: boolean;
};

// Keep in sync with packages/instantsearch.js/src/lib/chat/index.ts
const SearchIndexToolType = 'algolia_search_index';

export function createChatMessageComponent({
  createElement,
  Fragment,
}: Renderer) {
  const Button = createButtonComponent({ createElement });
  const ChatMessageReasoning = createChatMessageReasoningComponent({
    createElement,
    Fragment,
  });

  return function ChatMessage(userProps: ChatMessageProps) {
    const {
      classNames = {},
      message,
      status,
      side = 'left',
      variant = 'subtle',
      actions = [],
      autoHideActions = false,
      leadingComponent: LeadingComponent,
      actionsComponent: ActionsComponent,
      footerComponent: FooterComponent,
      tools = {},
      indexUiState,
      setIndexUiState,
      messages,
      onClose,
      translations: userTranslations,
      suggestionsElement,
      showReasoning = false,
      reasoningVisibility = 'collapsed',
      reasoningTranslations,
      reasoningClassNames,
      parseMarkdown = true,
      ...props
    } = userProps;

    const translations: Required<ChatMessageTranslations> = {
      messageLabel: 'Message',
      actionsLabel: 'Message actions',
      ...userTranslations,
    };

    const hasLeading = Boolean(LeadingComponent);

    const showActions =
      Boolean(actions.length > 0 || ActionsComponent) && status === 'ready';

    const cssClasses: ChatMessageClassNames = {
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
    };

    const firstReasoningIndex = showReasoning
      ? message.parts.findIndex((p) => p.type === 'reasoning')
      : -1;

    function renderMessagePart(
      part: ChatMessageBase['parts'][number],
      index: number
    ) {
      if (part.type === 'step-start') {
        return null;
      }
      if (part.type === 'reasoning') {
        if (!showReasoning) return null;
        // Render one reasoning panel total, anchored at the first reasoning
        // part. Subsequent reasoning parts are absorbed by that panel.
        if (index !== firstReasoningIndex) return null;
        return (
          <ChatMessageReasoning
            key={`${message.id}-reasoning`}
            message={message}
            visibility={reasoningVisibility}
            translations={reasoningTranslations}
            classNames={reasoningClassNames}
          />
        );
      }
      if (part.type === 'text') {
        // Back-compat shim for sessions started before the move from a
        // `<context>{...}</context>` text part to `metadata.turnContext`.
        // Safe to remove once existing sessionStorage transcripts have
        // rolled over (~2 weeks after release).
        if (
          part.text.startsWith('<context>') &&
          part.text.endsWith('</context>')
        ) {
          return null;
        }
        if (!parseMarkdown) {
          // Render the literal text. The `ais-ChatMessage-text` class applies
          // `white-space: pre-wrap` to preserve the newlines that markdown
          // would otherwise collapse, and streaming deltas append cleanly
          // because there's no parser state to get into a half-parsed entity.
          // Wrapped in a `<p>` to keep some structure for screen readers
          // (markdown produces semantic elements; a bare text node would not).
          return (
            <p
              key={`${message.id}-${index}`}
              className="ais-ChatMessage-text"
            >
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
        const toolName = part.type.replace('tool-', '');
        let tool = tools[toolName];

        // Compatibility shim with Algolia MCP Server search tool
        if (!tool && startsWith(toolName, `${SearchIndexToolType}_`)) {
          tool = tools[SearchIndexToolType];
        }

        const displayResultsEnabled =
          (message.metadata as { displayResultsEnabled?: boolean } | undefined)
            ?.displayResultsEnabled === true;

        if (
          displayResultsEnabled &&
          tool &&
          tool === tools[SearchIndexToolType]
        ) {
          return null;
        }

        if (tool) {
          const ToolLayoutComponent = tool.layoutComponent;
          const toolMessage = part as ChatToolMessage;

          const boundAddToolResult: AddToolResultWithOutput = (params) =>
            tool.addToolResult?.({
              output: params.output,
              tool: part.type,
              toolCallId: toolMessage.toolCallId,
            });

          if (toolMessage.state === 'input-streaming' && !tool.streamInput) {
            return null;
          }

          if (!ToolLayoutComponent) {
            return null;
          }

          return (
            <div
              key={`${message.id}-${index}`}
              className="ais-ChatMessage-tool"
            >
              <ToolLayoutComponent
                message={toolMessage}
                indexUiState={indexUiState}
                setIndexUiState={setIndexUiState}
                messages={messages}
                addToolResult={boundAddToolResult}
                applyFilters={tool.applyFilters}
                sendEvent={tool.sendEvent || (() => {})}
                onClose={onClose}
              />
            </div>
          );
        }
      }
      return null;
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
              {message.parts.map(renderMessagePart)}
            </div>

            {suggestionsElement}

            {showActions && (
              <div
                className={cx(cssClasses.actions)}
                aria-label={translations.actionsLabel}
              >
                {ActionsComponent ? (
                  <ActionsComponent actions={actions} message={message} />
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
