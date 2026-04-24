/** @jsx createElement */
/** @jsxFrag Fragment */

import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import { ReloadIcon } from './icons';

import type { ComponentProps, Renderer } from '../../types';

export type ChatMessageErrorVariant = 'default' | 'conversationLimit';

export type ChatMessageErrorTranslations = {
  /**
   * Error message text
   */
  errorMessage: string;
  /**
   * Retry button text
   */
  retryText: string;
  /**
   * Text for the conversation-limit action (link-style button).
   */
  conversationLimitActionLabel: string;
};

export type ChatMessageErrorProps = ComponentProps<'article'> & {
  /**
   * Presentation variant; `conversationLimit` is the emphasized alert layout
   * (bordered block, primary copy) for non-retryable cases: start a new chat
   * (thread depth, recursion, `max_output_tokens`, …), Agent Studio allowed-domains
   * / request-origin errors, etc. Optional actions depend on callbacks, not only
   * on this variant.
   */
  variant?: ChatMessageErrorVariant;
  /**
   * Callback for reload action
   */
  onReload?: () => void;
  /**
   * When `variant` is `conversationLimit`, shown as a link-style control (e.g. same handler as header Clear).
   */
  onStartNewConversation?: () => void;
  /**
   * Custom action buttons
   */
  actions?: Array<ComponentProps<'button'>>;
  /**
   * Translations for error component texts
   */
  translations?: Partial<ChatMessageErrorTranslations>;
};

export function createChatMessageErrorComponent({
  createElement,
  Fragment,
}: Pick<Renderer, 'createElement' | 'Fragment'>) {
  const Button = createButtonComponent({ createElement });

  return function ChatMessageError(userProps: ChatMessageErrorProps) {
    const {
      variant = 'default',
      onReload,
      onStartNewConversation,
      actions,
      translations: userTranslations,
      className,
      ...props
    } = userProps;
    const translations: Required<ChatMessageErrorTranslations> = {
      errorMessage:
        'Sorry, we are not able to generate a response at the moment. Please retry or contact support.',
      retryText: 'Retry',
      conversationLimitActionLabel: 'Start a new conversation',
      ...userTranslations,
    };

    const isConversationLimit = variant === 'conversationLimit';

    return (
      <article
        className={cx(
          'ais-ChatMessageError ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle',
          isConversationLimit && 'ais-ChatMessageError--conversationLimit',
          className
        )}
        {...props}
      >
        <div className="ais-ChatMessage-container">
          <div className="ais-ChatMessage-content">
            {isConversationLimit ? (
              <Fragment>
                <p className="ais-ChatMessageError-primary">
                  {translations.errorMessage}
                </p>
                {onStartNewConversation && (
                  <div className="ais-ChatMessageError-hint">
                    <button
                      type="button"
                      className="ais-ChatMessageError-link"
                      onClick={() => onStartNewConversation()}
                    >
                      {translations.conversationLimitActionLabel}
                    </button>
                  </div>
                )}
              </Fragment>
            ) : (
              <div className="ais-ChatMessage-message">
                {translations.errorMessage}
              </div>
            )}
            {(actions || (!isConversationLimit && onReload)) && (
              <div className="ais-ChatMessage-actions">
                {actions ? (
                  actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="ais-ChatMessage-action"
                      {...action}
                    >
                      {action.children}
                    </Button>
                  ))
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    className="ais-ChatMessage-errorAction"
                    onClick={() => onReload?.()}
                  >
                    <ReloadIcon createElement={createElement} />
                    {translations.retryText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };
}
