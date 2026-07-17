import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';
import { createTemplatesTests } from './templates';

import type { TestOptions, TestSetup } from '../../common';
import type { OnPageSuggestionsConnectorParams } from 'instantsearch.js/es/connectors/on-page-suggestions/connectOnPageSuggestions';
import type { OnPageSuggestionsWidget } from 'instantsearch.js/es/widgets/on-page-suggestions/on-page-suggestions';
import type { OnPageSuggestionsProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<OnPageSuggestionsWidget>[0];
export type JSOnPageSuggestionsWidgetParams = Omit<
  JSBaseWidgetParams,
  'container'
> &
  OnPageSuggestionsConnectorParams;
export type ReactOnPageSuggestionsWidgetParams = OnPageSuggestionsProps;

type OnPageSuggestionsWidgetParams = {
  javascript: JSOnPageSuggestionsWidgetParams;
  react: ReactOnPageSuggestionsWidgetParams;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createOnPageSuggestionsWidgetTests: OnPageSuggestionsWidgetParams;
  }
}

export type OnPageSuggestionsWidgetSetup = TestSetup<{
  widgetParams: OnPageSuggestionsWidgetParams;
}>;

export function createOnPageSuggestionsWidgetTests(
  setup: OnPageSuggestionsWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe(
    'OnPageSuggestions widget common tests',
    skippedTests,
    () => {
      createOptionsTests(setup, { act, skippedTests, flavor });
      createTemplatesTests(setup, { act, skippedTests, flavor });
    }
  );
}
createOnPageSuggestionsWidgetTests.flavored = true;
