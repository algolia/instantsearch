import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
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
  Fragment,
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
  chat,
  ...props
}: PromptSuggestionsProps) {
  const { suggestions, status, sendSuggestion } = usePromptSuggestions({
    agentId,
    transport,
    context,
    chat,
  });

  return (
    <PromptSuggestionsUiComponent
      {...props}
      suggestions={suggestions}
      status={status}
      onSuggestionClick={sendSuggestion}
    />
  );
}
