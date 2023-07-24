import { fakeAct } from '../../common';

import { createRoutingTests } from './routing';

import type { TestOptions, TestSetup } from '../../common';
import type { RefinementListWidget } from 'instantsearch.js/es/widgets/refinement-list/refinement-list';

type WidgetParams = Parameters<RefinementListWidget>[0];
export type RefinementListConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRefinementListConnectorTests(
  setup: RefinementListConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RefinementList connector common tests', () => {
    createRoutingTests(setup, { act, skippedTests });
  });
}
