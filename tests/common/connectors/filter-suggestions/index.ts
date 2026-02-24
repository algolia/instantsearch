import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { FilterSuggestionsConnectorParams } from 'instantsearch.js/es/connectors/filter-suggestions/connectFilterSuggestions';

export type FilterSuggestionsConnectorSetup = TestSetup<{
  widgetParams: FilterSuggestionsConnectorParams;
}>;

export function createFilterSuggestionsConnectorTests(
  setup: FilterSuggestionsConnectorSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('FilterSuggestions connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
  });
}
