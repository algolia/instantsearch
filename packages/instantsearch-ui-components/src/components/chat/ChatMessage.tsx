/** @jsx createElement */
import { compiler } from 'markdown-to-jsx';

import { cx } from '../../lib';

import type { ComponentProps, Renderer } from '../../types';
import type { ChatMessageBase } from './types';

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

export type Tools = Array<{
  type: string;
  component: (props: {
    message: ChatMessageBase['parts'][number];
    indexUiState: object;
    setIndexUiState: (state: object) => void;
  }) => JSX.Element;
  onToolCall?: (a: any) => void;
}>;

export type ChatMessageProps = Omit<ComponentProps<'article'>, 'content'> & {
  /**
   * The content of the message
   */
  content: JSX.Element;
  /**
   * The message object associated with this chat message
   */
  message: ChatMessageBase;
  /**
   * Avatar component to render
   */
  avatarComponent?: () => JSX.Element;
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
   * Leading content (replaces avatar if provided)
   */
  leadingComponent?: () => JSX.Element;
  /**
   * Custom actions renderer
   */
  actionsComponent?: (props: {
    actions: ChatMessageActionProps[];
  }) => JSX.Element;
  /**
   * Footer content
   */
  footerComponent?: () => JSX.Element;
  indexUiState: object;
  setIndexUiState: (state: object) => void;
  /**
   * Array of tools available for the assistant (for tool messages)
   */
  tools?: Tools;
  /**
   * Optional handler to refine the search query (for tool actions)
   */
  handleRefine?: (value: string) => void;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatMessageClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatMessageTranslations>;
};

function createDefaultActionIconComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <circle cx="8" cy="3" r="2" fill="currentColor" />
      <circle cx="8" cy="13" r="2" fill="currentColor" />
    </svg>
  );
}

export function createChatMessageComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function ChatMessage(userProps: ChatMessageProps) {
    const {
      classNames = {},
      content,
      message,
      avatarComponent: AvatarComponent,
      side = 'left',
      variant = 'subtle',
      actions = [],
      autoHideActions = false,
      handleRefine,
      leadingComponent: LeadingComponent,
      actionsComponent: ActionsComponent,
      footerComponent: FooterComponent,
      tools = [],
      indexUiState,
      setIndexUiState,
      translations: userTranslations,
      ...props
    } = userProps;

    const translations: Required<ChatMessageTranslations> = {
      messageLabel: 'Message',
      actionsLabel: 'Message actions',
      ...userTranslations,
    };

    const hasLeading = Boolean(AvatarComponent || LeadingComponent);
    const hasActions = Boolean(actions.length > 0 || ActionsComponent);

    const cssClasses: ChatMessageClassNames = {
      root: cx(
        'ais-ChatMessage',
        `ais-ChatMessage--${side}`,
        `ais-ChatMessage--${variant}`,
        hasLeading && 'ais-ChatMessage--with-leading',
        hasActions && 'ais-ChatMessage--with-actions',
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

    const DefaultActionIcon = createDefaultActionIconComponent;

    function renderAssistantPart(
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
      if (part.type.startsWith('tool-')) {
        const tool = tools.find((t) => t.type === part.type);
        if (tool) {
          const ToolComponent = tool.component;
          return (
            <div
              key={`${message.id}-${index}`}
              className="ais-ChatMessage-tool"
            >
              <ToolComponent
                message={part}
                indexUiState={indexUiState}
                setIndexUiState={setIndexUiState}
              />
            </div>
          );
        }
      }
      return (
        <pre key={`${message.id}-${index}`} className="ais-ChatMessage-code">
          {JSON.stringify(part)}
        </pre>
      );
    }

    const Actions = () => {
      if (ActionsComponent) {
        return <ActionsComponent actions={actions} />;
      }

      return (
        <Fragment>
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              className="ais-ChatMessage-action"
              disabled={action.disabled}
              title={action.title}
              onClick={() => action.onClick?.(message)}
            >
              {action.icon ? (
                <action.icon />
              ) : (
                <DefaultActionIcon createElement={createElement} />
              )}
            </button>
          ))}
        </Fragment>
      );
    };

    return (
      <article
        {...props}
        className={cx(cssClasses.root, props.className)}
        aria-label={translations.messageLabel}
      >
        <div className={cx(cssClasses.container)}>
          {hasLeading && (
            <div className={cx(cssClasses.leading)}>
              {LeadingComponent ? (
                <LeadingComponent />
              ) : (
                AvatarComponent && <AvatarComponent />
              )}
            </div>
          )}

          <div className={cx(cssClasses.content)}>
            <div className={cx(cssClasses.message)}>
              {message.role === 'assistant'
                ? message.parts.map(renderAssistantPart)
                : message.parts.map(renderAssistantPart)}
            </div>

            {hasActions && (
              <div
                className={cx(cssClasses.actions)}
                aria-label={translations.actionsLabel}
              >
                <Actions />
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
