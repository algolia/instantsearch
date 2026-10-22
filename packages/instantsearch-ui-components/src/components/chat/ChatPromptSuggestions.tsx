/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import type { Renderer } from '../../types';

export type ChatPromptSuggestionsClassNames = {
  root?: string | string[];
  suggestion?: string | string[];
};

export type ChatPromptSuggestionsOwnProps = {
  /*
   * List of prompt suggestions.
   */
  suggestions?: string[];
  /*
   * Callback when a suggestion is clicked.
   */
  onSuggestionClick: (suggestion: string) => void;
  /**
   * Optional class names for elements
   */
  classNames?: Partial<ChatPromptSuggestionsClassNames>;
};

export function createChatPromptSuggestionsComponent({
  createElement,
}: Renderer) {
  const Button = createButtonComponent({ createElement });

  return function ChatPromptSuggestions(
    userProps: ChatPromptSuggestionsOwnProps
  ) {
    const { suggestions = [], onSuggestionClick, classNames = {} } = userProps;

    const visibleSuggestions = suggestions.filter(
      (suggestion) => suggestion.trim() !== ''
    );

    if (visibleSuggestions.length === 0) {
      return null;
    }

    return (
      <div className={cx('ais-ChatPromptSuggestions', classNames.root)}>
        {visibleSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            size="sm"
            variant="primary"
            className={cx(
              'ais-ChatPromptSuggestions-suggestion',
              classNames.suggestion
            )}
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    );
  };
}
