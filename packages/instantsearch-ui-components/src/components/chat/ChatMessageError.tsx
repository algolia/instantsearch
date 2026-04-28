/** @jsx createElement */

import { createButtonComponent } from '../Button';

import { ReloadIcon } from './icons';

import type { ComponentProps, Renderer } from '../../types';

export type ChatMessageErrorTranslations = {
  /**
   * Error message text
   */
  errorMessage:
    | string
    | ((params: { errorMessage?: string }) => string);
  /**
   * Retry button text
   */
  retryText: string;
};

export type ChatMessageErrorProps = ComponentProps<'article'> & {
  /**
   * Raw error message received from the API/transport layer.
   */
  errorMessage?: string;
  /**
   * Callback for reload action
   */
  onReload?: () => void;
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
}: Pick<Renderer, 'createElement'>) {
  const Button = createButtonComponent({ createElement });

  return function ChatMessageError(userProps: ChatMessageErrorProps) {
    const {
      errorMessage,
      onReload,
      actions,
      translations: userTranslations,
      ...props
    } = userProps;
    const defaultErrorMessage =
      'Sorry, we are not able to generate a response at the moment. Please retry or contact support.';
    const defaultRetryText = 'Retry';
    const errorMessageTranslation = userTranslations?.errorMessage;
    const resolvedErrorMessage =
      typeof errorMessageTranslation === 'function'
        ? errorMessageTranslation({ errorMessage })
        : errorMessageTranslation || defaultErrorMessage;
    const retryText = userTranslations?.retryText || defaultRetryText;

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
            {(actions || onReload) && (
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
