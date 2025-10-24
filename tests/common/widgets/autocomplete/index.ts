import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { AutocompleteConnectorParams } from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';
import type { AutocompleteWidget } from 'instantsearch.js/src/widgets/autocomplete/autocomplete';
import type { AutocompleteProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<AutocompleteWidget>[0];
export type JSAutocompleteWidgetParams = Omit<JSBaseWidgetParams, 'container'> &
  AutocompleteConnectorParams;
export type ReactAutocompleteWidgetParams = AutocompleteProps<any>;

type AutocompleteWidgetParams = {
  javascript: JSAutocompleteWidgetParams;
  react: ReactAutocompleteWidgetParams;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createAutocompleteWidgetTests: AutocompleteWidgetParams;
  }
}

export type AutocompleteWidgetSetup = TestSetup<{
  widgetParams: AutocompleteWidgetParams;
}>;

export function createAutocompleteWidgetTests(
  setup: AutocompleteWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('Autocomplete widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
  });
}
createAutocompleteWidgetTests.flavored = true;
