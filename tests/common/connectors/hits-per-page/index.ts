import type { HitsPerPageWidget } from 'instantsearch.js/es/widgets/hits-per-page/hits-per-page';
import type { TestOptions, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<HitsPerPageWidget>[0];
export type HitsPerPageConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHitsPerPageConnectorTests(
  setup: HitsPerPageConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('HitsPerPage connector common tests', () => {
    createRoutingTests(setup, { act, skippedTests });
  });
}
