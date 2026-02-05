import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';
import { createTemplatesTests } from './templates';

import type { TestOptions, TestSetup } from '../../common';
import type { FilterSuggestionsConnectorParams } from 'instantsearch.js/es/connectors/filter-suggestions/connectFilterSuggestions';
import type { FilterSuggestionsWidget } from 'instantsearch.js/es/widgets/filter-suggestions/filter-suggestions';
import type { FilterSuggestionsProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<FilterSuggestionsWidget>[0];
export type JSFilterSuggestionsWidgetParams = Omit<
  JSBaseWidgetParams,
  'container'
> &
  FilterSuggestionsConnectorParams;
export type ReactFilterSuggestionsWidgetParams = FilterSuggestionsProps;

type FilterSuggestionsWidgetParams = {
  javascript: JSFilterSuggestionsWidgetParams;
  react: ReactFilterSuggestionsWidgetParams;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createFilterSuggestionsWidgetTests: FilterSuggestionsWidgetParams;
  }
}

export type FilterSuggestionsWidgetSetup = TestSetup<{
  widgetParams: FilterSuggestionsWidgetParams;
}>;

export function createFilterSuggestionsWidgetTests(
  setup: FilterSuggestionsWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe(
    'FilterSuggestions widget common tests',
    skippedTests,
    () => {
      createOptionsTests(setup, { act, skippedTests, flavor });
      createTemplatesTests(setup, { act, skippedTests, flavor });
    }
  );
}
createFilterSuggestionsWidgetTests.flavored = true;
