/** @jsx createElement */

import { LoadingSpinnerIconComponent } from './icons';

import type { ComponentProps, Renderer } from '../../types';

export type ChatMessageLoaderTranslations = {
  /**
   * Text to display in the loader
   */
  loaderText?: string;
};

export type ChatMessageLoaderProps = ComponentProps<'article'> & {
  /**
   * Translations for loader component texts
   */
  translations?: Partial<ChatMessageLoaderTranslations>;
};

export function createChatMessageLoaderComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function ChatMessageLoader({
    translations: userTranslations,
    ...props
  }: ChatMessageLoaderProps) {
    const translations: Required<ChatMessageLoaderTranslations> = {
      loaderText: 'Thinking...',
      ...userTranslations,
    };

    return (
      <article
        className="ais-ChatMessageLoader ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
        {...props}
      >
        <div className="ais-ChatMessage-container">
          <div className="ais-ChatMessage-leading">
            <div className="ais-ChatMessage-loaderSpinner">
              <LoadingSpinnerIconComponent createElement={createElement} />
            </div>
          </div>

          <div className="ais-ChatMessage-content">
            <div className="ais-ChatMessage-message">
              {translations.loaderText && (
                <div className="ais-ChatMessage-loaderText">
                  {translations.loaderText}
                </div>
              )}
              <div className="ais-ChatMessage-loaderSkeletonWrapper">
                <div className="ais-ChatMessage-loaderSkeletonItem"></div>
                <div className="ais-ChatMessage-loaderSkeletonItem"></div>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  };
}
