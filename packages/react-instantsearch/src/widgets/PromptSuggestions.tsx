import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement } from 'react';
import { usePromptSuggestions } from 'react-instantsearch-core';

import type {
  Pragma,
  PromptSuggestionsClassNames,
  PromptSuggestionsTranslations,
} from 'instantsearch-ui-components';

const PromptSuggestionsUiComponent = createPromptSuggestionsComponent({
  createElement: createElement as Pragma,
});

export type PromptSuggestionsProps = {
  agentId: string;
  loadingComponent?: () => JSX.Element;
  classNames?: Partial<PromptSuggestionsClassNames>;
  translations?: Partial<PromptSuggestionsTranslations>;
};

export function PromptSuggestions({
  agentId,
  loadingComponent,
  classNames,
  translations,
}: PromptSuggestionsProps) {
  const { suggestions, status, suggestionsClickCallback } =
    usePromptSuggestions({
      agentId,
    });

  return (
    <PromptSuggestionsUiComponent
      status={status}
      suggestions={suggestions}
      onSuggestionClick={suggestionsClickCallback}
      loadingComponent={loadingComponent}
      classNames={classNames}
      translations={translations}
    />
  );
}
