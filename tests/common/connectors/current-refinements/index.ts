import type { CurrentRefinementsWidget } from 'instantsearch.js/es/widgets/current-refinements/current-refinements';
import type { TestSetup, TestOptions } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<CurrentRefinementsWidget>[0];
export type CurrentRefinementsConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createCurrentRefinementsConnectorTests(
  setup: CurrentRefinementsConnectorSetup,
  act = fakeAct,
  { skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('CurrentRefinements connector common tests', () => {
    createRoutingTests(setup, act, skippedTests);
  });
}
