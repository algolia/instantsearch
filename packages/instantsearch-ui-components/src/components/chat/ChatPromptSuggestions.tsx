/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import type { ComponentProps, Renderer } from '../../types';

export type ChatPromptSuggestionsClassNames = {
  root?: string | string[];
  suggestion?: string | string[];
  skeleton?: string | string[];
  skeletonItem?: string | string[];
};

export type ChatPromptSuggestionsOwnProps = ComponentProps<'div'> & {
  /*
   * List of prompt suggestions.
   */
  suggestions?: string[];
  /*
   * Callback when a suggestion is clicked.
   */
  onSuggestionClick: (suggestion: string) => void;
  /**
   * Whether suggestions are currently being fetched. When true and
   * `suggestions` is empty, renders `skeletonCount` placeholder pills.
   */
  isLoading?: boolean;
  /**
   * Number of skeleton placeholder pills shown while loading.
   * @default 3
   */
  skeletonCount?: number;
  /**
   * Disables every pill (e.g. when a downstream chat is mid-stream).
   */
  disabled?: boolean;
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
      disabled = false,
      classNames = {},
      ...props
    } = userProps;

    return (
      <div
        {...props}
        className={cx(
          'ais-ChatPromptSuggestions',
          classNames.root,
          props.className
        )}
      >
        {isLoading && suggestions.length === 0 ? (
          <div
            className={cx(
              'ais-ChatPromptSuggestions-skeleton',
              classNames.skeleton
            )}
          >
            {[...new Array(skeletonCount)].map((_, i) => (
              <div
                key={i}
                className={cx(
                  'ais-ChatPromptSuggestions-skeletonItem',
                  classNames.skeletonItem
                )}
              />
            ))}
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <Button
              key={index}
              size="sm"
              variant="primary"
              className={cx(
                'ais-ChatPromptSuggestions-suggestion',
                classNames.suggestion
              )}
              onClick={() => onSuggestionClick(suggestion)}
              disabled={disabled}
            >
              {suggestion}
            </Button>
          ))
        )}
      </div>
    );
  };
}
