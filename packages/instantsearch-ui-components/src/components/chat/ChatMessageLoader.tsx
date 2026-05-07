/** @jsx createElement */

import { cx } from '../../lib';

import { LoadingSpinnerIcon } from './icons';

import type { ComponentProps, Renderer } from '../../types';

export type ChatMessageLoaderTranslations = {
  /**
   * Static text to display in the loader. Used as a fallback when no
   * `reasoningPreview` is provided.
   */
  loaderText?: string;
};

export type ChatMessageLoaderProps = ComponentProps<'article'> & {
  /**
   * Translations for loader component texts
   */
  translations?: Partial<ChatMessageLoaderTranslations>;
  /**
   * Live substitute label for the current reasoning step, e.g.
   * "Searching the catalogue". Takes precedence over `loaderText` when set.
   */
  reasoningPreview?: string;
  /**
   * Wall-clock time the model has been thinking, in ms. Drives the
   * progress hairline; when omitted, the hairline is hidden.
   */
  elapsedMs?: number;
  /**
   * Optimistic upper bound for the thinking time, in ms. Used to compute
   * the progress ratio. Defaults to 8000 ms.
   */
  expectedMs?: number;
};

export function createChatMessageLoaderComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function ChatMessageLoader(userProps: ChatMessageLoaderProps) {
    const {
      translations: userTranslations,
      reasoningPreview,
      elapsedMs,
      expectedMs = 8000,
      ...props
    } = userProps;
    const translations: Required<ChatMessageLoaderTranslations> = {
      loaderText: '',
      ...userTranslations,
    };

    const caption = reasoningPreview || translations.loaderText;
    const hasProgress = typeof elapsedMs === 'number' && elapsedMs > 0;
    const progress = hasProgress
      ? Math.max(0, Math.min(1, (elapsedMs as number) / expectedMs))
      : 0;

    return (
      <article
        {...props}
        className={cx(
          'ais-ChatMessageLoader ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle',
          reasoningPreview && 'ais-ChatMessageLoader--withPreview',
          props.className
        )}
      >
        <div className="ais-ChatMessage-container">
          <div className="ais-ChatMessage-leading">
            <div className="ais-ChatMessageLoader-spinner">
              <LoadingSpinnerIcon createElement={createElement} />
            </div>
          </div>

          <div className="ais-ChatMessage-content">
            <div className="ais-ChatMessage-message">
              {caption && (
                <div
                  className="ais-ChatMessageLoader-text"
                  // Re-trigger the slide+fade animation when the caption changes.
                  key={caption}
                  aria-live="polite"
                >
                  {caption}
                </div>
              )}
              <div className="ais-ChatMessageLoader-skeletonWrapper">
                <div className="ais-ChatMessageLoader-skeletonItem"></div>
                <div
                  className="ais-ChatMessageLoader-skeletonItem"
                  style={
                    hasProgress
                      ? // Use the second skeleton bar as a hairline progress
                        // indicator when elapsedMs is provided.
                        ({
                          '--ais-loader-progress': `${(progress * 100).toFixed(0)}%`,
                        } as Record<string, string>)
                      : undefined
                  }
                ></div>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  };
}
