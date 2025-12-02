/** @jsx createElement */

import { createButtonComponent } from '../Button';

import { ReloadIcon } from './icons';

import type { ComponentProps, Renderer } from '../../types';

export type ChatMessageErrorTranslations = {
  /**
   * Error message text
   */
  errorMessage: string;
  /**
   * Retry button text
   */
  retryText: string;
};

export type ChatMessageErrorProps = ComponentProps<'article'> & {
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

  return function ChatMessageError({
    onReload,
    actions,
    translations: userTranslations,
    ...props
  }: ChatMessageErrorProps) {
    const translations: Required<ChatMessageErrorTranslations> = {
      errorMessage:
        'Sorry, we are not able to generate a response at the moment. Please retry or contact support.',
      retryText: 'Retry',
      ...userTranslations,
    };

    return (
      <article
        className="ais-ChatMessageError ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
        {...props}
      >
        <div className="ais-ChatMessage-container">
          <div className="ais-ChatMessage-content">
            <div className="ais-ChatMessage-message">
              {translations.errorMessage}
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
