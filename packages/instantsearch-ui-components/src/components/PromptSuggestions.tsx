/** @jsx createElement */
import { cx } from '../lib';

import { createChatPromptSuggestionsComponent } from './chat/ChatPromptSuggestions';
import { SparklesIcon } from './chat/icons';

import type { Renderer } from '../types';
import type { ChatPromptSuggestionsClassNames } from './chat/ChatPromptSuggestions';

export type PromptSuggestionsClassNames = {
  root?: string | string[];
  header?: string | string[];
  headerIcon?: string | string[];
  headerTitle?: string | string[];
  suggestions?: ChatPromptSuggestionsClassNames;
  skeleton?: string | string[];
  skeletonItem?: string | string[];
};

export type PromptSuggestionsTranslations = {
  /**
   * The title to display above the suggestions.
   */
  title?: string;
};

export type PromptSuggestionsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PromptSuggestionsProps = {
  /**
   * List of prompt suggestions.
   */
  suggestions?: string[];
  /**
   * Callback when a suggestion is clicked.
   */
  onSuggestionClick: (suggestion: string) => void;
  /**
   * The status of the prompt suggestions request.
   */
  status?: PromptSuggestionsStatus;
  /**
   * Optional translations for the component.
   */
  translations?: Partial<PromptSuggestionsTranslations>;
  /**
   * Optional class names for elements.
   */
  classNames?: Partial<PromptSuggestionsClassNames>;
  /**
   * Optional title icon component.
   */
  titleIconComponent?: () => JSX.Element;
};

export function createPromptSuggestionsComponent({
  createElement,
  Fragment,
}: Renderer) {
  const ChatPromptSuggestions = createChatPromptSuggestionsComponent({
    createElement,
    Fragment,
  });

  return function PromptSuggestions(userProps: PromptSuggestionsProps) {
    const {
      suggestions = [],
      onSuggestionClick,
      status = 'ready',
      translations = {},
      classNames = {},
      titleIconComponent: TitleIconComponent,
    } = userProps;

    const { title = 'Ask a question about this product:' } = translations;

    // Don't render anything if idle
    if (status === 'idle') {
      return null;
    }

    const isLoading = status === 'loading';

    return (
      <div className={cx('ais-PromptSuggestions', classNames.root)}>
        {title && (
          <div
            className={cx('ais-PromptSuggestions-header', classNames.header)}
          >
            <span
              className={cx(
                'ais-PromptSuggestions-headerIcon',
                classNames.headerIcon
              )}
            >
              {TitleIconComponent ? (
                <TitleIconComponent />
              ) : (
                <SparklesIcon createElement={createElement} />
              )}
            </span>
            <span
              className={cx(
                'ais-PromptSuggestions-headerTitle',
                classNames.headerTitle
              )}
            >
              {title}
            </span>
          </div>
        )}
        {isLoading ? (
          <div
            className={cx(
              'ais-PromptSuggestions-skeleton',
              classNames.skeleton
            )}
          >
            <div
              className={cx(
                'ais-PromptSuggestions-skeletonItem',
                classNames.skeletonItem
              )}
            />
            <div
              className={cx(
                'ais-PromptSuggestions-skeletonItem',
                classNames.skeletonItem
              )}
            />
            <div
              className={cx(
                'ais-PromptSuggestions-skeletonItem',
                classNames.skeletonItem
              )}
            />
          </div>
        ) : (
          <ChatPromptSuggestions
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
            classNames={classNames.suggestions}
          />
        )}
      </div>
    );
  };
}
