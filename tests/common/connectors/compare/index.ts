import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type {
  CompareConnectorParams,
  CompareItem,
} from 'instantsearch.js/es/connectors/compare/connectCompare';

/**
 * `products` are the records for which the setup renders buttons (add, remove,
 * toggle) calling the matching render-state function, so the suite can drive
 * the shared selection. See `options.ts` for the `data-testid`s.
 */
export type CompareConnectorSetupParams = CompareConnectorParams & {
  products?: CompareItem[];
};

export type CompareConnectorSetup = TestSetup<{
  widgetParams: CompareConnectorSetupParams;
}>;

export function createCompareConnectorTests(
  setup: CompareConnectorSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('Compare connector common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
  });
}
