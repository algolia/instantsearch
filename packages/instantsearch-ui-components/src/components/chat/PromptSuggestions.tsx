/** @jsx createElement */
import { createButtonComponent } from '../Button';

import type { Renderer } from '../../types';
import type { ChatStatus } from './types';

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
};

export function createPromptSuggestionsComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  const Button = createButtonComponent({ createElement });

  return function PromptSuggestions({
    status,
    suggestions,
    onSuggestionClick,
    loadingComponent: LoadingComponent,
  }: PromptSuggestionsProps) {
    if (status === 'streaming') {
      return LoadingComponent ? (
        <LoadingComponent />
      ) : (
        <span>Loading suggestions...</span>
      );
    }

    if (status === 'ready' && suggestions && suggestions.length > 0) {
      return (
        <div>
          <h3>Suggestions:</h3>

          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>
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
