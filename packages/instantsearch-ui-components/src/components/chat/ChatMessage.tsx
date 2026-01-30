/** @jsx createElement */
import { compiler } from 'markdown-to-jsx/react';

import { cx, startsWith } from '../../lib';
import { createButtonComponent } from '../Button';

import { MenuIcon } from './icons';

import type { ComponentProps, Renderer, VNode } from '../../types';
import type {
  AddToolResultWithOutput,
  ChatMessageBase,
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
   * Optional class names
   */
  classNames?: Partial<ChatMessageClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatMessageTranslations>;
};

export function createChatMessageComponent({ createElement }: Renderer) {
  const Button = createButtonComponent({ createElement });

  return function ChatMessage(userProps: ChatMessageProps) {
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
      tools = {},
      indexUiState,
      setIndexUiState,
      onClose,
      translations: userTranslations,
      suggestionsElement,
      ...props
    } = userProps;

    const translations: Required<ChatMessageTranslations> = {
      messageLabel: 'Message',
      actionsLabel: 'Message actions',
      ...userTranslations,
    };

    const hasLeading = Boolean(LeadingComponent);
    const hasActions = Boolean(actions.length > 0 || ActionsComponent);

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

    function renderMessagePart(
      part: ChatMessageBase['parts'][number],
      index: number
    ) {
      if (part.type === 'step-start') {
        return null;
      }
      if (part.type === 'text') {
        const markdown = compiler(part.text, {
          createElement: createElement as any,
          disableParsingRawHTML: true,
        });
        return <span key={`${message.id}-${index}`}>{markdown}</span>;
      }
      if (startsWith(part.type, 'tool-')) {
        const toolName = part.type.replace('tool-', '');
        const tool = tools[toolName];

        if (tool) {
          const ToolLayoutComponent = tool.layoutComponent;
          const toolMessage = part as ChatToolMessage;

          const boundAddToolResult: AddToolResultWithOutput = (params) =>
            tool.addToolResult?.({
              output: params.output,
              tool: part.type,
              toolCallId: toolMessage.toolCallId,
            });

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
                addToolResult={boundAddToolResult}
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

            {hasActions && (
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
