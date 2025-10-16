import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { AutocompleteWidget } from 'instantsearch.js/es/widgets/autocomplete/autocomplete';

type WidgetParams = Parameters<AutocompleteWidget>[0];
export type AutocompleteWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createAutocompleteWidgetTests(
  setup: AutocompleteWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('Autocomplete widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
