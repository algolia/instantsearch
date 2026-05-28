/** @jsx createElement */

import { createButtonComponent } from '../Button';

import type { ComponentProps, Renderer } from '../../types';

export type ChatMessageErrorTranslations = {
  /**
   * Error message text
   */
  errorMessage:
    | string
    | ((params: { errorMessage?: string }) => string);
  /**
   * New conversation button text
   */
  newConversationText: string;
};

export type ChatMessageErrorProps = ComponentProps<'article'> & {
  /**
   * Raw error message received from the API/transport layer.
   */
  errorMessage?: string;
  /**
   * Callback for reload action. Kept for backwards compatibility — does not
   * render a default button anymore. Pass it explicitly via `actions` if you
   * still want to expose a retry control.
   */
  onReload?: () => void;
  /**
   * Callback that clears the current conversation and starts a new one. When
   * provided (and no custom `actions` are passed), the component renders a
   * default "New conversation" button. This is the recommended action for
   * guardrails-style errors where retrying the same request will fail again.
   */
  onNewConversation?: () => void;
  /**
   * Custom action buttons. When provided, takes precedence over the default
   * `onNewConversation` button.
   */
  actions?: Array<ComponentProps<'button'>>;
  /**
   * Translations for error component texts
   */
  translations?: Partial<ChatMessageErrorTranslations>;
};

export function createChatMessageErrorComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  const Button = createButtonComponent({ createElement });

  return function ChatMessageError(userProps: ChatMessageErrorProps) {
    const {
      errorMessage,
      onReload: _onReload,
      onNewConversation,
      actions,
      translations: userTranslations,
      ...props
    } = userProps;
    const defaultErrorMessage =
      'Sorry, we are not able to generate a response at the moment. Please contact support.';
    const defaultNewConversationText = 'Start a new conversation';
    const errorMessageTranslation = userTranslations?.errorMessage;
    const resolvedErrorMessage =
      typeof errorMessageTranslation === 'function'
        ? errorMessageTranslation({ errorMessage })
        : errorMessageTranslation ?? defaultErrorMessage;
    const newConversationText =
      userTranslations?.newConversationText ?? defaultNewConversationText;

    const hasDefaultAction = !actions && Boolean(onNewConversation);
    const hasActions = Boolean(actions) || hasDefaultAction;

    return (
      <article
        className="ais-ChatMessageError ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
        {...props}
      >
        <div className="ais-ChatMessage-container">
          <div className="ais-ChatMessage-content">
            <div className="ais-ChatMessage-message">
              {resolvedErrorMessage}
            </div>
            {hasActions && (
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
                    onClick={() => onNewConversation?.()}
                  >
                    {newConversationText}
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
