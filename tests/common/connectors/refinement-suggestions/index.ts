import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { RefinementSuggestionsConnectorParams } from 'instantsearch.js/es/connectors/refinement-suggestions/connectRefinementSuggestions';

export type RefinementSuggestionsConnectorSetup = TestSetup<{
  widgetParams: RefinementSuggestionsConnectorParams;
}>;

export function createRefinementSuggestionsConnectorTests(
  setup: RefinementSuggestionsConnectorSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RefinementSuggestions connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
  });
}
