/** @jsx createElement */
import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import type { Renderer } from '../../types';
import type { ChatStatus } from './types';

export type PromptSuggestionsClassNames = {
  /**
   * Class name for the root element
   */
  root?: string;
  /**
   * Class name for the header element
   */
  header?: string;
  /**
   * Class name for the suggestions list
   */
  suggestionsList?: string;
  /**
   * Class name for each suggestion item
   */
  suggestionItem?: string;
  /**
   * Class name for the loading state
   */
  loading?: string;
};

export type PromptSuggestionsTranslations = {
  /**
   * Text for the suggestions header
   */
  suggestionsHeaderText?: string;
};

export type PromptSuggestionsProps = {
  /**
   * Status of the chat
   */
  status: ChatStatus;
  /**
   * List of prompt suggestions
   */
  suggestions?: string[];
  /**
   * Callback when a suggestion is clicked
   */
  onSuggestionClick?: (suggestion: string) => void;
  /**
   * Custom loading component
   */
  loadingComponent?: () => JSX.Element;
  /**
   * Optional class names
   */
  classNames?: PromptSuggestionsClassNames;
  /**
   * Optional translations
   */
  translations?: PromptSuggestionsTranslations;
};

export function createPromptSuggestionsComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  const Button = createButtonComponent({ createElement });

  return function PromptSuggestions(userProps: PromptSuggestionsProps) {
    const {
      status,
      suggestions,
      onSuggestionClick,
      loadingComponent: LoadingComponent,
      classNames = {},
      translations: userTranslations,
    } = userProps;

    const cssClasses = {
      root: cx('ais-PromptSuggestions', classNames.root),
      header: cx('ais-PromptSuggestions-header', classNames.header),
      suggestionsList: cx(
        'ais-PromptSuggestions-list',
        classNames.suggestionsList
      ),
      suggestionItem: cx(
        'ais-PromptSuggestions-item',
        classNames.suggestionItem
      ),
      loading: cx('ais-PromptSuggestions-loading', classNames.loading),
    };

    const translations: Required<PromptSuggestionsTranslations> = {
      suggestionsHeaderText: 'Suggestions',
      ...userTranslations,
    };

    if (status === 'streaming') {
      return LoadingComponent ? (
        <LoadingComponent />
      ) : (
        <span className={cssClasses.loading}>Loading suggestions...</span>
      );
    }

    if (status === 'ready' && suggestions && suggestions.length > 0) {
      return (
        <div className={cssClasses.root}>
          <h3 className={cssClasses.header}>
            {translations.suggestionsHeaderText}
          </h3>

          <ul className={cssClasses.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <li key={index} className={cssClasses.suggestionItem}>
                <Button
                  variant="ghost"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  {suggestion}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  };
}
