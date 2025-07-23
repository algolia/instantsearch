/** @jsx createElement */
import { cx } from '../../lib';

import type { ComponentProps, Renderer } from '../../types';

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
  onClick?: (event: any, extraData?: any) => void;
};

export type ChatMessageProps = Omit<ComponentProps<'article'>, 'content'> & {
  /**
   * The content of the message
   */
  content: JSX.Element;
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
  /**
   * Extra data to pass to action handlers
   */
  actionsExtraData?: any;
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
      avatarComponent: AvatarComponent,
      side = 'left',
      variant = 'subtle',
      actions = [],
      autoHideActions = false,
      leadingComponent: LeadingComponent,
      actionsComponent: ActionsComponent,
      footerComponent: FooterComponent,
      actionsExtraData,
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
              onClick={(event) => action.onClick?.(event, actionsExtraData)}
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
            <div className={cx(cssClasses.message)}>{content}</div>

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
