import { fakeAct } from '../../common';

import { createRoutingTests } from './routing';

import type { TestSetup, TestOptions } from '../../common';
import type { CurrentRefinementsWidget } from 'instantsearch.js';

type WidgetParams = Parameters<CurrentRefinementsWidget>[0];
export type CurrentRefinementsConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createCurrentRefinementsConnectorTests(
  setup: CurrentRefinementsConnectorSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('CurrentRefinements connector common tests', () => {
    createRoutingTests(setup, { act, skippedTests, flavor });
  });
}
