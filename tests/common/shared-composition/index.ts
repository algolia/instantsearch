import { fakeAct } from '../common';

import { createSearchableTests } from './searchable';

import type { TestOptions, TestSetup } from '../common';
import type { RefinementListWidget } from 'instantsearch.js/es/widgets/refinement-list/refinement-list';

export type SharedCompositionSetup = TestSetup<{
  widgetParams: {
    refinementList: Omit<Parameters<RefinementListWidget>[0], 'container'>;
  };
}>;

export function createSharedCompositionTests(
  setup: SharedCompositionSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Shared composition common tests', () => {
    createSearchableTests(setup, { act, skippedTests, flavor });
  });
}
