import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';
import { createTemplatesTests } from './templates';

import type { TestOptions, TestSetup } from '../../common';
import type { RefinementSuggestionsConnectorParams } from 'instantsearch.js/es/connectors/refinement-suggestions/connectRefinementSuggestions';
import type { RefinementSuggestionsWidget } from 'instantsearch.js/es/widgets/refinement-suggestions/refinement-suggestions';
import type { RefinementSuggestionsProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<RefinementSuggestionsWidget>[0];
export type JSRefinementSuggestionsWidgetParams = Omit<
  JSBaseWidgetParams,
  'container'
> &
  RefinementSuggestionsConnectorParams;
export type ReactRefinementSuggestionsWidgetParams = RefinementSuggestionsProps;

type RefinementSuggestionsWidgetParams = {
  javascript: JSRefinementSuggestionsWidgetParams;
  react: ReactRefinementSuggestionsWidgetParams;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createRefinementSuggestionsWidgetTests: RefinementSuggestionsWidgetParams;
  }
}

export type RefinementSuggestionsWidgetSetup = TestSetup<{
  widgetParams: RefinementSuggestionsWidgetParams;
}>;

export function createRefinementSuggestionsWidgetTests(
  setup: RefinementSuggestionsWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe(
    'RefinementSuggestions widget common tests',
    skippedTests,
    () => {
      createOptionsTests(setup, { act, skippedTests, flavor });
      createTemplatesTests(setup, { act, skippedTests, flavor });
    }
  );
}
createRefinementSuggestionsWidgetTests.flavored = true;
