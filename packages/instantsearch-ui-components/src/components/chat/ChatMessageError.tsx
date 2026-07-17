/** @jsx createElement */

import { createButtonComponent } from '../Button';

import { ReloadIcon } from './icons';

import type { ComponentProps, Renderer } from '../../types';
import type { ChatComponentPropsWithMetadata } from './types';

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
  /**
   * Retry button text (used when `onReload` is provided and no
   * `onNewConversation` / `actions` override it).
   */
  retryText: string;
};

export type ChatMessageErrorProps = ComponentProps<'article'> & {
  /**
   * Raw error message received from the API/transport layer.
   */
  errorMessage?: string;
  /**
   * Callback for retry action. When provided (and no `actions` /
   * `onNewConversation` override it), the component renders a default
   * "Retry" button. Suitable for transient failures where the same request
   * may succeed if re-issued.
   */
  onReload?: () => void;
  /**
   * Callback that clears the current conversation and starts a new one. When
   * provided (and no custom `actions` are passed), the component renders a
   * default "Start a new conversation" button — recommended for
   * guardrails-style errors where retrying the same request will fail again.
   * Takes precedence over `onReload` when both are provided.
   */
  onNewConversation?: () => void;
  /**
   * Custom action buttons. When provided, takes precedence over both the
   * default `onNewConversation` and `onReload` buttons.
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

  return function ChatMessageError(
    userProps: ChatComponentPropsWithMetadata<ChatMessageErrorProps>
  ) {
    const {
      errorMessage,
      onReload,
      onNewConversation,
      actions,
      translations: userTranslations,
      metadata,
      ...props
    } = userProps;
    const defaultErrorMessage =
      'Sorry, we are not able to generate a response at the moment. Please contact support.';
    const defaultNewConversationText = 'Start a new conversation';
    const defaultRetryText = 'Retry';
    const errorMessageTranslation = userTranslations?.errorMessage;
    const resolvedErrorMessage =
      typeof errorMessageTranslation === 'function'
        ? errorMessageTranslation({ errorMessage })
        : errorMessageTranslation ?? defaultErrorMessage;
    const newConversationText =
      userTranslations?.newConversationText ?? defaultNewConversationText;
    const retryText = userTranslations?.retryText ?? defaultRetryText;

    // Action precedence:
    //   1. `actions` (full custom)
    //   2. `onNewConversation` (recommended for permanent / guardrail errors)
    //   3. `onReload` (legacy retry, suitable for transient failures)
    //   4. nothing
    const hasCustomActions = Boolean(actions);
    const showNewConversation = !hasCustomActions && Boolean(onNewConversation);
    const showRetry =
      !hasCustomActions && !showNewConversation && Boolean(onReload);
    const hasActions = hasCustomActions || showNewConversation || showRetry;

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
                {hasCustomActions ? (
                  actions!.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="ais-ChatMessage-action"
                      {...action}
                    >
                      {action.children}
                    </Button>
                  ))
                ) : showNewConversation ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="ais-ChatMessage-errorAction"
                    onClick={() => onNewConversation?.()}
                  >
                    {newConversationText}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    className="ais-ChatMessage-errorAction"
                    onClick={() => onReload?.()}
                  >
                    <ReloadIcon createElement={createElement} />
                    {retryText}
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
