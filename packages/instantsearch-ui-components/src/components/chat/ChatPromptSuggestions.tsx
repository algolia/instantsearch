/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import type { Renderer } from '../../types';

export type ChatPromptSuggestionsClassNames = {
  root?: string | string[];
  suggestion?: string | string[];
  skeletonItem?: string | string[];
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
   * Whether suggestions are still on their way. Renders `skeletonCount`
   * placeholder pills, and ignores clicks until loading finishes.
   */
  isLoading?: boolean;
  /**
   * Number of skeleton placeholder pills shown while loading.
   * @default 3
   */
  skeletonCount?: number;
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
    const {
      suggestions = [],
      onSuggestionClick,
      isLoading = false,
      skeletonCount = 3,
      classNames = {},
    } = userProps;

    const visibleSuggestions = suggestions.filter(
      (suggestion) => suggestion.trim() !== ''
    );

    if (visibleSuggestions.length === 0 && !isLoading) {
      return null;
    }

    return (
      <div className={cx('ais-ChatPromptSuggestions', classNames.root)}>
        {isLoading && visibleSuggestions.length === 0
          ? [...new Array(skeletonCount)].map((_, index) => (
              <div
                key={index}
                className={cx(
                  'ais-ChatPromptSuggestions-skeletonItem',
                  classNames.skeletonItem
                )}
              />
            ))
          : visibleSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                size="sm"
                variant="primary"
                className={cx(
                  'ais-ChatPromptSuggestions-suggestion',
                  classNames.suggestion
                )}
                // A half-written suggestion can't be sent. Not `disabled`,
                // which would restyle the pill mid-stream.
                onClick={() => {
                  if (isLoading) return;
                  onSuggestionClick(suggestion);
                }}
              >
                {suggestion}
              </Button>
            ))}
      </div>
    );
  };
}
