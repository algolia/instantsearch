/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import { createButtonComponent } from '../Button';

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

  return function ChatPromptSuggestions({
    suggestions = [],
    onSuggestionClick,
    classNames = {},
  }: ChatPromptSuggestionsOwnProps) {
    if (!suggestions || suggestions.length === 0) {
      return null;
    }

    return (
      <div className={cx('ais-ChatPromptSuggestions', classNames.root)}>
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            size="sm"
            variant="ghost"
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
