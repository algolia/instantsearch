import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement } from 'react';
import { usePromptSuggestions } from 'react-instantsearch-core';

import type {
  Pragma,
  PromptSuggestionsClassNames,
  PromptSuggestionsProps as PromptSuggestionsUiProps,
  PromptSuggestionsTranslations,
} from 'instantsearch-ui-components';
import type { UsePromptSuggestionsProps } from 'react-instantsearch-core';

const PromptSuggestionsUiComponent = createPromptSuggestionsComponent({
  createElement: createElement as Pragma,
});

export type PromptSuggestionsProps = Omit<
  PromptSuggestionsUiProps,
  'suggestions' | 'onSuggestionClick' | 'status'
> &
  UsePromptSuggestionsProps & {
    /**
     * Optional class names for elements.
     */
    classNames?: Partial<PromptSuggestionsClassNames>;
    /**
     * Optional translations for the component.
     */
    translations?: Partial<PromptSuggestionsTranslations>;
  };

export function PromptSuggestions({
  agentId,
  transport,
  context,
  ...props
}: PromptSuggestionsProps) {
  const { suggestions, status, sendSuggestion } = usePromptSuggestions(
    { agentId, transport, context },
    { $$widgetType: 'ais.promptSuggestions' }
  );

  // Map connector status to UI status
  const getUiStatus = (): 'loading' | 'ready' | 'idle' => {
    if (status === 'loading') {
      return 'loading';
    }
    if (status === 'ready' && suggestions.length > 0) {
      return 'ready';
    }
    return 'idle';
  };

  return (
    <PromptSuggestionsUiComponent
      {...props}
      suggestions={suggestions}
      status={getUiStatus()}
      onSuggestionClick={sendSuggestion}
    />
  );
}
