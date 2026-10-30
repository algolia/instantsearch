import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type {
  CompareConnectorParams,
  CompareItem,
} from 'instantsearch.js/es/connectors/compare/connectCompare';

/**
 * Setup-only params, not forwarded to the connector:
 * - `products`: records for which the setup renders buttons (add, remove,
 *   toggle) calling the matching render-state function, so the suite can drive
 *   the shared selection. See `options.ts` for the `data-testid`s.
 * - `renderChat`: whether a `chat` is mounted on the index (`true` by default)
 *   so `compare()` has a target.
 */
export type CompareConnectorSetupParams = CompareConnectorParams & {
  products?: CompareItem[];
  renderChat?: boolean;
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
    // The setup mounts a `chat`, and a chat restores its conversation from
    // `sessionStorage`: without this it inherits whatever the chat suites left
    // behind in the same file.
    sessionStorage.clear();
  });

  skippableDescribe('Compare connector common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
  });
}
